# SitePlod Rate Limiter Engine

SitePlod implements strict rate limiting across external-facing API endpoints to mitigate Distributed Denial of Service (DDoS) attacks and prevent rapid exhaustion of the 3rd-party Pastebin and ImgBB API quotas.

## Technical Implementation

The rate limiting middleware is encapsulated in `src/lib/with-rate-limit.ts`. It acts as a Higher-Order Function (HOF) wrapping your standard Next.js Route Handlers.

### How It Works

1. **IP Extraction:** It extracts the connecting IPv4/IPv6 address from the `X-Forwarded-For` header.
2. **Memory Cache State:** For lightweight deployments without Redis, it utilizes a rolling window LRU cache architecture directly in the Node.js process memory.
3. **Thresholding:** If the IP generates more than `maxRequests` within the `windowMs`, a `429 Too Many Requests` response is immediately returned, short-circuiting the actual route logic.

## Configuration Profiles

The application utilizes multiple threshold tiers depending on the cost-complexity of the route:

### 1. High-Cost Operations
Operations involving 3rd-party network integrations.
- **Upload Endpoints (`/api/upload`)**
  - Limit: 20 requests
  - Window: 15 minutes
  - Reason: Pastebin API strictly enforces 24-hour limits. Abuse of this route drains the API keys globally for all users.

### 2. General Data Operations
Operations invoking PostgreSQL queries via Supabase.
- **Site Management (`/api/sites`)**
  - Limit: 100 requests
  - Window: 15 minutes
  - Reason: Prevents aggressive polling and Database query exhaustion.

## Implementation Example

To protect a new internal API route, wrap the route handler like so:

```typescript
import { withRateLimit } from '@/lib/with-rate-limit'

async function uploadHandler(request: Request) {
  // Complex uploading logic here...
  return new Response("Success")
}

// Wrap and export the handler mapped to a strict IP limit
export const POST = withRateLimit(uploadHandler, {
  maxRequests: 20,
  windowMs: 15 * 60 * 1000 // 15 Minutes
})
```
