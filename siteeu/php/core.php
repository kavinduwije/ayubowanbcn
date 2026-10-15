<?php
declare(strict_types=1);

if (!defined('AYUBOWAN_API')) { http_response_code(404); exit; }

// PHP 8.2+ on Site.eu. No provider credentials belong in this public file.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

function reply(array $body, int $status = 200): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
function requireOrigin(): void {
    if (($_SERVER['HTTP_ORIGIN'] ?? '') !== 'https://ayubowanbarcelona.es'
        || ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
        reply(['error' => 'Please submit your enquiry from this website.'], 403);
    }
}
function requestBody(int $limit = 16384): array {
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        reply(['error' => 'Send a JSON request.'], 415);
    }
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > $limit) reply(['error' => 'Your request is too long.'], 400);
    $stream = fopen('php://input', 'rb');
    $raw = stream_get_contents($stream, $limit + 1);
    fclose($stream);
    if (strlen($raw) > $limit) reply(['error' => 'Your request is too long.'], 400);
    try { $value = json_decode($raw, true, 16, JSON_THROW_ON_ERROR); }
    catch (Throwable) { reply(['error' => 'Please check your request.'], 400); }
    if (!is_array($value) || array_is_list($value)) reply(['error' => 'Please check your request.'], 400);
    return $value;
}
function validText(array $data, string $key, int $min, int $max, string $default = ''): string {
    $value = $data[$key] ?? $default;
    if (!is_string($value)) throw new InvalidArgumentException('Invalid text');
    $value = trim($value);
    if (mb_strlen($value) < $min || mb_strlen($value) > $max) throw new InvalidArgumentException('Invalid text length');
    return $value;
}
function normaliseInquiry(array $data, array $catalog): array {
    $keys = ['name','email','phone','date','guests','language','vehicle','experiences','message','consent','locale','website','requestId'];
    if (array_diff(array_keys($data), $keys)) throw new InvalidArgumentException('Unexpected fields');
    $data['name'] = validText($data, 'name', 2, 100);
    $data['email'] = validText($data, 'email', 3, 254);
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('Invalid email');
    $data['phone'] = validText($data, 'phone', 0, 32);
    if (!preg_match('/^[+\d\s()\-]*$/D', $data['phone'])) throw new InvalidArgumentException('Invalid phone');
    $data['message'] = validText($data, 'message', 0, 2500);
    $data['website'] = validText($data, 'website', 0, 200);
    if ($data['website'] !== '') throw new InvalidArgumentException('Spam');
    $date = $data['date'] ?? '';
    if (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date)) throw new InvalidArgumentException('Invalid date');
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date, new DateTimeZone('UTC'));
    if (!$parsed || $parsed->format('Y-m-d') !== $date || $date < gmdate('Y-m-d')) throw new InvalidArgumentException('Past or impossible date');
    if (!is_int($data['guests'] ?? null) || $data['guests'] < 1 || $data['guests'] > 20) throw new InvalidArgumentException('Invalid group');
    if (!in_array($data['language'] ?? null, ['English','Sinhala','Tamil','Spanish'], true)) throw new InvalidArgumentException('Invalid language');
    if (!in_array($data['vehicle'] ?? null, ['walking','sedan','van'], true)) throw new InvalidArgumentException('Invalid vehicle');
    if (($data['vehicle'] === 'sedan' && $data['guests'] > 3) || ($data['vehicle'] === 'van' && $data['guests'] > 7)) throw new InvalidArgumentException('Vehicle capacity');
    $choices = $data['experiences'] ?? null;
    if (!is_array($choices) || !array_is_list($choices) || count($choices) < 1 || count($choices) > count($catalog)) throw new InvalidArgumentException('Invalid choices');
    foreach ($choices as $slug) if (!is_string($slug) || !isset($catalog[$slug])) throw new InvalidArgumentException('Unknown experience');
    if (count(array_unique($choices)) !== count($choices)) throw new InvalidArgumentException('Duplicate experiences');
    if (($data['consent'] ?? null) !== true || !in_array($data['locale'] ?? null, ['en','es'], true)) throw new InvalidArgumentException('Invalid consent or locale');
    if (!is_string($data['requestId'] ?? null) || !preg_match('/^[a-f\d]{8}-[a-f\d]{4}-[1-8][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/iD', $data['requestId'])) throw new InvalidArgumentException('Invalid request ID');
    return $data;
}
function estimate(array $data, array $catalog): int {
    // -1 means a quote is required in the existing NOT NULL integer column.
    // Keep the production schema and earlier enquiries intact; never show it as EUR.
    foreach ($data['experiences'] as $slug) {
        if ($catalog[$slug]['price'] === null) return -1;
    }
    $host = 0; $transport = 0;
    foreach ($data['experiences'] as $slug) {
        $item = $catalog[$slug]; $host += $item['price'];
        if ($data['vehicle'] !== 'walking') {
            $day = $item['category'] === 'day-trip';
            $transport += $data['vehicle'] === 'van' ? ($day ? 220 : 100) : ($day ? 140 : 60);
        }
    }
    $factor = $data['guests'] <= 2 ? 1 : ($data['guests'] <= 4 ? 1.4 : 1.8);
    return (int)round($host * $factor) + $transport;
}
function rateLimit(PDO $db, string $kind, string $salt, int $limit, int $seconds): void {
    $now = time(); $window = intdiv($now, $seconds); $expiry = ($window + 1) * $seconds;
    // REMOTE_ADDR is set by the server. Never trust caller-provided proxy/IP headers.
    $key = hash_hmac('sha256', $kind . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . ':' . $window, $salt);
    $query = $db->prepare('INSERT INTO rate_limits (key, count, expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count');
    $query->execute([$key, $expiry]); $count = (int)$query->fetchColumn();
    $query->closeCursor();
    $db->prepare('DELETE FROM rate_limits WHERE expires_at < ?')->execute([$now]);
    if ($count > $limit) {
        header('Retry-After: ' . ($expiry - $now));
        reply(['error' => 'You have sent several requests. Please wait a little before trying again.'], 429);
    }
}
function startOwnerSession(string $private): void {
    if (!is_dir($private . '/sessions')) mkdir($private . '/sessions', 0700);
    session_save_path($private . '/sessions');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', '28800');
    session_name('__Host-ayubowan_owner');
    session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
    session_start();
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}
function ownerAuthenticated(string $hash): bool {
    $ok = $hash !== '' && isset($_SESSION['owner_since'],$_SESSION['owner_seen'])
        && time() - $_SESSION['owner_since'] < 28800 && time() - $_SESSION['owner_seen'] < 1800
        && hash_equals($_SESSION['owner_hash'] ?? '', hash('sha256', $hash));
    if ($ok) $_SESSION['owner_seen'] = time();
    return $ok;
}
function requireCsrf(): void {
    requireOrigin();
    if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) reply(['error'=>'Please refresh and try again.'], 403);
}

