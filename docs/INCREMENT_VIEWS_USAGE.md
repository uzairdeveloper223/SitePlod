# View Tracking Architecture

SitePlod implements extremely lightweight, edge-compliant view tracking for uploaded websites. This ensures site creators have active analytics regarding their active deployments.

## Database Mechanism

Rather than relying on continuous `SELECT` and `UPDATE` transaction locks, the analytics counter utilizes a dedicated PostgreSQL RPC (Remote Procedure Call) stored function on Supabase.

### Schema: `increment_site_views`

The `increment_site_views(site_id_param UUID)` function bypasses Row Level Security read-locks and atomically increments the numeric value. This prevents race conditions if a site is hit simultaneously by hundreds of visitors.

## API Integration

The proxy route serving public sites (`src/app/s/[slug]/route.ts`) acts as the increment trigger.

When an external browser inherently makes a `GET /s/[slug]` request to receive the indexed HTML, the Next.js Route:
1. Validates the Site's active state.
2. Serves the HTML Payload.
3. Asynchronously invokes `increment_site_views`.

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Asynchronous background fire-and-forget
supabase.rpc('increment_site_views', { 
  site_id_param: activeSite.id 
}).catch(console.error)
```

By decoupling the RPC execution from the HTML response return, we maintain zero-latency deployment delivery times while accumulating analytics in the background.
