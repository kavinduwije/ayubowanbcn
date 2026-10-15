<?php
declare(strict_types=1);
if (!defined('AYUBOWAN_API')) { http_response_code(404); exit; }

// Loaded by router.php. Stripe credentials live outside the public document root.
const STRIPE_API_VERSION = '2025-09-30.clover';
const PAYMENT_TERMS_VERSION = '2026-10-15-stripe-v1';

function paymentConfig(string $private): array {
    $value = is_file($private . '/stripe.php') ? require $private . '/stripe.php' : [];
    return is_array($value) ? $value : [];
}
function paymentsReady(array $config): bool {
    return ($config['enabled'] ?? false) === true
        && preg_match('/^(sk|rk)_(live|test)_\S+$/D', $config['secret_key'] ?? '') === 1
        && preg_match('/^whsec_\S+$/D', $config['webhook_secret'] ?? '') === 1
        && ($config['seller'] ?? '') === 'TIPSTOTRIP TECHNOLOGIES S.L.';
}
function paymentSchema(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS payment_quotes (
        id TEXT PRIMARY KEY, inquiry_id TEXT NOT NULL, token TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL, provider_name TEXT NOT NULL, provider_contact TEXT NOT NULL,
        itinerary TEXT NOT NULL, terms TEXT NOT NULL, amount_cents INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'eur', status TEXT NOT NULL DEFAULT 'open',
        expires_at INTEGER NOT NULL, created_at TEXT NOT NULL, accepted_at TEXT,
        terms_version TEXT NOT NULL, generation INTEGER NOT NULL DEFAULT 0,
        payment_intent TEXT UNIQUE, paid_at TEXT, refunded_cents INTEGER NOT NULL DEFAULT 0,
        refund_pending_cents INTEGER NOT NULL DEFAULT 0, refund_problem INTEGER NOT NULL DEFAULT 0
    )");
    $db->exec("CREATE UNIQUE INDEX IF NOT EXISTS payment_quotes_active ON payment_quotes(inquiry_id) WHERE status IN ('open','paid','partially_refunded','disputed')");
    $db->exec('CREATE TABLE IF NOT EXISTS payment_sessions (id TEXT PRIMARY KEY, quote_id TEXT NOT NULL, generation INTEGER NOT NULL, url TEXT NOT NULL, expires_at INTEGER NOT NULL, UNIQUE(quote_id,generation))');
    $db->exec('CREATE TABLE IF NOT EXISTS payment_attempts (quote_id TEXT NOT NULL, generation INTEGER NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY(quote_id,generation))');
    $db->exec('CREATE TABLE IF NOT EXISTS payment_events (id TEXT PRIMARY KEY, type TEXT NOT NULL, processed_at TEXT NOT NULL)');
    $columns=array_column($db->query('PRAGMA table_info(payment_quotes)')->fetchAll(),'name');
    foreach (['refund_pending_cents','refund_problem'] as $column) if (!in_array($column,$columns,true)) $db->exec("ALTER TABLE payment_quotes ADD COLUMN $column INTEGER NOT NULL DEFAULT 0");
}
function stripeApi(array $config, string $method, string $path, array $data = [], ?string $idempotency = null): array {
    if (!preg_match('#^/[A-Za-z0-9_/]+$#D', $path)) throw new RuntimeException('Invalid Stripe path');
    // Test transport is injected by the isolated CLI test harness only.
    if (PHP_SAPI === 'cli' && isset($GLOBALS['ayubowanStripeTestTransport'])) {
        return ($GLOBALS['ayubowanStripeTestTransport'])($method, $path, $data, $idempotency);
    }
    $headers = ['Authorization: Bearer ' . $config['secret_key'], 'Stripe-Version: ' . STRIPE_API_VERSION];
    if ($idempotency !== null) $headers[] = 'Idempotency-Key: ' . $idempotency;
    $curl = curl_init('https://api.stripe.com/v1' . $path . ($method==='GET' && $data ? '?'.http_build_query($data,'','&',PHP_QUERY_RFC3986) : ''));
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_CONNECTTIMEOUT=>4, CURLOPT_TIMEOUT=>15, CURLOPT_HTTPHEADER=>$headers, CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS]);
    if ($method === 'POST') {
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data, '', '&', PHP_QUERY_RFC3986));
    }
    $raw = curl_exec($curl); $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE); curl_close($curl);
    if (!is_string($raw) || $status < 200 || $status >= 300) throw new RuntimeException('Stripe request failed');
    $result = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
    if (!is_array($result)) throw new RuntimeException('Invalid Stripe response');
    return $result;
}
function quoteAmount(mixed $amount): int {
    if (!is_string($amount) || !preg_match('/^(?:0|[1-9]\d{0,4})(?:\.\d{1,2})?$/D', $amount)) throw new InvalidArgumentException('Enter a EUR amount with at most two decimal places.');
    [$euros, $cents] = array_pad(explode('.', $amount), 2, '');
    $value = (int)$euros * 100 + (int)str_pad($cents, 2, '0');
    if ($value < 100 || $value > 1000000) throw new InvalidArgumentException('The full quote must be between EUR 1 and EUR 10,000.');
    return $value;
}
function normaliseQuote(array $body): array {
    $allowed = ['inquiryId','title','providerName','providerContact','itinerary','terms','amount','validDays','confirmed'];
    if (array_diff(array_keys($body), $allowed) || ($body['confirmed'] ?? null) !== true) throw new InvalidArgumentException('Confirm provider availability, the full price and booking terms.');
    $id = validText($body, 'inquiryId', 16, 16);
    if (!preg_match('/^AYB-[A-F0-9]{12}$/D', $id)) throw new InvalidArgumentException('Invalid enquiry reference.');
    if (!is_int($body['validDays'] ?? null) || $body['validDays'] < 1 || $body['validDays'] > 14) throw new InvalidArgumentException('Quote validity must be 1–14 days.');
    return ['inquiry_id'=>$id, 'title'=>validText($body,'title',5,160), 'provider_name'=>validText($body,'providerName',2,160), 'provider_contact'=>validText($body,'providerContact',5,254), 'itinerary'=>validText($body,'itinerary',20,6000), 'terms'=>validText($body,'terms',30,6000), 'amount_cents'=>quoteAmount($body['amount'] ?? null), 'expires_at'=>time()+$body['validDays']*86400];
}
function quoteByToken(PDO $db, mixed $token): array {
    if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/D', $token)) throw new InvalidArgumentException('Quote not found.');
    $q = $db->prepare('SELECT q.*, i.email, i.travel_date, i.guests, i.locale FROM payment_quotes q JOIN inquiries i ON i.id=q.inquiry_id WHERE q.token=?');
    $q->execute([$token]); $row = $q->fetch(); $q->closeCursor();
    if (!$row) throw new InvalidArgumentException('Quote not found.');
    return $row;
}
function quoteSessions(PDO $db, string $id): array {
    $q = $db->prepare('SELECT * FROM payment_sessions WHERE quote_id=? ORDER BY generation DESC');
    $q->execute([$id]); $rows = $q->fetchAll(); $q->closeCursor(); return $rows;
}
function paymentPage(array $quote): string {
    return 'https://ayubowanbarcelona.es' . ($quote['locale'] === 'es' ? '/es' : '') . '/payment/#' . $quote['token'];
}
function validStripeSession(array $config, array $quote, array $session): bool {
    return ($session['mode'] ?? '') === 'payment'
        && ($session['livemode'] ?? null) === str_contains($config['secret_key'], '_live_')
        && ($session['metadata']['quote_id'] ?? '') === $quote['id']
        && ($session['client_reference_id'] ?? '') === $quote['id']
        && ($session['amount_total'] ?? null) === (int)$quote['amount_cents']
        && ($session['currency'] ?? '') === 'eur';
}
function applyPaymentSession(PDO $db, array $config, array $quote, array $session): void {
    if (!validStripeSession($config, $quote, $session)) throw new RuntimeException('Payment verification mismatch');
    if (($session['status'] ?? '') === 'complete' && ($session['payment_status'] ?? '') === 'paid') {
        $intent = $session['payment_intent'] ?? '';
        if (!is_string($intent) || !preg_match('/^pi_[a-zA-Z0-9]+$/D', $intent)) throw new RuntimeException('Missing verified payment');
        if ($quote['payment_intent'] !== null && $quote['payment_intent'] !== $intent) throw new RuntimeException('Conflicting payment');
        $q = $db->prepare("UPDATE payment_quotes SET status=CASE WHEN status IN ('refunded','partially_refunded','disputed') THEN status ELSE 'paid' END, payment_intent=?, paid_at=COALESCE(paid_at,?) WHERE id=?");
        $q->execute([$intent,gmdate('c'),$quote['id']]);
        $db->prepare("UPDATE inquiries SET status='confirmed' WHERE id=? AND status IN ('new','contacted')")->execute([$quote['inquiry_id']]);
    }
}
function syncQuote(PDO $db, array $config, array $quote): array {
    foreach (quoteSessions($db, $quote['id']) as $saved) {
        $session = stripeApi($config, 'GET', '/checkout/sessions/' . $saved['id']);
        if (($session['id'] ?? '') !== $saved['id']) throw new RuntimeException('Session mismatch');
        applyPaymentSession($db, $config, $quote, $session);
        if (($session['payment_status'] ?? '') === 'paid') break;
    }
    return quoteByToken($db, $quote['token']);
}
function publicQuote(array $quote, bool $ready): array {
    return array_intersect_key($quote, array_flip(['id','inquiry_id','title','provider_name','provider_contact','itinerary','terms','amount_cents','currency','status','expires_at','travel_date','guests','paid_at','refunded_cents','refund_pending_cents','refund_problem','terms_version']))
        + ['seller'=>'TIPSTOTRIP TECHNOLOGIES S.L.','paymentsReady'=>$ready,'expired'=>time()>=(int)$quote['expires_at']];
}
function createCheckout(PDO $db, array $config, array $quote): array {
    $db->exec('BEGIN IMMEDIATE');
    try {
        $quote = quoteByToken($db, $quote['token']);
        if ($quote['status'] !== 'open' || (int)$quote['expires_at'] < time()+1860) throw new InvalidArgumentException('This quote is paid, cancelled or too close to expiry. Please contact Ayubowan.');
        $sessions = quoteSessions($db, $quote['id']);
        $generation = (int)$quote['generation'];
        if ($sessions) {
            $prior = stripeApi($config, 'GET', '/checkout/sessions/' . $sessions[0]['id']);
            applyPaymentSession($db, $config, $quote, $prior);
            if (($prior['payment_status'] ?? '') === 'paid') { $db->exec('COMMIT'); return ['paid'=>true]; }
            if (($prior['status'] ?? '') === 'open' && (int)($prior['expires_at'] ?? 0)>time()+30) {
                $db->exec('COMMIT'); return ['url'=>$sessions[0]['url']];
            }
            if (($prior['status'] ?? '') !== 'expired') throw new InvalidArgumentException('The previous payment is still processing. Please refresh shortly.');
            $generation = (int)$sessions[0]['generation']+1;
        }
        // Persist the exact request expiry before contacting Stripe. A timeout retry
        // must use identical parameters with the same Stripe idempotency key.
        $attempt=$db->prepare('SELECT expires_at FROM payment_attempts WHERE quote_id=? AND generation=?');
        $attempt->execute([$quote['id'],$generation]);$expires=$attempt->fetchColumn();$attempt->closeCursor();
        if ($expires===false) {
            $expires=min(time()+86400,(int)$quote['expires_at']);
            $db->prepare('INSERT INTO payment_attempts (quote_id,generation,expires_at) VALUES (?,?,?)')->execute([$quote['id'],$generation,$expires]);
            $db->exec('COMMIT');
            $db->exec('BEGIN IMMEDIATE');
            $quote=quoteByToken($db,$quote['token']);
            if ($quote['status']!=='open') throw new InvalidArgumentException('This quote is no longer available. Please refresh.');
            // Another request may have completed while this transaction restarted.
            $find=$db->prepare('SELECT url FROM payment_sessions WHERE quote_id=? AND generation=?');$find->execute([$quote['id'],$generation]);$existing=$find->fetchColumn();$find->closeCursor();
            if ($existing) {$db->exec('COMMIT');return ['url'=>$existing];}
        }
        $expires=(int)$expires;
        $page = paymentPage($quote);
        $data = ['mode'=>'payment','payment_method_types'=>['card'],'client_reference_id'=>$quote['id'],'customer_email'=>$quote['email'],
            'locale'=>$quote['locale'],'success_url'=>$page,'cancel_url'=>$page,'expires_at'=>$expires,
            'line_items'=>[['quantity'=>1,'price_data'=>['currency'=>'eur','unit_amount'=>(int)$quote['amount_cents'],'product_data'=>['name'=>$quote['title'],'description'=>'Full agreed booking price. Quote ' . $quote['id'] . '. Seller: TIPSTOTRIP TECHNOLOGIES S.L.']]]],
            'metadata'=>['quote_id'=>$quote['id'],'terms_version'=>$quote['terms_version']],
            'payment_intent_data'=>['receipt_email'=>$quote['email'],'metadata'=>['quote_id'=>$quote['id'],'terms_version'=>$quote['terms_version']]]];
        $session = stripeApi($config, 'POST', '/checkout/sessions', $data, 'ayubowan/quote/' . $quote['id'] . '/' . $generation);
        if (!validStripeSession($config,$quote,$session) || !preg_match('/^cs_(?:test_|live_)?[a-zA-Z0-9]+$/D',$session['id'] ?? '') || !preg_match('#^https://checkout\.stripe\.com/[^\s]+$#D',$session['url'] ?? '')) throw new RuntimeException('Invalid checkout response');
        $db->prepare('INSERT INTO payment_sessions (id,quote_id,generation,url,expires_at) VALUES (?,?,?,?,?)')->execute([$session['id'],$quote['id'],$generation,$session['url'],$session['expires_at']]);
        $db->prepare('UPDATE payment_quotes SET generation=?, accepted_at=COALESCE(accepted_at,?) WHERE id=?')->execute([$generation,gmdate('c'),$quote['id']]);
        $db->exec('COMMIT'); return ['url'=>$session['url']];
    } catch (Throwable $e) { $db->exec('ROLLBACK'); throw $e; }
}
function verifyStripeSignature(string $raw, string $header, string $secret, ?int $now = null): bool {
    if ($secret === '') return false;
    $timestamp = null; $signatures = [];
    foreach (explode(',', $header) as $part) {
        [$key,$value] = array_pad(explode('=',trim($part),2),2,'');
        if ($key === 't' && ctype_digit($value)) $timestamp=(int)$value;
        if ($key === 'v1' && preg_match('/^[a-f0-9]{64}$/D',$value)) $signatures[]=$value;
    }
    if ($timestamp === null || abs(($now ?? time())-$timestamp)>300) return false;
    $expected = hash_hmac('sha256', $timestamp . '.' . $raw, $secret);
    foreach ($signatures as $signature) if (hash_equals($expected,$signature)) return true;
    return false;
}
function verifiedRefundSummary(array $config, string $chargeId, int $maximum): array {
    $data=['charge'=>$chargeId,'limit'=>100];$succeeded=0;$pending=0;$problem=false;
    do {
        $page=stripeApi($config,'GET','/refunds',$data);
        if (!is_array($page['data'] ?? null) || !is_bool($page['has_more'] ?? null)) throw new RuntimeException('Invalid refund list');
        foreach ($page['data'] as $refund) {
            if (($refund['charge'] ?? '')!==$chargeId || ($refund['currency'] ?? '')!=='eur' || !is_int($refund['amount'] ?? null) || $refund['amount']<0) throw new RuntimeException('Refund mismatch');
            if (($refund['status'] ?? '')==='succeeded') $succeeded+=$refund['amount'];
            elseif (in_array($refund['status'] ?? '',['pending','requires_action'],true)) $pending+=$refund['amount'];
            elseif (in_array($refund['status'] ?? '',['failed','canceled'],true)) $problem=true;
            else throw new RuntimeException('Unknown refund status');
        }
        if ($succeeded+$pending>$maximum) throw new RuntimeException('Refund total mismatch');
        $last=end($page['data']);$cursor=$last['id'] ?? '';
        if ($page['has_more'] && (!preg_match('/^re_[A-Za-z0-9]+$/D',$cursor) || $cursor===($data['starting_after'] ?? ''))) throw new RuntimeException('Invalid refund pagination');
        $data['starting_after']=$cursor;
    } while ($page['has_more']);
    return [$succeeded,$pending,$problem && $succeeded<$maximum];
}
function processPaymentEvent(PDO $db, array $config, array $event): void {
    if (!is_string($event['id'] ?? null) || !preg_match('/^evt_[a-zA-Z0-9]+$/D',$event['id']) || ($event['livemode'] ?? null) !== str_contains($config['secret_key'],'_live_')) throw new InvalidArgumentException('Invalid payment event');
    $type = $event['type'] ?? '';
    $object = $event['data']['object'] ?? [];
    $db->exec('BEGIN IMMEDIATE');
    try {
        $seen = $db->prepare('SELECT id FROM payment_events WHERE id=?');$seen->execute([$event['id']]);$prior=$seen->fetchColumn();$seen->closeCursor();
        if ($prior) { $db->exec('COMMIT'); return; }
        if (in_array($type,['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'],true)) {
            $id = $object['id'] ?? '';
            $query=$db->prepare('SELECT q.*,i.locale FROM payment_quotes q JOIN payment_sessions s ON s.quote_id=q.id JOIN inquiries i ON i.id=q.inquiry_id WHERE s.id=?');$query->execute([is_string($id)?$id:'']);$quote=$query->fetch();$query->closeCursor();
            if ($quote) {
                $session=stripeApi($config,'GET','/checkout/sessions/' . $id);
                if (($session['id'] ?? '') !== $id) throw new RuntimeException('Session mismatch');
                applyPaymentSession($db,$config,$quote,$session);
            }
        } elseif (in_array($type,['charge.refunded','charge.dispute.created','refund.created','refund.updated','refund.failed'],true)) {
            if (str_starts_with($type,'refund.')) {
                $refundId=$object['id'] ?? '';
                if (!is_string($refundId) || !preg_match('/^re_[A-Za-z0-9]+$/D',$refundId)) throw new InvalidArgumentException('Invalid refund');
                $refund=stripeApi($config,'GET','/refunds/'.$refundId);
                if (($refund['id'] ?? '')!==$refundId) throw new RuntimeException('Refund mismatch');
                $id=$refund['charge'] ?? '';
            } else $id = $type === 'charge.refunded' ? ($object['id'] ?? '') : ($object['charge'] ?? '');
            if (!is_string($id) || !preg_match('/^ch_[a-zA-Z0-9]+$/D',$id)) throw new InvalidArgumentException('Invalid charge');
            $charge=stripeApi($config,'GET','/charges/' . $id);
            $query=$db->prepare('SELECT * FROM payment_quotes WHERE payment_intent=?');$query->execute([$charge['payment_intent'] ?? '']);$quote=$query->fetch();$query->closeCursor();
            // Stripe can deliver a refund before the checkout-completed event.
            // Recover the quote from the verified intent, then verify its saved
            // Checkout Session before recording either the payment or refund.
            if (!$quote && is_string($charge['payment_intent'] ?? null) && preg_match('/^pi_[a-zA-Z0-9]+$/D',$charge['payment_intent'])) {
                $intent=stripeApi($config,'GET','/payment_intents/' . $charge['payment_intent']);
                $quoteId=$intent['metadata']['quote_id'] ?? '';
                if (is_string($quoteId) && preg_match('/^AYQ-[A-F0-9]{16}$/D',$quoteId)) {
                    $query=$db->prepare('SELECT * FROM payment_quotes WHERE id=?');$query->execute([$quoteId]);$candidate=$query->fetch();$query->closeCursor();
                    if ($candidate) foreach (quoteSessions($db,$quoteId) as $saved) {
                        $session=stripeApi($config,'GET','/checkout/sessions/' . $saved['id']);
                        if (($session['id'] ?? '')===$saved['id'] && ($session['payment_intent'] ?? '')===$charge['payment_intent'] && ($session['payment_status'] ?? '')==='paid') {
                            applyPaymentSession($db,$config,$candidate,$session);$candidate['payment_intent']=$charge['payment_intent'];$quote=$candidate;break;
                        }
                    }
                }
            }
            if ($quote) {
                if (($charge['id'] ?? '') !== $id || ($charge['livemode'] ?? null) !== str_contains($config['secret_key'],'_live_') || ($charge['currency'] ?? '') !== 'eur' || ($charge['amount'] ?? null) !== (int)$quote['amount_cents']) throw new RuntimeException('Charge mismatch');
                [$refunded,$pending,$problem]=verifiedRefundSummary($config,$id,(int)$quote['amount_cents']);
                $status = $type === 'charge.dispute.created' || $quote['status']==='disputed' ? 'disputed' : ($refunded === (int)$quote['amount_cents'] ? 'refunded' : ($refunded>0 ? 'partially_refunded' : 'paid'));
                $db->prepare('UPDATE payment_quotes SET status=?,refunded_cents=?,refund_pending_cents=?,refund_problem=? WHERE id=?')->execute([$status,$refunded,$pending,(int)$problem,$quote['id']]);
            }
        }
        $db->prepare('INSERT INTO payment_events (id,type,processed_at) VALUES (?,?,?)')->execute([$event['id'],$type,gmdate('c')]);
        $db->exec('COMMIT');
    } catch (Throwable $e) { $db->exec('ROLLBACK'); throw $e; }
}
function paymentWebhook(PDO $db, array $config): never {
    if (!paymentsReady($config)) reply(['error'=>'Payments unavailable'],503);
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {header('Allow: POST');reply(['error'=>'Method not allowed'],405);}
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>262144) reply(['error'=>'Invalid event'],400);
    $raw=file_get_contents('php://input',false,null,0,262145);
    if (!is_string($raw) || strlen($raw)>262144 || !verifyStripeSignature($raw,$_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '',$config['webhook_secret'])) reply(['error'=>'Invalid signature'],400);
    try {$event=json_decode($raw,true,64,JSON_THROW_ON_ERROR);if (!is_array($event)) throw new InvalidArgumentException();processPaymentEvent($db,$config,$event);}
    catch (JsonException|InvalidArgumentException) {reply(['error'=>'Invalid event'],400);}
    reply(['received'=>true]);
}
function publicPaymentRequest(PDO $db, array $config, string $path, string $salt): never {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {header('Allow: POST');reply(['error'=>'Method not allowed'],405);}
    requireOrigin();$body=requestBody(1024);
    if (array_diff(array_keys($body),$path==='/api/payments/checkout'?['token','accepted']:['token'])) reply(['error'=>'Invalid request'],400);
    rateLimit($db,'payment-public',$salt,80,900);
    try {$quote=quoteByToken($db,$body['token'] ?? null);} catch (InvalidArgumentException) {reply(['error'=>'Quote not found. Check the private link sent by Ayubowan.'],404);}
    if ($path==='/api/payments/quote') {
        if (paymentsReady($config) && $quote['status']==='open' && quoteSessions($db,$quote['id'])) $quote=syncQuote($db,$config,$quote);
        reply(['quote'=>publicQuote($quote,paymentsReady($config))]);
    }
    if (!paymentsReady($config)) reply(['error'=>'Online payment is not available. Please contact Ayubowan.'],503);
    if (($body['accepted'] ?? null)!==true) reply(['error'=>'Please accept your written quote and booking terms.'],400);
    try {reply(createCheckout($db,$config,$quote));} catch (InvalidArgumentException $e) {reply(['error'=>$e->getMessage()],409);}
}
function ownerPaymentRequest(PDO $db, array $config, string $method): never {
    if ($method==='GET') {
        $rows=$db->query('SELECT q.*,i.locale FROM payment_quotes q JOIN inquiries i ON i.id=q.inquiry_id ORDER BY q.created_at DESC LIMIT 300')->fetchAll();
        $quotes=array_map(static function($q){$q['payment_url']=paymentPage($q);unset($q['token']);return $q;},$rows);
        reply(['quotes'=>$quotes,'paymentsReady'=>paymentsReady($config),'mode'=>str_contains($config['secret_key'] ?? '', '_live_')?'live':'test']);
    }
    requireCsrf();
    if (!paymentsReady($config)) reply(['error'=>'Stripe and the signed webhook must be configured before issuing payable quotes.'],503);
    if ($method==='POST') {
        try {$quote=normaliseQuote(requestBody(16384));} catch (InvalidArgumentException $e) {reply(['error'=>$e->getMessage()],400);}
        $find=$db->prepare("SELECT locale FROM inquiries WHERE id=? AND status IN ('new','contacted','confirmed')");$find->execute([$quote['inquiry_id']]);$locale=$find->fetchColumn();$find->closeCursor();
        if (!$locale) reply(['error'=>'Open enquiry not found.'],404);
        $quote['id']='AYQ-' . strtoupper(bin2hex(random_bytes(8)));$quote['token']=bin2hex(random_bytes(32));$quote['created_at']=gmdate('c');$quote['terms_version']=PAYMENT_TERMS_VERSION;
        try {
            $keys=array_keys($quote);$query=$db->prepare('INSERT INTO payment_quotes (' . implode(',',$keys) . ') VALUES (' . implode(',',array_fill(0,count($keys),'?')) . ')');$query->execute(array_values($quote));
        } catch (PDOException $e) {if ($e->getCode()==='23000') reply(['error'=>'This enquiry already has an active or paid quote. Cancel the unpaid quote before replacing it.'],409);throw $e;}
        $quote['locale']=$locale;reply(['id'=>$quote['id'],'payment_url'=>paymentPage($quote)],201);
    }
    if ($method==='DELETE') {
        $body=requestBody(1024);
        if (array_keys($body)!==['id'] || !is_string($body['id']) || !preg_match('/^AYQ-[A-F0-9]{16}$/D',$body['id'])) reply(['error'=>'Invalid quote'],400);
        $db->exec('BEGIN IMMEDIATE');
        try {
            $find=$db->prepare('SELECT q.*,i.locale FROM payment_quotes q JOIN inquiries i ON i.id=q.inquiry_id WHERE q.id=?');$find->execute([$body['id']]);$quote=$find->fetch();$find->closeCursor();
            if (!$quote) { $db->exec('ROLLBACK');reply(['error'=>'Quote not found'],404); }
            foreach (quoteSessions($db,$quote['id']) as $saved) {
                $session=stripeApi($config,'GET','/checkout/sessions/' . $saved['id']);applyPaymentSession($db,$config,$quote,$session);
                if (($session['payment_status'] ?? '')==='paid') {$db->exec('COMMIT');reply(['error'=>'This quote has been paid. Manage any refund in Stripe.'],409);}
                if (($session['status'] ?? '')==='open') {
                    $expired=stripeApi($config,'POST','/checkout/sessions/' . $saved['id'] . '/expire',[],'ayubowan/cancel/' . $saved['id']);
                    if (($expired['status'] ?? '')!=='expired') throw new RuntimeException('Checkout not expired');
                } elseif (($session['status'] ?? '')!=='expired') throw new RuntimeException('Payment processing');
            }
            if ($quote['status']!=='open' && $quote['status']!=='cancelled') {$db->exec('ROLLBACK');reply(['error'=>'Paid quotes require a refund in Stripe.'],409);}
            $db->prepare("UPDATE payment_quotes SET status='cancelled' WHERE id=? AND status='open'")->execute([$quote['id']]);$db->exec('COMMIT');reply(['ok'=>true]);
        } catch (Throwable $e) {$db->exec('ROLLBACK');throw $e;}
    }
    header('Allow: GET, POST, DELETE');reply(['error'=>'Method not allowed'],405);
}
