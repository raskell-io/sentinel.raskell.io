+++
title = "Response Cache"
description = "High-performance response caching with TTL controls, cache tags, and programmatic invalidation."
template = "agent.html"

[taxonomies]
tags = ["performance", "cache", "core"]

[extra]
official = true
author = "Sentinel Core Team"
status = "Experimental"
version = "0.9.0"
repo = "https://github.com/raskell-io/sentinel/tree/main/agents/cache"
+++

## Overview

The Response Cache agent accelerates your services by caching upstream responses. Supports memory and Redis backends with flexible invalidation strategies.

## Features

- **Multiple Backends**: In-memory LRU or Redis for distributed caching
- **Smart Key Generation**: Customizable cache keys including headers and query params
- **Cache Tags**: Group cached items for bulk invalidation
- **Stale-While-Revalidate**: Serve stale content while refreshing in background

## Configuration

```toml
[[agents]]
name = "cache"

[agents.config]
backend = "memory"  # or "redis"
max_size = "512MB"
default_ttl = 300

[[agents.config.rules]]
pattern = "/api/products/*"
ttl = 3600
vary = ["Accept-Language"]
tags = ["products"]

[[agents.config.rules]]
pattern = "/api/users/*"
bypass = true
```

## Cache Control

The agent respects standard HTTP cache headers:

- `Cache-Control: no-store` - Bypass cache
- `Cache-Control: max-age=N` - Override TTL
- `Vary: Header` - Include header in cache key

## Invalidation API

```bash
# Invalidate by tag
curl -X PURGE http://sentinel/cache/tags/products

# Invalidate by URL pattern
curl -X PURGE http://sentinel/cache/urls -d '{"pattern": "/api/products/*"}'
```
