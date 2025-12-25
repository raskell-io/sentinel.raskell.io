+++
title = "JWT Validator"
description = "Validate and decode JSON Web Tokens with support for RS256, ES256, and HS256 algorithms."
template = "agent.html"

[taxonomies]
tags = ["security", "auth", "core"]

[extra]
official = true
author = "Sentinel Core Team"
status = "Stable"
version = "1.0.0"
repo = "https://github.com/raskell-io/sentinel/tree/main/agents/jwt-validator"
+++

## Overview

The JWT Validator agent authenticates requests by validating JSON Web Tokens. Supports multiple signing algorithms and JWKS endpoints for key rotation.

## Features

- **Multiple Algorithms**: RS256, RS384, RS512, ES256, ES384, ES512, HS256, HS384, HS512
- **JWKS Support**: Automatic key fetching and caching from JWKS endpoints
- **Claims Validation**: Validate issuer, audience, expiration, and custom claims
- **Header Injection**: Forward validated claims to upstream services

## Configuration

```toml
[[agents]]
name = "jwt-validator"

[agents.config]
header = "Authorization"
prefix = "Bearer "
algorithms = ["RS256", "ES256"]
jwks_url = "https://auth.example.com/.well-known/jwks.json"
jwks_cache_ttl = 3600

[agents.config.validation]
issuer = "https://auth.example.com"
audience = ["api.example.com"]
require_exp = true

[agents.config.forward_claims]
"sub" = "X-User-Id"
"email" = "X-User-Email"
```

## Error Responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or malformed token |
| 401 | Invalid signature |
| 401 | Expired token |
| 403 | Claims validation failed |
