import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

`public/_redirects`:
```
/api/*  /api/:splat  200
/*      /index.html  200
```

**Then: connect to Cloudflare Pages**

Once the repo is on GitHub:

1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git
2. Select the repo
3. Build settings: Framework = Vite, Build command = `npm run build`, Output directory = `dist`
4. Hit Deploy (first deploy will probably fail — that's fine, the D1 binding isn't set yet)

**Then: bind D1 to the Pages project**

Pages → Settings → Functions → D1 database bindings → Add binding:
- Variable name: `DB`
- D1 database: `drive-hub`

**Then: set the admin secret**
```
npx wrangler pages secret put ADMIN_SECRET
