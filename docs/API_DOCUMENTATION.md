# SitePlod API Documentation

This directory provides architectural visibility into the internal APIs utilized by the frontend dashboard. The entire application is REST-compliant utilizing standard Next.js route handlers.

## Core Endpoints

### `POST /api/upload`
Upload handler for raw HTML and ZIP assets.

**Behavior:**
1. Verifies the user session token.
2. If ZIP: Extends archive locally, strictly omitting non-essential filesystem metadata (e.g. `__MACOSX`, `.DS_Store`).
3. Images are dynamically piped to the ImgBB REST hooks and their direct CDN links are cached in memory.
4. CSS, JavaScript, and HTML fragments are recursively parsed, and their `<link>` and `src` tags are substituted sequentially with respective Pastebin routing URLs.

### `GET /api/sites/[id]/files/[...path]`
Serves internal queries for File Editor displays.

**Behavior:**
Resolves the Pastebin raw content path linked to the targeted file array. Bypasses Cross-Origin Resource Sharing (CORS) limits by returning pure textual payloads natively to the Monaco Editor within the user interface.

### `GET /s/[slug]/[...path]`
The foundational proxy route for user-facing active deployments.

**Behavior:**
When a visitor views a deployed SitePlod website and their browser requests a secondary asset (e.g., `<link href="style.css">`), the Next.js API intercepts the relative request dynamically based on the active `[slug]`.
It pulls the plain text payload from Pastebin and rigidly injects the correct `Content-Type: text/css` explicit headers onto the response object. This successfully skirts standard browser ORB (Opaque Response Blocking) security layers that usually block text-served stylesheets.
