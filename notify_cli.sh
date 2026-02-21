#!/bin/bash

# Simple wrapper to execute the notify_cli TS script safely.
export NODE_ENV=production

echo "Triggering SitePlod CLI Announcement Script..."
bun run scripts/notify_cli.ts
