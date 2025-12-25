+++
title = "Request Logger"
description = "Structured logging for all requests with customizable fields, sampling, and multiple output formats."
template = "agent.html"

[taxonomies]
tags = ["observability", "logging"]

[extra]
official = false
author = "Jane Developer"
status = "Stable"
version = "2.1.0"
repo = "https://github.com/jane-dev/sentinel-request-logger"
+++

## Overview

Request Logger provides comprehensive request/response logging with support for structured output formats. Perfect for debugging, auditing, and observability pipelines.

## Features

- **Structured Logging**: JSON, logfmt, or custom templates
- **Field Selection**: Choose which request/response fields to log
- **Sampling**: Configurable sampling rates for high-traffic services
- **Async Writing**: Non-blocking log writes for minimal latency impact

## Configuration

```toml
[[agents]]
name = "request-logger"

[agents.config]
format = "json"
output = "stdout"  # or file path
sample_rate = 1.0  # 100% of requests

[agents.config.fields]
request = ["method", "path", "headers.user-agent", "body_size"]
response = ["status", "latency_ms", "body_size"]
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
