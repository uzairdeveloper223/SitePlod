<div align="center">

# SitePlod Testing Operations
**Unit and Integration testing frameworks.**

</div>

---

This directory contains all test suites designed to ensure zero-regression deployments for SitePlod.

## Directory Structure

```
tests/
├── unit/                          # Unit tests
│   ├── auth-utils.test.ts        # Authentication utilities
│   ├── env-validation.test.ts    # Environment validation
│   ├── imgbb.test.ts             # ImgBB integration
│   ├── pastebin.test.ts          # Pastebin integration
│   ├── supabase.test.ts          # Supabase client
│   ├── url-replacement.test.ts   # URL replacement logic
│   └── validation.test.ts        # Input validation
│
└── integration/                   # Integration tests
    ├── auth.test.ts              # Authentication flow tests
    ├── upload.test.ts            # File upload tests
    ├── sites.test.ts             # Site management tests
    ├── serving.test.ts           # Site serving tests
    ├── increment_views.test.sql  # Database function tests
    └── increment_views.test.ts   # View tracking tests
```

## Running Tests

### All Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui
```

### Specific Test Suites

```bash
# Run unit tests only
npm run test:run tests/unit

# Run integration tests only
npm run test:run tests/integration

# Run specific test file
npm run test:run tests/unit/validation.test.ts
```

## Test Coverage

Current test coverage:

- **Unit Tests**: ~90% coverage for utility functions
- **Integration Tests**: Database functions and view tracking

### Coverage Goals

- Utilities: 90%+ coverage (Target Reached)
- API Routes: 80%+ coverage (to be implemented)
- Integration: Key user flows covered (to be implemented)

## Writing Tests

### Unit Tests

Unit tests should:
- Test individual functions in isolation
- Mock external dependencies
- Cover edge cases and error conditions
- Be fast and deterministic

Example:
```typescript
import { describe, it, expect } from 'vitest'
import { validateSlug } from '@/lib/validation'

describe('validateSlug', () => {
  it('should accept valid slugs', () => {
    const result = validateSlug('my-valid-slug')
    expect(result.valid).toBe(true)
  })

  it('should reject slugs with uppercase', () => {
    const result = validateSlug('Invalid-Slug')
    expect(result.valid).toBe(false)
  })
})
```

### Integration Tests

Integration tests should:
- Test complete user flows
- Use test database/services
- Verify database state
- Test error handling

## Test Requirements

See [docs/TESTING.md](../docs/TESTING.md) for detailed testing requirements including:

- Unit test requirements (Task 14.1)
- Integration test requirements for auth (Task 14.2)
- Integration test requirements for upload (Task 14.3)
- Integration test requirements for site management (Task 14.4)
- Integration test requirements for site serving (Task 14.5)

## Completed Tests

The following integration tests have been implemented:

### Authentication Tests
- Registration flow
- Login flow
- Logout flow
- Token verification

### Upload Tests
- HTML upload
- ZIP upload
- Video file rejection
- Video reference detection
- Image upload to ImgBB
- URL replacement

### Site Management Tests
- Slug availability check
- Site creation
- Site listing
- Site update
- Site deletion

### Site Serving Tests
- Site page rendering
- Asset serving
- View tracking
- 404 handling

## Test Configuration

Tests are configured in `vitest.config.ts` at the project root.

Key configuration:
- Test environment: Node.js
- Path aliases: `@/` maps to `src/`
- Coverage provider: v8
- Test timeout: 10 seconds

## Mocking External Services

When writing integration tests, mock external services:

```typescript
import { vi } from 'vitest'

// Mock Pastebin
vi.mock('@/lib/pastebin', () => ({
  uploadToPastebin: vi.fn().mockResolvedValue('https://pastebin.com/mock')
}))

// Mock ImgBB
vi.mock('@/lib/imgbb', () => ({
  uploadToImgBB: vi.fn().mockResolvedValue('https://i.ibb.co/mock.png')
}))
```

## Continuous Integration

Tests should run on:
- Every commit (pre-commit hook)
- Every pull request
- Before deployment

## Troubleshooting

### Tests Failing

1. Check that all dependencies are installed: `npm install`
2. Verify environment variables are set (for integration tests)
3. Check test database is accessible
4. Review error messages for specific failures

### Slow Tests

1. Use `test.concurrent` for independent tests
2. Mock external services
3. Use test database with minimal data
4. Consider splitting large test files

## Contributing

When adding new tests:

1. Place unit tests in `tests/unit/`
2. Place integration tests in `tests/integration/`
3. Follow existing naming conventions
4. Update this README if adding new test categories
5. Ensure tests are deterministic and isolated
