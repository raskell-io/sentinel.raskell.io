+++
title = "Geo Filter"
description = "Allow or block traffic based on geographic location using IP geolocation databases."
template = "agent.html"

[taxonomies]
tags = ["security", "traffic", "geo"]

[extra]
official = true
author = "Sentinel Core Team"
status = "Stable"
version = "1.0.0"
repo = "https://github.com/raskell-io/sentinel/tree/main/agents/geo-filter"
+++

## Overview

The Geo Filter agent enables geographic access control for your services. Block or allow traffic by country, region, or city using MaxMind GeoIP2 databases.

## Features

- **Country Filtering**: Allow/deny lists by ISO country codes
- **Region/City Support**: Fine-grained filtering by subdivision
- **MaxMind Integration**: Native support for GeoIP2 and GeoLite2 databases
- **Header Injection**: Add geo information headers for downstream processing

## Configuration

```toml
[[agents]]
name = "geo-filter"

[agents.config]
database_path = "/data/GeoLite2-City.mmdb"
mode = "allowlist"  # or "denylist"
countries = ["US", "CA", "GB", "DE"]

[agents.config.headers]
country = "X-Geo-Country"
city = "X-Geo-City"
latitude = "X-Geo-Lat"
longitude = "X-Geo-Lon"

[[agents.config.exceptions]]
path = "/health"
bypass = true
```

## Database Updates

The agent supports hot-reloading of GeoIP databases. Update the database file and send `SIGHUP` to reload without restart.
