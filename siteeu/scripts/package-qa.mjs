import { mkdir, cp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { experiences } from '../lib/experiences.ts';
const name='ayubowan-qa-experiences-20261014-8c74f2e1';
const directory=`qa-deployment/public_html/${name}`;
await mkdir(directory,{recursive:true});
await cp('php/router.php', `${directory}/router.php`);
await cp('php/core.php', `${directory}/core.php`);
await cp('php/payments.php', `${directory}/payments.php`);
await writeFile(`${directory}/catalog.json`,JSON.stringify(Object.fromEntries(experiences.map(x=>[x.slug,{price:x.price,category:x.category}]))));
await writeFile(`${directory}/index.php`,`<?php
declare(strict_types=1);
$endpoint = $_GET['endpoint'] ?? '';
if (!in_array($endpoint,['inquiries','studio/inquiries','studio/session'],true)) {http_response_code(404);exit;}
$private = dirname(__DIR__,2) . '/${name}-private';
umask(0077);
if (!is_dir($private)) mkdir($private,0700);
if (!is_file($private . '/config.php')) file_put_contents($private . '/config.php','<?php return ' . var_export(['owner_password_hash'=>password_hash('temporary-qa-only-password', PASSWORD_DEFAULT)],true) . ';');
define('AYUBOWAN_DATA_DIRECTORY',$private);
$_SERVER['REQUEST_URI'] = '/api/' . $endpoint;
require __DIR__ . '/router.php';
`);
execFileSync('zip',['-qr','../ayubowan-siteeu-experiences-qa-20261014.zip',`public_html/${name}`],{cwd:'qa-deployment'});
console.log('Packaged isolated QA API. It uses a separate private database and no email service.');
