# Mary Royal public website refresh

This folder is a staged copy of the current cPanel static site with a royal-blue/white visual refresh, smaller WebP images, and a new **Login** link in the header. It is not live yet.

## Portal address

The header is configured for `https://portal.maryroyalschool.co.ke/`. That address must first be added as a custom domain to the Vercel `mary-royal-school` project and given the exact CNAME target Vercel displays. In cPanel Zone Editor, add only the `portal` CNAME record; leave the existing root (`@`) and `www` website records and all MX/email records unchanged. Wait until Vercel reports a valid configuration and HTTPS works before publishing this site copy.

## Publish through cPanel

1. In cPanel, open **Domains** and verify the document root for `maryroyalschool.co.ke`.
2. Open **File Manager** and make a dated backup of the existing document root before replacing anything.
3. Upload the contents of this folder (`index.html`, `assets/`, and this guide) into that document root. Do not upload the parent folder itself. Keep existing server verification and mail-related files such as `.well-known/` and `.htaccess` unless the hosting provider confirms they are unused.
4. Visit `https://maryroyalschool.co.ke/` on desktop and mobile. Test all header links, the Login button, enrollment links, contact links and images.
5. If anything is wrong, restore the dated backup in cPanel File Manager.

Do not change the apex/root DNS to Vercel for this setup: the existing public school website remains on cPanel, and the school management system uses the `portal` subdomain on Vercel.
