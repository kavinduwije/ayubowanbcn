<?php
declare(strict_types=1);
define('AYUBOWAN_API', true);
require_once __DIR__ . '/core.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($path, ['/api/inquiries','/api/studio/inquiries','/api/studio/session','/api/studio/quotes','/api/payments/quote','/api/payments/checkout','/api/payments/webhook'], true)) reply(['error'=>'Not found'], 404);

try {
    umask(0077);
    $private = defined('AYUBOWAN_DATA_DIRECTORY') ? AYUBOWAN_DATA_DIRECTORY : dirname(__DIR__, 2) . '/ayubowan-private';
    if (!is_dir($private) && !mkdir($private, 0700)) throw new RuntimeException('Private storage unavailable');
    $config = is_file($private . '/config.php') ? require $private . '/config.php' : [];
    $ownerHash = is_string($config['owner_password_hash'] ?? null) ? $config['owner_password_hash'] : '';
    // A long-lived secret is generated once on the host, never in browser code.
    $saltPath = $private . '/rate-salt';
    $lock = fopen($private . '/initialise.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Storage lock unavailable');
    try {
        if (!is_file($saltPath)) file_put_contents($saltPath, bin2hex(random_bytes(32)), LOCK_EX);
        $salt = trim(file_get_contents($saltPath));
        $db = new PDO('sqlite:' . $private . '/enquiries.sqlite', null, null, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
        $db->exec('PRAGMA busy_timeout=5000');
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA synchronous=FULL');
        $db->exec('CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, travel_date TEXT NOT NULL, guests INTEGER NOT NULL, language TEXT NOT NULL, vehicle TEXT NOT NULL, experiences TEXT NOT NULL, message TEXT NOT NULL, estimate_eur INTEGER NOT NULL, locale TEXT NOT NULL, consent_version TEXT NOT NULL, status TEXT NOT NULL DEFAULT \'new\', notification_status TEXT NOT NULL DEFAULT \'not_configured\', created_at TEXT NOT NULL)');
        $db->exec('CREATE INDEX IF NOT EXISTS inquiries_created_at ON inquiries(created_at)');
        $db->exec('CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL)');
        $db->exec('CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(expires_at)');
        chmod($private . '/enquiries.sqlite', 0600);
    } finally { flock($lock, LOCK_UN); fclose($lock); }

    require_once __DIR__ . '/payments.php';
    paymentSchema($db);
    $stripeConfig = paymentConfig($private);
    if ($path === '/api/payments/webhook') paymentWebhook($db, $stripeConfig);
    if (str_starts_with($path, '/api/payments/')) publicPaymentRequest($db, $stripeConfig, $path, $salt);

    if ($path === '/api/inquiries') {
        if ($method !== 'POST') {header('Allow: POST'); reply(['error'=>'Method not allowed'],405);}
        requireOrigin(); $body = requestBody();
        $catalog = json_decode(file_get_contents(__DIR__ . '/catalog.json'), true, 32, JSON_THROW_ON_ERROR);
        try { $data = normaliseInquiry($body, $catalog); }
        catch (InvalidArgumentException) {
            reply(['error'=>($body['locale'] ?? '') === 'es' ? 'Revisa los datos, la fecha, el grupo y el consentimiento de privacidad.' : 'Please check your details, travel date, group size, and privacy consent.'],400);
        }
        $find = $db->prepare('SELECT id FROM inquiries WHERE request_id=?'); $find->execute([$data['requestId']]);
        $prior = $find->fetchColumn(); $find->closeCursor();
        if ($prior) reply(['reference'=>$prior]);
        rateLimit($db, 'enquiry', $salt, 5, 3600);
        $reference = 'AYB-' . strtoupper(bin2hex(random_bytes(6)));
        $query = $db->prepare('INSERT INTO inquiries (id,request_id,name,email,phone,travel_date,guests,language,vehicle,experiences,message,estimate_eur,locale,consent_version,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING');
        $query->execute([$reference,$data['requestId'],$data['name'],$data['email'],$data['phone'],$data['date'],$data['guests'],$data['language'],$data['vehicle'],json_encode($data['experiences'],JSON_THROW_ON_ERROR),$data['message'],estimate($data,$catalog),$data['locale'],'2026-10-14-v1',gmdate('Y-m-d\TH:i:s\Z')]);
        $created = $query->rowCount() === 1;
        if (!$created) {
            $find->execute([$data['requestId']]); $reference = $find->fetchColumn(); $find->closeCursor();
            if (!$reference) throw new RuntimeException('Enquiry not saved');
        }
        // HTTP notification API is optional; saving a lead never depends on email.
        if ($created && !empty($config['resend_api_key']) && !empty($config['booking_email']) && !empty($config['email_from'])) {
            $notification = 'failed';
            try {
                $payload = ['from'=>$config['email_from'],'to'=>[$config['booking_email']],'reply_to'=>$data['email'],'subject'=>'New travel enquiry ' . $reference,'text'=>"Reference: $reference\nName: {$data['name']}\nEmail: {$data['email']}\nDate: {$data['date']}\nGuests: {$data['guests']}\nLanguage: {$data['language']}\nPhone: {$data['phone']}\nExperiences: " . implode(', ',$data['experiences']) . "\n\n" . $data['message']];
                $curl = curl_init('https://api.resend.com/emails');
                curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>8,CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_HTTPHEADER=>['Authorization: Bearer ' . $config['resend_api_key'],'Content-Type: application/json','Idempotency-Key: enquiry/' . $reference],CURLOPT_POSTFIELDS=>json_encode($payload,JSON_THROW_ON_ERROR)]);
                curl_exec($curl); $status = curl_getinfo($curl,CURLINFO_RESPONSE_CODE); curl_close($curl);
                if ($status >= 200 && $status < 300) $notification = 'sent';
            } catch (Throwable) { /* The saved enquiry stays available. */ }
            try {$db->prepare('UPDATE inquiries SET notification_status=? WHERE id=?')->execute([$notification,$reference]);} catch (Throwable) {}
        }
        reply(['reference'=>$reference], $created ? 201 : 200);
    }

    startOwnerSession($private);
    if ($path === '/api/studio/session') {
        if ($method === 'GET') reply(['configured'=>$ownerHash !== '', 'authenticated'=>ownerAuthenticated($ownerHash), 'csrf'=>$_SESSION['csrf']]);
        requireCsrf();
        if ($method === 'DELETE') {
            $_SESSION = []; session_destroy();
            setcookie(session_name(), '', ['expires'=>time()-3600,'path'=>'/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
            reply(['ok'=>true]);
        }
        if ($method !== 'POST') {header('Allow: GET, POST, DELETE');reply(['error'=>'Method not allowed'],405);}
        if ($ownerHash === '') reply(['error'=>'Owner access has not been configured.'],503);
        $body = requestBody(1024);
        rateLimit($db,'owner-login',$salt,8,900);
        if (array_keys($body) !== ['password'] || !is_string($body['password']) || strlen($body['password']) > 256 || !password_verify($body['password'],$ownerHash)) reply(['error'=>'Could not sign in with those details.'],401);
        session_regenerate_id(true);
        $_SESSION['owner_since'] = $_SESSION['owner_seen'] = time();
        $_SESSION['owner_hash'] = hash('sha256',$ownerHash); $_SESSION['csrf'] = bin2hex(random_bytes(32));
        reply(['authenticated'=>true,'csrf'=>$_SESSION['csrf']]);
    }
    if (!ownerAuthenticated($ownerHash)) reply(['error'=>'Unauthorized'],403);
    if ($path === '/api/studio/quotes') ownerPaymentRequest($db, $stripeConfig, $method);
    if ($method === 'GET') {
        $leads = $db->query('SELECT id,name,email,phone,travel_date,guests,language,vehicle,experiences,message,estimate_eur,status,notification_status,created_at FROM inquiries ORDER BY created_at DESC LIMIT 100')->fetchAll();
        reply(['inquiries'=>$leads]);
    }
    if ($method !== 'PATCH') {header('Allow: GET, PATCH');reply(['error'=>'Method not allowed'],405);}
    requireCsrf(); $body = requestBody(1024);
    if (array_diff(array_keys($body),['id','status']) || !is_string($body['id'] ?? null) || !preg_match('/^AYB-[A-F0-9]{12}$/D',$body['id']) || !in_array($body['status'] ?? null,['new','contacted','confirmed','closed'],true)) reply(['error'=>'Invalid request'],400);
    if ($body['status']==='closed') {
        $active=$db->prepare("SELECT id FROM payment_quotes WHERE inquiry_id=? AND status='open'");$active->execute([$body['id']]);$openQuote=$active->fetchColumn();$active->closeCursor();
        if ($openQuote) reply(['error'=>'Cancel the unpaid quote before closing this enquiry.'],409);
    }
    $query = $db->prepare('UPDATE inquiries SET status=? WHERE id=?'); $query->execute([$body['status'],$body['id']]);
    if ($query->rowCount() === 0) reply(['error'=>'Enquiry not found'],404);
    reply(['ok'=>true]);
} catch (Throwable) {
    // Never put visitor details, request bodies, or credentials into response/logs.
    reply(['error'=>'This service is temporarily unavailable. Please try again shortly.'],503);
}
