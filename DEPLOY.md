# DUA - Deploy Instructions

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Deploy to Production**:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### Environment Variables

Add these environment variables in Vercel Dashboard (Settings → Environment Variables):

```bash
SUNOAPI_KEY=88cff88fcfae127759fa1f329f2abf84
SUNOAPI_BASE_URL=https://api.sunoapi.org
NEXT_PUBLIC_URL=https://your-domain.vercel.app
```

### Deploy from GitHub

1. **Push to GitHub**:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect in Vercel**:
   - Go to vercel.com
   - Import your repository
   - Vercel will auto-deploy on every push to main

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain: `dua.2lados.pt`
3. Configure DNS records as shown by Vercel

### Post-Deploy Checklist

- ✅ All pages load correctly
- ✅ Music Studio API works
- ✅ Chat interface loads
- ✅ Images and videos display
- ✅ Environment variables are set
- ✅ Custom domain configured

## Quick Deploy Commands

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server locally
pnpm start

# Deploy to Vercel
vercel --prod
```

## Troubleshooting

### Build Errors

If you get build errors:

1. **Clear cache**:
```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

2. **Check Node version** (should be 18.x or 20.x):
```bash
node --version
```

3. **Check pnpm version**:
```bash
pnpm --version
```

### API Errors

If Music Studio API doesn't work:
1. Verify environment variables are set in Vercel
2. Check logs in Vercel Dashboard
3. Test API endpoint: `https://your-domain.vercel.app/api/studio/generate-from-whistle`

## Performance Optimization

Already configured:
- ✅ Next.js Image Optimization
- ✅ Automatic Code Splitting
- ✅ Server Components
- ✅ Incremental Static Regeneration
- ✅ Edge Functions ready

## Monitoring

After deploy:
1. **Check Vercel Analytics**: Project → Analytics
2. **Monitor API calls**: Project → Logs
3. **Track errors**: Project → Speed Insights

---

**Your project is ready to deploy! 🚀**

Run `vercel --prod` to deploy now.
