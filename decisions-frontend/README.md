# DECISIONS Frontend

React TypeScript dashboard for AI-powered pricing optimization. Users get pricing recommendations from Claude and track revenue impact.

## Quick Start

### Prerequisites
- Node.js 18+
- decisions-backend running on port 3000

### Setup

1. **Install dependencies**
   ```bash
   cd decisions-frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

Dashboard runs on `http://localhost:3001` and proxies `/api` to the backend.

## Pages

- **Login/Register** — User authentication
- **Dashboard** — View all recommendations and revenue impact
- **Pricing Recommendation** — Submit product data and get Claude recommendation
- **Integrations** — Connect Shopify, n8n, Plausible, Twenty CRM

## Architecture

- Built with Vite + React 18 + TypeScript
- Authentication via JWT tokens stored in localStorage
- Axios for API calls to backend
- Responsive CSS Grid layout

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Frontend is a static SPA that proxies all API calls to the backend.

Deploy to Vercel, Netlify, or any static host:
```bash
npm run build
# Upload dist/ folder
```

Update API proxy URL in `vite.config.ts` for production backend URL.
