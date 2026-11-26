<?php
// Tech Guardians News - configuration. No database: the news cache is a JSON file in api/data/.
define('TG_DATA_DIR', __DIR__ . '/data');
// How long fetched news feeds are cached, in seconds.
const TG_NEWS_CACHE_SECONDS = 300;
