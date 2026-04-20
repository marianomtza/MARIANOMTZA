# DEPLOYMENT GUIDE - Mariano Martínez Portfolio

## POST-REFACTORING DEPLOYMENT CHECKLIST

### Phase 1: Local Development Setup

```bash
# 1. Clone and install
cd ~/dev
git clone https://github.com/marianomtza/MARIANOMTZA.git
cd MARIANOMTZA

# 2. Install dependencies (Vite + React)
npm install
# This installs from package.json:
# - vite
# - react@18.3.1
# - react-dom@18.3.1
# - @vitejs/plugin-react

# 3. Run development server
npm run dev
# Output: http://localhost:5173

# 4. Open browser and test:
# - Piano magnifier on title
# - Navigation menu works
# - Footer interactions responsive
# - Theme switching functional
# - Audio plays on interactions
# - Cursor smooth movement
# - No console errors
```

### Phase 2: Production Build

```bash
# 1. Create optimized build
npm run build
# Vite creates dist/ directory with:
# - index.html (entry point)
# - assets/index-*.js (bundled app)
# - assets/index-*.css (bundled styles)
# - All assets optimized

# 2. Preview build locally
npm run preview
# Serves dist/ at http://localhost:5173

# 3. Verify in preview:
# - All pages load
# - No broken assets
# - No console errors
# - All interactions work
```

### Phase 3: Vercel Deployment

#### Option A: Automatic (Recommended)
1. Push to main branch:
   ```bash
   git add .
   git commit -m "your-message"
   git push origin main
   ```

2. Vercel auto-detects Vite project:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Auto-deployed to marianomtza.com

#### Option B: Manual CLI
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel deploy

# 3. Promote to production
vercel promote <deployment-url>
```

#### Option C: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select "MARIANOMTZA" project
3. Click "Deploy" on main branch
4. Wait for build to complete

---

## VERIFICATION CHECKLIST

After deployment, verify on production:

### Functionality Tests
- [ ] Home page loads
- [ ] Piano magnifier responds to mouse
- [ ] Audio plays on interaction (if audio enabled)
- [ ] Navigation menu smooth-scrolls
- [ ] Theme switcher works (all 5 themes)
- [ ] Footer scroll-to-top works
- [ ] Marquee animations smooth
- [ ] Stats display correctly
- [ ] Booking form accepts input
- [ ] All links work

### Performance Tests
- [ ] Page loads in < 2s (3G throttled)
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- [ ] No layout thrashing
- [ ] Smooth animations (60fps)

### Cross-browser Tests
- [ ] Chrome/Edge on desktop
- [ ] Firefox on desktop
- [ ] Safari on desktop (Mac)
- [ ] Mobile Safari (iOS)
- [ ] Chrome on Android
- [ ] Responsive design breakpoints work

### Security Tests
- [ ] No mixed content warnings
- [ ] No console security errors
- [ ] HTTPS enforced
- [ ] postMessage validates origin
- [ ] No XSS vulnerabilities

### SEO Tests
- [ ] Meta tags present
- [ ] Open Graph tags working
- [ ] Twitter Card tags working
- [ ] sitemap.xml exists
- [ ] robots.txt correct
- [ ] favicon loads

---

## TROUBLESHOOTING DEPLOYMENT

### Build Fails on Vercel

**Error: "Cannot find module 'react'"**
- Solution: `npm install` installs React locally (check package.json)
- Verify: React is dependency (not devDependency)

**Error: "Vite command not found"**
- Solution: Vite installed as devDependency in package.json
- Verify: `"vite": "^5.0.0"` in package.json

**Error: "dist/ directory empty"**
- Solution: Check vite.config.js build output
- Verify: `outDir: 'dist'` is set
- Check: No CSS/JS syntax errors

### Runtime Issues

**Page Blank (No Content)**
- Check: Browser console for errors
- Verify: `/src/main.jsx` exports correctly
- Solution: Hard refresh (Cmd+Shift+R)

**Audio Not Playing**
- Reason: Browser autoplay restrictions
- Fix: Requires user interaction (click)
- Solution: Call `audio.ensureContext()` first

**Theme Not Persisting**
- Reason: localStorage blocked
- Fix: Check browser privacy settings
- Solution: Theme state resets on reload (expected)

**Cursor Jittery**
- Cause: Low frame rate
- Solution: Check browser performance tab
- Verify: No background processes consuming CPU

### Rollback Strategy

If critical issues arise:

```bash
# 1. Identify last working commit
git log --oneline

# 2. View that commit
git show <commit-hash>

# 3. If necessary, revert
git revert <commit-hash>
git push origin main

# 4. Vercel automatically rebuilds
# Production reverted within 2-3 minutes
```

---

## MONITORING & MAINTENANCE

### Daily Checks
- [ ] Site loads without errors
- [ ] No console errors reported
- [ ] Analytics tracking data
- [ ] Error reporting (if set up)

### Weekly Checks
- [ ] Review Vercel analytics
- [ ] Check Lighthouse scores
- [ ] Monitor uptime status
- [ ] Verify all pages functional

### Monthly Checks
- [ ] Review performance metrics
- [ ] Update dependencies (`npm outdated`)
- [ ] Check for security updates (`npm audit`)
- [ ] Review user feedback

### Dependency Updates
```bash
# Check outdated packages
npm outdated

# Update minor versions (safe)
npm update

# Update major versions (requires testing)
npm install react@19

# After any update: test locally then deploy
npm run build
npm run preview
```

---

## FILE STRUCTURE SUMMARY

### New Production Structure
```
dist/                                     # Built output (Vercel serves this)
├── index.html                           # Entry point
├── assets/
│   ├── index-ABC123.js                 # Bundled app + React
│   ├── index-XYZ789.css                # Bundled styles
│   └── ...
└── favicon.svg

Root (Source)
├── package.json                         # Dependencies + scripts
├── vite.config.js                      # Build config
├── index.html                          # Vite entry point (minimal)
├── src/
│   ├── main.jsx                        # React entry
│   ├── App.jsx                         # Main component
│   ├── constants.js                    # Shared constants
│   ├── contexts/                       # Context providers
│   ├── hooks/                          # Custom hooks
│   ├── components/                     # React components
│   └── styles/
│       └── main.css                    # All styles
└── public/                             # Static files
    ├── favicon.svg
    ├── og-image.png
    └── ...
```

---

## ENVIRONMENT VARIABLES (Optional)

Create `.env.local` (git-ignored):
```env
VITE_API_URL=https://api.marianomtza.com
VITE_GA_ID=UA-XXXXXXXXX-X
VITE_ENVIRONMENT=production
```

Access in code:
```jsx
const apiUrl = import.meta.env.VITE_API_URL
```

---

## PERFORMANCE OPTIMIZATION TIPS

### Already Optimized
- ✅ CSS bundled and minified
- ✅ JS tree-shaken and minified
- ✅ React production build
- ✅ No unused dependencies

### Future Optimizations
- [ ] Add image optimization (webp)
- [ ] Implement code-splitting for routes
- [ ] Add service worker for offline
- [ ] Implement critical CSS inlining
- [ ] Add font optimization (preload)

---

## SUPPORT & NEXT STEPS

### Immediate Actions
1. ✅ Local test: `npm run dev`
2. ✅ Production build: `npm run build`
3. ✅ Deploy: Push to main → Vercel auto-deploys
4. ✅ Monitor: Check marianomtza.com after 5 minutes

### For Issues
1. Check `/REFACTORING_COMPLETE.md` for architecture
2. Review source code in `src/`
3. Check Vercel build logs
4. Review browser console errors

### Contact/Support
- Repository: https://github.com/marianomtza/MARIANOMTZA
- Issues: Use GitHub Issues
- Vercel Dashboard: https://vercel.com/dashboard

---

## DEPLOYMENT SUMMARY

**Status**: ✅ Ready for Production

**What Changed**:
- Build system: esbuild → Vite
- Module format: CJS/UMD → ESM
- React: CDN → npm bundled
- Structure: Monolithic → Modular

**What Stayed the Same**:
- ✅ Visual design identical
- ✅ All interactions preserved
- ✅ Audio system (now fixed)
- ✅ Theme switching
- ✅ Performance (improved)
- ✅ Mobile responsive

**Deploy Command** (after git push):
```bash
# Vercel auto-deploys on push to main
# No manual action needed
# Deploy finishes in ~2-3 minutes
# Live at https://marianomtza.com
```

**Estimated Deploy Time**: 2-3 minutes
**Rollback Time**: < 1 minute (via Vercel dashboard)

---

**Last Updated**: 2024
**Status**: Production-Ready ✅
