# SitePlod Deployment Guide

SitePlod is essentially a Next.js 16 (App Router) monolithic application. Due to its architecture, it is exceedingly well optimized for serverless edge deployments.

## Suggested Platforms

### Vercel (Recommended)

As the creators of Next.js, Vercel is the natural host for this repository. Zero-configuration deploy behavior is guaranteed.

1. Push your localized repository branch to GitHub.
2. Sign into [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your SitePlod repository.
4. Open the **Environment Variables** panel within the Vercel dashboard and paste all contents from your `.env` file.
5. Hit **Deploy**. 

Vercel will natively understand the build step (`npm run build`) and correctly map the static output.

### Docker / Self-Hosting

Containerized executions are completely valid. Node.js `20.x` or higher is strictly required.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Post-Deployment Checklist

Following a successful build out, perform the following validation checks:
- Attempt to register a new user to verify SMTP and Supabase integrations are communicating accurately.
- Upload a single `.html` test file to guarantee Pastebin endpoints accept the network payload from your server's IP address.
- Upload an image file directly to verify ImgBB key validity.

If rate-limits begin actively failing deployments in production, increase the array density of `PASTEBIN_API_KEYS` within your environment configuration.
