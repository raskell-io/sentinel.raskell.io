+++
title = "Rate Limiter"
description = "Token bucket rate limiting with configurable windows and limits per route, IP, or custom keys."
template = "agent.html"

[taxonomies]
tags = ["security", "traffic", "core"]

[extra]
official = true
author = "Sentinel Core Team"
status = "Stable"
version = "1.0.0"
repo = "https://github.com/raskell-io/sentinel/tree/main/agents/rate-limiter"
+++

## Overview

The Rate Limiter agent provides flexible traffic control using the token bucket algorithm. Protect your upstream services from traffic spikes and abuse.

## Features

- **Token Bucket Algorithm**: Industry-standard rate limiting with burst support
- **Multiple Key Types**: Limit by IP, route, header value, or custom extractors
- **Distributed State**: Optional Redis backend for multi-instance deployments
- **Graceful Handling**: Configurable behavior for limit exceeded scenarios

## Configuration

```toml
[[agents]]
name = "rate-limiter"

[agents.config]
default_limit = 100
window_seconds = 60
burst_size = 20
key_type = "ip"

[[agents.config.routes]]
pattern = "/api/auth/*"
limit = 10
window_seconds = 60
```

## Response Headers

When enabled, the agent adds standard rate limit headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when the window resets
