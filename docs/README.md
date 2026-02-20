<div align="center">

# SitePlod Documentation
**Technical references, deployment guides, and feature implementations.**

</div>

---

This directory contains comprehensive documentation for the SitePlod architecture and backend mechanics.

## Documentation Files

### Setup & Configuration

- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables setup guide
  - Supabase configuration
  - External service API keys
  - Database migration instructions
  - Local development setup

### API Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
  - Authentication endpoints
  - File upload endpoints
  - Site management endpoints
  - Analytics endpoints
  - Error codes and responses
  - Example usage

### Deployment

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
  - Vercel deployment
  - Netlify deployment
  - Docker deployment
  - Post-deployment checklist
  - Monitoring and troubleshooting

### Testing

- **[TESTING.md](./TESTING.md)** - Testing guide
  - Unit test requirements
  - Integration test requirements
  - Manual testing procedures
  - Test coverage goals

### Feature Documentation

- **[API_CLIENT_README.md](./API_CLIENT_README.md)** - API client usage guide
- **[RATE_LIMIT_README.md](./RATE_LIMIT_README.md)** - Rate limiting implementation
- **[INCREMENT_VIEWS_USAGE.md](./INCREMENT_VIEWS_USAGE.md)** - View tracking function usage

## Code Examples

The `examples/` directory contains example code:

- **[api-client.example.ts](./examples/api-client.example.ts)** - API client usage examples
- **[with-rate-limit.example.ts](./examples/with-rate-limit.example.ts)** - Rate limiting examples
- **[toast-example.ts](./examples/toast-example.ts)** - Toast notification examples

## Quick Links

### For Developers

1. Start with [ENV_SETUP.md](./ENV_SETUP.md) to configure your environment
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API endpoints
3. Check [TESTING.md](./TESTING.md) for testing requirements

### For DevOps

1. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment procedures
2. Check [ENV_SETUP.md](./ENV_SETUP.md) for production configuration
3. Set up monitoring as described in [DEPLOYMENT.md](./DEPLOYMENT.md)

### For QA

1. Review [TESTING.md](./TESTING.md) for test requirements
2. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint testing
3. Follow manual testing procedures in [TESTING.md](./TESTING.md)

## Project Structure

```
docs/
├── README.md                      # This file
├── API_DOCUMENTATION.md           # API reference
├── DEPLOYMENT.md                  # Deployment guide
├── ENV_SETUP.md                   # Environment setup
├── TESTING.md                     # Testing guide
├── API_CLIENT_README.md           # API client docs
├── RATE_LIMIT_README.md           # Rate limiting docs
├── INCREMENT_VIEWS_USAGE.md       # View tracking docs
└── examples/                      # Code examples
    ├── api-client.example.ts
    ├── with-rate-limit.example.ts
    └── toast-example.ts
```

## Contributing

When adding new documentation:

1. Place it in the appropriate category
2. Update this README with a link
3. Use clear, concise language
4. Include code examples where helpful
5. Keep documentation up to date with code changes

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Pastebin API Documentation](https://pastebin.com/doc_api)
- [ImgBB API Documentation](https://api.imgbb.com/)
