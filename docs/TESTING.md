# SitePlod Testing Guide

SitePlod incorporates comprehensive regression tracking powered by Vitest, handling everything from fundamental utility logic to mock integrations for external storage platforms.

## Test Environment

The test suite leverages the Node.js environment utilizing the `tests/` directory architecture. Coverage thresholds are rigorously enforced to ensure robust deployment reliability.

- **Framework:** Vitest
- **Path Aliasing:** `@/` resolves naturally to `src/` inside the testing scope.
- **Coverage Tooling:** V8

## Execution Commands

A dedicated testing container script is accessible via NPM locally.

```bash
# Execute the entire suite
npm run test:run

# Execute in Hot-Reload (Watch Mode)
npm test

# Generate UI metrics dashboard
npm run test:ui
```

### Module Targeting
To execute specific structural test modules for efficiency:

```bash
# Unit Tests
npm run test:run tests/unit

# Integration / Build Verification Tests
npm run test:run tests/integration

# Isolate dedicated file execution
npm run test:run tests/unit/validation.test.ts
```

## Creating New Tests

### Unit Testing

Unit files (`tests/unit/**/*.ts`) strictly evaluate localized application boundaries. Dependencies like external Pastebin API endpoints MUST be strictly mocked to prevent network latency and side-effect failures.

### Integration Testing

When validating complete user flow structures (such as authentication or uploading logic), file the tests under the iterative `tests/integration/` tree. These instances execute interactions spanning your localized Supabase tables up to mocked external response handlers.

For detailed test coverage outlines, consult the `tests/README.md` file.
