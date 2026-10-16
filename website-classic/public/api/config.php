<?php
// Tech Guardians PHP API — configuration.
// No database: everything is stored as JSON files in api/data/.

// Admin login. The password is stored only as a bcrypt hash.
// After the first login, change the password from the Manage page; the new
// hash is saved in data/admin.json and takes priority over this one.
// To set a password by hand, generate a hash with:
//   php -r 'echo password_hash("YourNewPassword", PASSWORD_DEFAULT), "\n";'
const TG_ADMIN_USERNAME = 'admin';
const TG_ADMIN_PASSWORD_HASH = '$2y$12$cxG90NFY/WPHRvwGP90lh.PXk1rcH1Jvn3NlrD0SugIxP1vWTnONK';

// Folder for JSON data (settings, admin password, login attempts, news cache).
// It must be writable by PHP. api/data/.htaccess blocks web access to it.
define('TG_DATA_DIR', __DIR__ . '/data');

// How long fetched news feeds are cached, in seconds.
const TG_NEWS_CACHE_SECONDS = 300;

// Failed logins allowed per IP address within the lockout window.
const TG_MAX_LOGIN_ATTEMPTS = 5;
const TG_LOGIN_LOCKOUT_SECONDS = 900;
