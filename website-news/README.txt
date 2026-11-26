TECH GUARDIANS NEWS - separate news-only website
================================================
A fast, installable news site (cyber security, fraud, cyber crime, AI security, quantum security) that looks like the main
Tech Guardians website. It has its own PHP news collector, so it works on its own sub-domain.

DEPLOY ON HOSTINGER (about 5 minutes)
1. hPanel -> Domains -> Subdomains: create  news.YOURDOMAIN  (Hostinger makes a folder, e.g. public_html/news).
2. SSL: Websites -> Security -> SSL on for the sub-domain, Force HTTPS on.
3. PHP 8.1 or newer, with curl enabled (hPanel -> Advanced -> PHP Configuration).
4. File Manager: upload EVERYTHING inside this "website-news" folder into the sub-domain folder
   (show hidden files; include .htaccess and the .well-known folder). Keep the folder structure.
5. Make api/data writable (permission 755, or 775 if news does not load). It stores only the news cache.
6. Edit js/config.js: set mainSite to your main website address.
7. Open https://news.YOURDOMAIN  -> stories appear in a few seconds.

EXTRA SAFETY (optional): Cloudflare in front of the sub-domain. If you use it, create an empty file api/data/behind-cloudflare
so visitor IPs are read correctly for the rate limit.

APP: on a phone open the site -> Install. For a Play Store APK use pwabuilder.com with https://news.YOURDOMAIN

WHAT IT SHOWS: Desks - All, India, Global, Fraud & scams, AI security, Quantum, Advisories & CVEs; search; source filter;
cyber tip of the day; 1930 helpline strip. Only security-relevant AI and quantum stories pass the filter.
News sources and the filter live in api/news.php (list near the top).
