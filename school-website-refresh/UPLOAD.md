# Mary Royal School website publishing guide

The cPanel static website stays at `https://maryroyalschool.co.ke/`. The school management portal stays at `https://portal.maryroyalschool.co.ke/`; the public website Login links point there. The latest mobile navigation, photo gallery, brand palette and SEO work in this folder is prepared locally and still needs publishing to cPanel.

## Before publishing

- Back up the current cPanel document root. The previous dated backup is `/home/maryroya/mary-royal-site-backup-2026-10-27.zip`, outside the public web root.
- In cPanel File Manager, copy the *contents* of `school-website-refresh/` into `/public_html`: `index.html`, `404.html`, `robots.txt`, `sitemap.xml` and `assets/`.
- Merge/update files; do not delete or overwrite existing `.well-known/`, verification files, or `.htaccess` without checking them first.
- Remove the old public `school-website-refresh.zip` from `/public_html` after publishing. Keep the private backup.

## Enable the custom 404

If the existing `.htaccess` has no custom 404 directive, append `ErrorDocument 404 /404.html` to it. Preserve its other rules. Then request a clearly nonexistent URL and confirm the page returns an actual HTTP 404 status while showing the branded page.

## Verify after publishing

1. Open the homepage on phone and desktop. At widths 360, 390, 768, 1024 and 1280 pixels, check the header, hamburger menu, Login link, content and gallery for overlap or sideways scrolling.
2. Test the Login URL `https://portal.maryroyalschool.co.ke/`, the Google enrollment form, contact links and the gallery lightbox.
3. Check `https://maryroyalschool.co.ke/robots.txt`, `/sitemap.xml`, `/404.html` and the social preview image `/assets/images/school-graduation-hero.webp`.
4. cPanel's `robots.txt` applies only to `maryroyalschool.co.ke`; the portal subdomain has a separate `public/robots.txt` in the app source, and the app pages declare `noindex`.
5. After DNS and HTTPS are working, add `https://maryroyalschool.co.ke/` as the preferred property in Google Search Console and submit `/sitemap.xml`. Request indexing for the homepage and claim/verify the Google Business Profile.

The portal CNAME is `portal` → `981c898782d4b0c1.vercel-dns-017.com.`. The root (`@`), `www` and email DNS records were preserved. The pre-existing enrollment form, portal login URL, phone and email are unchanged.