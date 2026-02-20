<div align="center">
  
# SitePlod
**Deploy static websites in seconds. Zero configs, infinite scale.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-white?logo=next.js&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](#)

</div>

---

SitePlod is an ultra-fast, modern platform designed to bypass the complexity of traditional web hosting. Instantly upload HTML, CSS, JavaScript, or complete ZIP architectures to generate a memorable, globally distributed URL.

## Features

- **Instant Deployments:** Drag, drop, and deploy single files or comprehensive ZIP architectures without writing a single line of configuration.
- **Automated Asset Provisioning:** Local paths are intelligently parsed and mapped. Images ship to global CDNs, and text-assets route through edge-cached endpoints.
- **Live Code Editor:** Tweak elements directly from your browser. Integrated with Monaco Editor for syntax highlighting and immediate execution.
- **Robust Identity & Security:** Complete account management powered by Supabase with full session handling and email verification.
- **Built for Speed:** Created on Next.js 16 (App Router) with rigorous TypeScript standards.

## Architecture & Tech Stack

The platform is designed to maintain high performance while keeping infrastructure costs minimal. 

* **Frontend & API:** `Next.js 16` (App Router)
* **Language:** `TypeScript`
* **Styling:** `Tailwind CSS`, `Lucide Icons`
* **Database & Auth:** `Supabase` (PostgreSQL)
* **Storage Pipelines:** 
  * `ImgBB` (Media CDN)
  * `Pastebin APIs` (Text Asset Hosting)
* **Mailing:** `Nodemailer` & Gmail SMTP

## Installation Guide

To run SitePlod locally or configure it for your own localized network, follow the steps below.

### 1. Clone the Repository

```bash
git clone https://github.com/uzairdeveloper223/SitePlod.git
cd SitePlod
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Duplicate the template environment file into a local `.env`.

```bash
cp .env.example .env
```

Open `.env` and configure your credentials:
1. **Supabase:** Provide your URL, Anon Key, and Service Role Key.
2. **Storage CDNs:** Provide your ImgBB API Key and Pastebin API Keys (Comma-separated for rate-limit fallbacks).
3. **Mailing:** Add your SMTP details for verification emails.

### 4. Database Initialization

Link your local instance to your remote Supabase project to execute table migrations.

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 5. Start the Server

```bash
npm run dev
```

The application will be live at `http://localhost:3000`.

## Repository Structure

We enforce a strict separation of concerns to keep the codebase maintainable. View the individual `README.md` files in these directories for specialized documentation:

| Directory | Description |
| :--- | :--- |
| `src/` | The core application code. Contains Next.js routing, React components, and API library functions. |
| `supabase/` | Migration files and database schemas for PostgreSQL. |
| `docs/` | Deployment flow documentation and architectural explanations. |
| `tests/` | Playwright integration testing and local testing configurations. |

## Contributing

We welcome community contributions! Please adhere to the following workflow:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Ensure all new features match our strict TypeScript standards, utilize React best practices, and introduce no breaking changes to the URL replacement API pipeline.

## License

This project is licensed under the GNU General Public License v3 - see the `LICENSE` file for details.
Copyright (C) 2026 Uzair Mughal
