# Staging data directory (inside the site folder)

This folder holds:
- `newsletter.sqlite` — created automatically on first signup / admin seed
- `mail-failures.log` — created on the first email failure

Protected by `.htaccess` (Apache) and `index.php`. Do not commit the `.sqlite` or `.log` files.
