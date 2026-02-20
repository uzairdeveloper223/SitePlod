# SitePlod Internal API Client

This document provides a technical overview of the internal API client implementation utilized by the SitePlod frontend to communicate with our Next.js backend routes.

## Architecture Highlights

The frontend interacts with the `/api/*` pathways using standardized Axios request configurations. These wrappers ensure consistent headers and robust error extraction across the application.

### Implementation Location

The primary interactions are mapped in:
- `src/lib/api-client.ts`: Generates the Axios instance with preconfigured timeouts.
- `src/lib/pastebin.ts`: Core external proxy for Pastebin text uploads.
- `src/lib/imgbb.ts`: Core external proxy for direct ImgBB image streams.

## Example File Upload Pipeline

To successfully process a user upload, the internal API client handles multipart form data serialization before routing to the backend.

```typescript
import axios from 'axios'

export async function submitFiles(files: File[]) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })

  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000 // Extended timeout for large asset payloads
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Upload Failure:', error.response?.data)
      throw new Error(error.response?.data?.message || 'Upload failed')
    }
  }
}
```

## Security Posture

The internal API does not rely on local storage JWTs for standard data requests. It heavily relies on Supabase Session Cookies maintained automatically by the `@supabase/ssr` architecture which inherently secures the `api/` routes against external hijacking.
