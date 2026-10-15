<?php
// Keep this file OUTSIDE public_html/private_html, in ayubowan-private/config.php.
// Empty owner credentials fail closed. Never use your Site.eu account password.
return [
    'owner_password_hash' => '', // Generate with PHP password_hash; store the hash only.
    'resend_api_key' => '',
    'booking_email' => '',
    'email_from' => '',
];
