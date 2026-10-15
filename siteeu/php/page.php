<?php
declare(strict_types=1);

// Site.eu applies rewrite rules but ignores Apache header directives.
// Serve only generated HTML through PHP so these headers are always applied.
header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self'; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests");
header('X-Frame-Options: DENY');
header('Strict-Transport-Security: max-age=31536000');
header('Cache-Control: no-cache');

if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) {
    http_response_code(405);
    header('Allow: GET, HEAD');
    exit;
}
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
if (preg_match('#^/(?:es/)?payment(?:/|$)#', $path)) {
    header('Referrer-Policy: no-referrer');
    header('Cache-Control: no-store, private');
    header('X-Robots-Tag: noindex, nofollow');
}
$routes = json_decode(file_get_contents(__DIR__ . '/page-routes.json'), true, 512, JSON_THROW_ON_ERROR);
$file = $routes[$path] ?? null;
if ($file === null) {
    http_response_code(404);
    $file = '404.html';
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
    readfile(__DIR__ . '/' . $file);
}
