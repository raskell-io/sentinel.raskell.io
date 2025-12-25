# sentinel.raskell.io

Landing page and agent registry for [Sentinel](https://github.com/raskell-io/sentinel), a security-first reverse proxy based on Pingora.

## Tech Stack

- [Zola](https://www.getzola.org/) - Static site generator
- [mise](https://mise.jdx.dev/) - Task runner and tool versioning
- [Catppuccin](https://catppuccin.com/) - Color palette inspiration
- [Geist](https://vercel.com/font) - Typeface

## Development

### Prerequisites

Install mise following the [official guide](https://mise.jdx.dev/getting-started.html).

### Setup

```bash
# Install tools (Zola)
mise install

# Start development server
mise run serve
```

The site will be available at `http://127.0.0.1:1111`.

### Build

```bash
# Build for production
mise run build
```

Output is generated in the `public/` directory.

### Image Optimization

Convert PNG/JPG images to AVIF format:

```bash
mise run convert-images
```

Requires ImageMagick (`brew install imagemagick`).

## Project Structure

```
sentinel.raskell.io/
├── config.toml          # Zola configuration
├── mise.toml            # mise tasks and tools
├── content/
│   ├── _index.md        # Homepage
│   └── agents/          # Agent registry
├── sass/
│   └── style.scss       # Styles (Catppuccin theme)
├── static/
│   ├── favicon.svg
│   └── img/
└── templates/
    ├── base.html        # Base layout
    ├── index.html       # Homepage template
    ├── agents.html      # Agent list template
    └── agent.html       # Individual agent template
```

## Adding Agents

Create a new markdown file in `content/agents/`:

```markdown
+++
title = "Agent Name"
description = "Short description"
template = "agent.html"

[taxonomies]
tags = ["security", "auth"]

[extra]
official = false  # true for Sentinel Core Team agents
author = "Your Name"
status = "Stable"  # Stable, Experimental, or Deprecated
version = "1.0.0"
repo = "https://github.com/..."
+++

Agent documentation content here...
```

The registry page displays official and community agents in separate sections.

## Deployment

The site is designed for deployment to Cloudflare Pages at `sentinel.raskell.io`.

Build command: `mise run build`
Output directory: `public`

## License

MIT - see [LICENSE](./LICENSE)
