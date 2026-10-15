<?php
declare(strict_types=1);
// Local test server only. This file is never packaged or deployed.
if (PHP_SAPI!=='cli-server' || !in_array($_SERVER['REMOTE_ADDR'] ?? '',['127.0.0.1','::1'],true)) {http_response_code(403);exit;}
$private=getenv('AYUBOWAN_TEST_PRIVATE_PATH');
if (!$private || !str_starts_with(realpath($private) ?: '',realpath(sys_get_temp_dir()))) {http_response_code(503);exit;}
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if (str_starts_with($path,'/api/')) {
    if (($_SERVER['HTTP_ORIGIN'] ?? '')==='http://' . ($_SERVER['HTTP_HOST'] ?? '')) $_SERVER['HTTP_ORIGIN']='https://ayubowanbarcelona.es';
    define('AYUBOWAN_DATA_DIRECTORY',$private);require __DIR__.'/../deployment/public_html/api/router.php';exit;
}
$root=realpath(__DIR__.'/../deployment/public_html');$file=realpath($root.$path);
if ($file && str_starts_with($file,$root.'/') && is_file($file) && !str_ends_with($file,'.php') && !str_ends_with($file,'.json')) {
    $extension=pathinfo($file,PATHINFO_EXTENSION);$types=['css'=>'text/css','js'=>'application/javascript','webp'=>'image/webp','svg'=>'image/svg+xml','woff2'=>'font/woff2','txt'=>'text/plain','xml'=>'application/xml','html'=>'text/html'];header('Content-Type: '.($types[$extension] ?? 'application/octet-stream'));readfile($file);exit;
}
chdir($root);require $root.'/page.php';
