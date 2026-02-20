# SitePlod Environment Setup

This guide details the steps required to configure the environment variables for local development or production usage.

## Required Variables

Duplicate the `.env.example` file to create your own localized `.env` file before proceeding.

### Supabase Architecture

SitePlod uses Supabase (PostgreSQL) for user management, site mappings, and authentication.

1. Create a project at [Supabase](https://supabase.com).
2. Navigate to **Project Settings > API**.
3. Copy the following keys natively into your `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (Warning: Keep this strictly confidential on the server side)

### CDN & Storage Providers

SitePlod heavily leverages distributed third-party platforms to bypass generic file hosting costs.

1. **Pastebin (Text Assets)**
   - Used for serving uploaded `.css`, `.js`, and `.html` files.
   - Register at [Pastebin API](https://pastebin.com/doc_api) in order to generate a developer key.
   - For high-volume deployment scenarios, Pastebin's 24-hour post limit applies. To mitigate this, define multiple comma-separated keys under `PASTEBIN_API_KEYS`.

2. **ImgBB (Image Assets)**
   - Used for permanently serving static media (`.jpg`, `.png`, `.gif` etc).
   - Register at [ImgBB API](https://api.imgbb.com/) to receive an API Key.
   - Define your generated key under `IMGBB_API_KEY`.

### Application Configurations

- `NEXT_PUBLIC_BASE_URL`: Must correspond to your active traffic origin. (e.g., `http://localhost:3000` for local dev, or `https://yourdomain.com` for production environments).
- `JWT_SECRET`: A cryptographic key utilized for token generation. Can be generated rapidly using `openssl rand -base64 32`.

### Mail Providers (Optional)

Registration confirmation workflows utilize Nodemailer connected to a standard SMTP pool. Any standard SMTP provider (Gmail, Sendgrid, Resend) is valid.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_app_specific_password
SMTP_FROM="SitePlod <noreply@siteplod.com>"
```
