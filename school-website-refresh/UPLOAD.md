# Mary Royal public website refresh

This blue/white static website refresh was published to the cPanel document root for `https://maryroyalschool.co.ke/` on 2026-10-27. Its header and footer Login links open `https://portal.maryroyalschool.co.ke/`, served by the existing Vercel project.

## Live setup and rollback

- Vercel custom domain: `portal.maryroyalschool.co.ke` (`Valid Configuration`).
- cPanel DNS: `portal` CNAME to `981c898782d4b0c1.vercel-dns-017.com.`
- The root (`@`), `www`, and email DNS records were not changed.
- Before publishing, the previous document root was backed up to `/home/maryroya/mary-royal-site-backup-2026-10-27.zip`, outside the public web root. Restore that archive through cPanel File Manager if rollback is needed.
- The uploaded `school-website-refresh.zip` is a temporary public copy and should be deleted from `/public_html` using cPanel File Manager. Keep the private backup above.

The frontend and portal domain returned HTTP 200 in the deployment smoke check. A normal browser/device check is still useful after local DNS caches refresh.
