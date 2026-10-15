import { cp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { experiences } from '../lib/experiences.ts';

const root = resolve('deployment');
await rm(`${root}/public_html`, {recursive:true, force:true});
await rm(resolve('ayubowan-siteeu.zip'), {force:true});
await mkdir(`${root}/public_html/api`, {recursive:true});
await cp('out', `${root}/public_html`, {recursive:true});
await cp('php/router.php', `${root}/public_html/api/router.php`);
await cp('php/core.php', `${root}/public_html/api/core.php`);
await cp('php/payments.php', `${root}/public_html/api/payments.php`);
await cp('php/site.htaccess', `${root}/public_html/.htaccess`);
await cp('php/page.php', `${root}/public_html/page.php`);
await writeFile(`${root}/public_html/api/catalog.json`, JSON.stringify(Object.fromEntries(experiences.map(x=>[x.slug,{price:x.price,category:x.category}]))));
// Private config/data are deliberately not included in release archives. Updates
// must never replace the existing database, salt, sessions, or owner credentials.
const files=[];
async function scan(dir) {for (const x of await readdir(dir,{withFileTypes:true})) {const file=`${dir}/${x.name}`;if(x.isDirectory()) await scan(file);else files.push(file);}}
await scan(`${root}/public_html`);
const pageRoutes = {};
for (const file of files.filter(file => file.endsWith('/index.html'))) {
  const path = relative(`${root}/public_html`, file).replace(/index\.html$/, '');
  pageRoutes[`/${path}`] = relative(`${root}/public_html`, file);
  if (path) pageRoutes[`/${path.slice(0, -1)}`] = relative(`${root}/public_html`, file);
  pageRoutes[`/${path}index.html`] = relative(`${root}/public_html`, file);
}
await writeFile(`${root}/public_html/page-routes.json`, JSON.stringify(pageRoutes));
for (const file of files) {
  if (/\.(?:env|sqlite|db|log)$/.test(file) || /(?:sk|rk)_(?:live|test)_[a-zA-Z0-9]{16,}|whsec_[a-zA-Z0-9]{16,}/.test(await readFile(file,'utf8'))) throw new Error(`Secret or private file in ${relative(root,file)}`);
  if (/\.html$/.test(file)) {
    const html=await readFile(file,'utf8');
    if (html.includes('chatgpt.site') || html.includes('SITEDOTEU')) throw new Error(`Old domain or secret marker in ${relative(root,file)}`);
    if (file.includes('/es/') && !html.includes('<html lang="es"')) throw new Error(`Wrong Spanish language in ${file}`);
  }
}
execFileSync('zip',['-qr','../ayubowan-siteeu.zip','public_html'],{cwd:root});
console.log(`Packaged ${files.length} public files. Private data and credentials excluded.`);
