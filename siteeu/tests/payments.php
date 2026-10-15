<?php
declare(strict_types=1);
define('AYUBOWAN_API',true);
require __DIR__ . '/../php/core.php';
require __DIR__ . '/../php/payments.php';
$passed=0;
function ok(bool $condition,string $message='Assertion failed'):void {if(!$condition)throw new RuntimeException($message);}
function fails(callable $run):void {try{$run();}catch(Throwable){return;}throw new RuntimeException('Expected failure');}
function check(string $name,callable $run):void {global $passed;$run();$passed++;echo "PASS $name\n";}
function fixture():array {
    $db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    $db->exec("CREATE TABLE inquiries (id TEXT PRIMARY KEY,email TEXT,travel_date TEXT,guests INTEGER,locale TEXT,status TEXT)");
    $db->exec("INSERT INTO inquiries VALUES ('AYB-123456ABCDEF','traveller@example.invalid','2100-01-01',2,'en','contacted')");paymentSchema($db);
    $body=['inquiryId'=>'AYB-123456ABCDEF','title'=>'A Barcelona day just for you','providerName'=>'Example independent guide','providerContact'=>'guide@example.invalid','itinerary'=>'A private three-hour walking itinerary. Full total EUR 180.25 including applicable fees and taxes. No attraction tickets.','terms'=>'Full payment confirms the booking. These are synthetic test terms, never an actual offer.','amount'=>'180.25','validDays'=>3,'confirmed'=>true];
    $q=normaliseQuote($body)+['id'=>'AYQ-123456ABCDEF1234','token'=>str_repeat('a',64),'created_at'=>gmdate('c'),'terms_version'=>PAYMENT_TERMS_VERSION];
    $keys=array_keys($q);$db->prepare('INSERT INTO payment_quotes ('.implode(',',$keys).') VALUES ('.implode(',',array_fill(0,count($keys),'?')).')')->execute(array_values($q));
    return [$db,quoteByToken($db,$q['token']),['enabled'=>true,'secret_key'=>'sk_test_fixture','webhook_secret'=>'whsec_fixture','seller'=>'TIPSTOTRIP TECHNOLOGIES S.L.'],$body];
}
function session(array $q,string $id='cs_test_fixture'):array {return ['id'=>$id,'mode'=>'payment','livemode'=>false,'client_reference_id'=>$q['id'],'metadata'=>['quote_id'=>$q['id']],'amount_total'=>(int)$q['amount_cents'],'currency'=>'eur','status'=>'open','payment_status'=>'unpaid','url'=>'https://checkout.stripe.com/c/pay/test_fixture','expires_at'=>time()+3600];}
function event(string $type,string $id,array $object):array {return ['id'=>$id,'livemode'=>false,'type'=>$type,'data'=>['object'=>$object]];}
function refunds(array $charge,string $status='succeeded'):array{return ['has_more'=>false,'data'=>[['id'=>'re_fixture','charge'=>$charge['id'],'currency'=>'eur','amount'=>$charge['amount_refunded'],'status'=>$status]]];}

check('EUR amounts reject floats, exponent notation, rounding, zero and out-of-range charges',function(){
    ok(quoteAmount('180.25')===18025);ok(quoteAmount('1')===100);ok(quoteAmount('10000.00')===1000000);
    foreach([180.25,'0','0.99','10000.01','180.255','1e3','01.00','-1','NaN',' 100 ',null] as $value)fails(fn()=>quoteAmount($value));
});
check('only complete provider-confirmed owner quotes can be created; public views exclude contact data and tokens',function(){
    [$db,$q,$c,$body]=fixture();ok(paymentsReady($c));ok(!paymentsReady(array_replace($c,['webhook_secret'=>''])));ok(!paymentsReady(array_replace($c,['enabled'=>false])));
    foreach([['confirmed'=>false],['validDays'=>0],['validDays'=>15],['providerName'=>''],['terms'=>'short'],['amount'=>'1.001'],['price'=>1]] as $change)fails(fn()=>normaliseQuote(array_replace($body,$change)));
    $view=publicQuote($q,true);foreach(['email','token','payment_intent'] as $field)ok(!array_key_exists($field,$view));
    foreach([str_repeat('b',64),'bad',null] as $token)fails(fn()=>quoteByToken($db,$token));
    $q['id']='AYQ-FFFFFFFFFFFFFFFF';$q['token']=str_repeat('b',64);unset($q['email'],$q['travel_date'],$q['guests'],$q['locale']);
    fails(function()use($db,$q){$keys=array_keys($q);$db->prepare('INSERT INTO payment_quotes ('.implode(',',$keys).') VALUES ('.implode(',',array_fill(0,count($keys),'?')).')')->execute(array_values($q));});
});
check('webhook signatures reject tampering, missing signatures, stale and future timestamps and accept rotation',function(){
    $raw='{"id":"evt_fixture"}';$secret='whsec_fixture';$now=time();$signature=hash_hmac('sha256',$now.'.'.$raw,$secret);
    ok(verifyStripeSignature($raw,"t=$now,v1=$signature",$secret,$now));
    ok(verifyStripeSignature($raw,"t=$now,v1=".str_repeat('0',64).",v1=$signature",$secret,$now));
    ok(!verifyStripeSignature($raw.' ',"t=$now,v1=$signature",$secret,$now));ok(!verifyStripeSignature($raw,'',$secret,$now));
    foreach([$now-301,$now+301] as $time){$sig=hash_hmac('sha256',$time.'.'.$raw,$secret);ok(!verifyStripeSignature($raw,"t=$time,v1=$sig",$secret,$now));}
});
check('checkout uses stored price, immutable terms, receipt email, safe return URLs and one reusable session',function(){
    [$db,$q,$c]=fixture();$post=0;$remote=session($q);
    $GLOBALS['ayubowanStripeTestTransport']=function($method,$path,$data,$key)use(&$post,$remote,$q){
        if($method==='POST'){$post++;ok($data['line_items'][0]['price_data']['unit_amount']===18025);ok($data['payment_intent_data']['receipt_email']==='traveller@example.invalid');ok($data['success_url']===paymentPage($q));ok(str_contains($data['success_url'],'#'.$q['token']));ok(!str_contains(json_encode($data['metadata']),$q['token']));ok(str_ends_with($key,'/0'));}
        return $remote;
    };
    ok(isset(createCheckout($db,$c,$q)['url']));ok(isset(createCheckout($db,$c,$q)['url']));ok($post===1);ok(count(quoteSessions($db,$q['id']))===1);ok(quoteByToken($db,$q['token'])['accepted_at']!==null);
    $remote['status']='complete';$remote['payment_status']='paid';$remote['payment_intent']='pi_fixture';
    $GLOBALS['ayubowanStripeTestTransport']=fn()=>$remote;
    ok(createCheckout($db,$c,$q)['paid']===true);ok(quoteByToken($db,$q['token'])['status']==='paid');
    ok($db->query('SELECT status FROM inquiries')->fetchColumn()==='confirmed');
});
check('an uncertain Stripe timeout retries with identical parameters and idempotency key',function(){
    [$db,$q,$c]=fixture();$calls=[];$remote=session($q);
    $GLOBALS['ayubowanStripeTestTransport']=function($method,$path,$data,$key)use(&$calls,$remote){$calls[]=[$data,$key];if(count($calls)===1)throw new RuntimeException('Simulated timeout');return $remote;};
    fails(fn()=>createCheckout($db,$c,$q));ok((int)$db->query('SELECT COUNT(*) FROM payment_attempts')->fetchColumn()===1);
    ok(isset(createCheckout($db,$c,$q)['url']));ok($calls[0]===$calls[1]);
});
check('expired sessions can be renewed with a new generation and paid or unavailable quotes cannot be charged again',function(){
    [$db,$q,$c]=fixture();$remote=session($q);$GLOBALS['ayubowanStripeTestTransport']=fn()=>$remote;createCheckout($db,$c,$q);
    $GLOBALS['ayubowanStripeTestTransport']=function($method,$path,$data,$key)use($q){if($method==='GET')return array_replace(session($q),['status'=>'expired']);ok(str_ends_with($key,'/1'));return session($q,'cs_test_renewed');};
    createCheckout($db,$c,$q);ok(count(quoteSessions($db,$q['id']))===2);
    $db->exec("UPDATE payment_quotes SET status='cancelled'");fails(fn()=>createCheckout($db,$c,$q));
    $db->exec("UPDATE payment_quotes SET status='open',expires_at=1");fails(fn()=>createCheckout($db,$c,$q));
});
check('amount/currency/mode/reference mismatches cannot mark a booking paid; unverified redirects have no authority',function(){
    [$db,$q,$c]=fixture();$paid=array_replace(session($q),['status'=>'complete','payment_status'=>'paid','payment_intent'=>'pi_fixture']);
    foreach([['amount_total'=>1],['currency'=>'usd'],['livemode'=>true],['client_reference_id'=>'other'],['metadata'=>['quote_id'=>'other']],['mode'=>'setup']] as $change)fails(fn()=>applyPaymentSession($db,$c,$q,array_replace($paid,$change)));
    applyPaymentSession($db,$c,$q,session($q));ok(quoteByToken($db,$q['token'])['status']==='open');
});
check('duplicate and delayed webhooks safely confirm once; incomplete or wrong-mode events do not confirm',function(){
    [$db,$q,$c]=fixture();$remote=session($q);$GLOBALS['ayubowanStripeTestTransport']=fn()=>$remote;createCheckout($db,$c,$q);
    processPaymentEvent($db,$c,event('checkout.session.completed','evt_unpaid',['id'=>$remote['id']]));ok(quoteByToken($db,$q['token'])['status']==='open');
    $remote=array_replace($remote,['status'=>'complete','payment_status'=>'paid','payment_intent'=>'pi_fixture']);$calls=0;
    $GLOBALS['ayubowanStripeTestTransport']=function()use(&$calls,$remote){$calls++;return $remote;};
    $e=event('checkout.session.completed','evt_paid',['id'=>$remote['id']]);processPaymentEvent($db,$c,$e);processPaymentEvent($db,$c,$e);ok($calls===1);ok(quoteByToken($db,$q['token'])['status']==='paid');
    fails(fn()=>processPaymentEvent($db,$c,array_replace($e,['id'=>'evt_live','livemode'=>true])));
});
check('webhook network failures remain retryable and are not recorded as processed',function(){
    [$db,$q,$c]=fixture();$remote=session($q);$GLOBALS['ayubowanStripeTestTransport']=fn()=>$remote;createCheckout($db,$c,$q);
    $GLOBALS['ayubowanStripeTestTransport']=function(){throw new RuntimeException('Simulated network failure');};
    fails(fn()=>processPaymentEvent($db,$c,event('checkout.session.completed','evt_retry',['id'=>$remote['id']])));
    ok((int)$db->query('SELECT COUNT(*) FROM payment_events')->fetchColumn()===0);
});
check('partial/full refunds synchronize and delayed paid events cannot undo a refund',function(){
    [$db,$q,$c]=fixture();$remote=session($q);$GLOBALS['ayubowanStripeTestTransport']=fn()=>$remote;createCheckout($db,$c,$q);
    $paid=array_replace($remote,['status'=>'complete','payment_status'=>'paid','payment_intent'=>'pi_fixture']);applyPaymentSession($db,$c,$q,$paid);
    $charge=['id'=>'ch_fixture','payment_intent'=>'pi_fixture','amount'=>18025,'currency'=>'eur','livemode'=>false,'amount_refunded'=>5000];
    $GLOBALS['ayubowanStripeTestTransport']=fn($method,$path)=>$path==='/refunds'?refunds($charge):$charge;processPaymentEvent($db,$c,event('charge.refunded','evt_partial',['id'=>'ch_fixture']));ok(quoteByToken($db,$q['token'])['status']==='partially_refunded');
    $charge['amount_refunded']=18025;$GLOBALS['ayubowanStripeTestTransport']=fn($method,$path)=>$path==='/refunds'?refunds($charge):$charge;processPaymentEvent($db,$c,event('charge.refunded','evt_full',['id'=>'ch_fixture']));
    applyPaymentSession($db,$c,quoteByToken($db,$q['token']),$paid);$q=quoteByToken($db,$q['token']);ok($q['status']==='refunded');ok((int)$q['refunded_cents']===18025);
});
check('refund delivered before checkout completion recovers the verified payment and stays refunded',function(){
    [$db,$q,$c]=fixture();$remote=session($q);$GLOBALS['ayubowanStripeTestTransport']=fn()=>$remote;createCheckout($db,$c,$q);
    $paid=array_replace($remote,['status'=>'complete','payment_status'=>'paid','payment_intent'=>'pi_fixture']);
    $charge=['id'=>'ch_fixture','payment_intent'=>'pi_fixture','amount'=>18025,'currency'=>'eur','livemode'=>false,'amount_refunded'=>18025];
    $GLOBALS['ayubowanStripeTestTransport']=function($method,$path)use($paid,$charge,$q){if($path==='/refunds')return refunds($charge);if(str_starts_with($path,'/charges/'))return $charge;if(str_starts_with($path,'/payment_intents/'))return ['metadata'=>['quote_id'=>$q['id']]];return $paid;};
    processPaymentEvent($db,$c,event('charge.refunded','evt_refundfirst',['id'=>'ch_fixture']));
    ok(quoteByToken($db,$q['token'])['status']==='refunded');
    processPaymentEvent($db,$c,event('checkout.session.completed','evt_paidlater',['id'=>$paid['id']]));ok(quoteByToken($db,$q['token'])['status']==='refunded');
});
check('pending and failed refunds are distinguished from completed refunds using current Stripe records',function(){
    [$db,$q,$c]=fixture();$paid=array_replace(session($q),['status'=>'complete','payment_status'=>'paid','payment_intent'=>'pi_fixture']);applyPaymentSession($db,$c,$q,$paid);
    $charge=['id'=>'ch_fixture','payment_intent'=>'pi_fixture','amount'=>18025,'currency'=>'eur','livemode'=>false,'amount_refunded'=>18025];
    $refundStatus='pending';
    $GLOBALS['ayubowanStripeTestTransport']=function($method,$path)use($charge,&$refundStatus){if($path==='/refunds')return refunds($charge,$refundStatus);if(str_starts_with($path,'/refunds/'))return ['id'=>'re_fixture','charge'=>'ch_fixture'];return $charge;};
    processPaymentEvent($db,$c,event('refund.created','evt_pending',['id'=>'re_fixture']));$row=quoteByToken($db,$q['token']);ok($row['status']==='paid');ok((int)$row['refunded_cents']===0);ok((int)$row['refund_pending_cents']===18025);
    $refundStatus='failed';processPaymentEvent($db,$c,event('refund.failed','evt_failed',['id'=>'re_fixture']));$row=quoteByToken($db,$q['token']);ok((int)$row['refund_pending_cents']===0);ok((int)$row['refund_problem']===1);ok($row['status']==='paid');
    $refundStatus='succeeded';processPaymentEvent($db,$c,event('refund.updated','evt_refundupdated',['id'=>'re_fixture']));$row=quoteByToken($db,$q['token']);ok($row['status']==='refunded');ok((int)$row['refund_problem']===0);
});
unset($GLOBALS['ayubowanStripeTestTransport']);echo "$passed PHP payment groups passed. All payments were simulated in isolated memory.\n";
