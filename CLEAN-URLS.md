# Clean URLs — server setup

Internal links now use paths without `.html` (`/rooms`, `/contact`, `/about`, …; home is `/`). HTML filenames on disk are unchanged.

## Apache / LiteSpeed

Deploy the root `.htaccess` file. It redirects old `.html` URLs and serves the clean slugs.

## nginx

`.htaccess` is ignored. Inside the site `server { }` block, add the rules from `nginx-clean-urls.conf`, then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Verify:

- `https://hillstationjos.com/rooms` → **200**
- `https://hillstationjos.com/rooms.html` or `…/booking_the_hill_station_jos.html` → **301** to `/rooms`
- `https://hillstationjos.com/index.html` → **301** to `/`

Without the server rules, clean links will **404** after deploy.
