"""Create first-time owner credentials locally; no secrets enter release files or output."""
import os
import pathlib
import secrets
import subprocess

root = pathlib.Path(__file__).resolve().parents[1]
credentials = root / '.env.owner'
config = root / 'private-deployment' / 'ayubowan-private' / 'config.php'
if credentials.exists() or config.exists():
    raise SystemExit('Owner credentials already exist. Preserve them; do not reset implicitly.')
os.umask(0o077)
password = secrets.token_urlsafe(24)
hashed = subprocess.run(
    ['/usr/sbin/htpasswd', '-niBC', '12', 'owner'],
    input=password + '\n', text=True, capture_output=True, check=True,
).stdout.strip().split(':', 1)[1]
if not hashed.startswith(('$2y$', '$2b$')):
    raise SystemExit('Expected a bcrypt hash.')
credentials.write_text(
    '# Private owner access. Keep this file in your password manager; never upload it.\n'
    'OWNER_STUDIO_URL=https://ayubowanbarcelona.es/studio/\n'
    f'OWNER_STUDIO_PASSWORD={password}\n'
)
config.parent.mkdir(parents=True, mode=0o700)
config.write_text(
    "<?php\nreturn [\n"
    f"    'owner_password_hash' => '{hashed}',\n"
    "    'resend_api_key' => '',\n    'booking_email' => '',\n    'email_from' => '',\n];\n"
)
os.chmod(credentials, 0o600)
os.chmod(config, 0o600)
subprocess.run(['zip', '-qr', '../ayubowan-owner-config.zip', 'ayubowan-private'],
               cwd=root / 'private-deployment', check=True)
os.chmod(root / 'ayubowan-owner-config.zip', 0o600)
print('Created private owner password file and hash-only hosting configuration. No password printed.')
