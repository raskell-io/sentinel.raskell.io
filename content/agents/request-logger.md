+++
title = "Request Logger"
description = "Structured logging for all requests with customizable fields, sampling, and multiple output formats."
template = "agent.html"

[taxonomies]
tags = ["observability", "logging"]

[extra]
official = false
author = "Jane Developer"
author_url = "https://github.com/jane-dev"
status = "Stable"
version = "2.1.0"
license = "MIT"
repo = "https://github.com/jane-dev/sentinel-request-logger"
protocol_version = "0.1"

# Installation
crate_name = "sentinel-request-logger"
# docker_image = "ghcr.io/jane-dev/sentinel-request-logger"
+++

## Overview

Request Logger provides comprehensive request/response logging with support for structured output formats. Perfect for debugging, auditing, and observability pipelines.

> **Note:** This is a community-contributed agent. For issues and support, please visit the [GitHub repository](https://github.com/jane-dev/sentinel-request-logger).

## Features

- **Structured Logging**: JSON, logfmt, or custom templates
- **Field Selection**: Choose which request/response fields to log
- **Sampling**: Configurable sampling rates for high-traffic services
- **Async Writing**: Non-blocking log writes for minimal latency impact

## Installation

### Using Cargo

```bash
cargo install sentinel-request-logger
```

## Configuration

```kdl
agent "request-logger" {
    socket "/var/run/sentinel/logger.sock"
    timeout 50ms
    fail-open true

    config {
        format "json"
        output "stdout"  // or file path
        sample-rate 1.0  // 100% of requests

        fields {
            request ["method" "path" "headers.user-agent" "body_size"]
            response ["status" "latency_ms" "body_size"]
        }
    }
}
```

## Output Example

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "method": "POST",
  "path": "/api/users",
  "user_agent": "Mozilla/5.0...",
  "request_size": 256,
  "status": 201,
  "latency_ms": 45,
  "response_size": 128
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | string | `"json"` | Output format: `json`, `logfmt`, `text` |
| `output` | string | `"stdout"` | Output destination: `stdout`, `stderr`, or file path |
| `sample-rate` | float | `1.0` | Sampling rate (0.0 - 1.0) |
| `buffer-size` | integer | `1000` | Log buffer size before flush |
