# Deployment Instructions for ameesia.com

## Option 1: Vercel (Recommended - Free & Fast)

### Steps:
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from this directory:**
   ```bash
   cd /Users/ameesiamarold/ameesia-website
   vercel
   ```

3. **Follow the prompts:**
   - Create account/login if needed
   - Choose project name: "ameesia"
   - Framework: "Other"
   - Build command: (leave empty)
   - Output directory: `.`
   - Override settings: No

4. **Connect your domain:**
   - Go to your Vercel dashboard
   - Click on your project
   - Go to "Settings" → "Domains"
   - Add `ameesia.com`
   - Add `www.ameesia.com`

5. **Update DNS at your domain registrar:**
   - Add an A record: `@` → `76.76.21.21`
   - Add a CNAME record: `www` → `cname.vercel-dns.com`

## Option 2: Netlify (Alternative - Also Free)

### Steps:
1. **Create account at netlify.com**

2. **Drag and drop deployment:**
   - Open https://app.netlify.com/drop
   - Drag your entire `ameesia-website` folder onto the page

3. **Connect domain:**
   - Go to "Domain settings"
   - Add custom domain: `ameesia.com`
   - Follow DNS instructions provided

## Option 3: GitHub Pages (If you use GitHub)

### Steps:
1. **Create GitHub repository:**
   ```bash
   cd /Users/ameesiamarold/ameesia-website
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create ameesia-website --public
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Pages → Source: "Deploy from branch"
   - Branch: main, folder: / (root)

3. **Add custom domain:**
   - Add `ameesia.com` in custom domain field
   - Create CNAME file in your repo with `ameesia.com`

4. **Update DNS:**
   - Add A records pointing to GitHub's IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

## Option 4: Traditional Web Hosting

If you have traditional web hosting (like SiteGround, BlueHost, etc.):

1. **Upload files via FTP:**
   - Connect to your hosting via FTP
   - Upload all files from `ameesia-website` folder
   - Place them in `public_html` or `www` directory

2. **Domain is automatically connected** if hosting includes it

## Quick Testing Before Deployment

Test your site locally:
```bash
python3 -m http.server 8000
# Visit: http://localhost:8000
```

## Files to Deploy

Make sure these files are included:
- `index.html` - Main HTML file
- `styles.css` - All styles
- `script.js` - Interactions
- `favicon.svg` - Browser icon

## SSL/HTTPS

- Vercel & Netlify: Automatic SSL included
- GitHub Pages: Automatic SSL with custom domains
- Traditional hosting: May need to enable SSL certificate

## After Deployment

1. Test all animations work
2. Check mobile responsiveness
3. Verify contact links
4. Test page load speed
5. Submit to Google Search Console (optional)

---

**Need help?** The fastest option is Vercel - just run `vercel` in this directory and follow the prompts!