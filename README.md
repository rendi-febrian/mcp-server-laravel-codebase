# mcp-server-laravel

[![npm](https://img.shields.io/npm/v/mcp-server-laravel-codebase)](https://www.npmjs.com/package/mcp-server-laravel-codebase)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![CI](https://github.com/rendi-febrian/mcp-server-laravel-codebase/actions/workflows/ci.yml/badge.svg)](https://github.com/rendi-febrian/mcp-server-laravel-codebase/actions/workflows/ci.yml)
[![GitHub stars](https://img.shields.io/github/stars/rendi-febrian/mcp-server-laravel-codebase?style=social)](https://github.com/rendi-febrian/mcp-server-laravel-codebase)

Laravel Codebase MCP Server — introspect routes, models, controllers, migrations, and more through the [Model Context Protocol](https://modelcontextprotocol.io). Works with any AI client that supports MCP: opencode, Claude Desktop, Cursor, and others.

Stop grepping your Laravel codebase. Let your AI assistant answer "what routes exist?", "show me the User model", or "list all migrations" instantly.

---

## Quick Start

```bash
# Install
npx mcp-server-laravel-codebase

# Or clone
git clone git@github.com:rendi-febrian/mcp-server-laravel-codebase.git
cd mcp-server-laravel-codebase
npm install && npm run build
```

### opencode Configuration

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "laravel-codebase": {
      "type": "local",
      "command": ["node", "/path/to/mcp-server-laravel/dist/index.js"],
      "environment": {
        "LARAVEL_PROJECT_PATH": "/path/to/your/laravel-project"
      },
      "enabled": true
    }
  }
}
```

### Claude Desktop / Cursor / Other MCP Clients

```json
{
  "mcpServers": {
    "laravel-codebase": {
      "command": "node",
      "args": ["/path/to/mcp-server-laravel/dist/index.js"],
      "env": {
        "LARAVEL_PROJECT_PATH": "/path/to/your/laravel-project"
      }
    }
  }
}
```

## Features

### Tools

| Tool | Description | Example |
|---|---|---|
| `routes_list` | All routes with method, URI, controller, middleware | `routes_list(method: "GET")` |
| `models_list` | All Eloquent models with paths and namespaces | `models_list()` |
| `model_detail` | Single model: columns, relations, casts, policies | `model_detail(name: "User")` |
| `controllers_list` | Controllers with optional route mapping | `controllers_list(detail: true)` |
| `app_about` | Laravel version, env, packages, config | `app_about()` |
| `migrations_list` | Migration status (ran/pending) | `migrations_list()` |
| `schedule_list` | Scheduled tasks with frequency | `schedule_list()` |
| `events_list` | Events and registered listeners | `events_list()` |
| `middleware_list` | Middleware aliases with class names | `middleware_list()` |
| `commands_list` | All registered Artisan commands | `commands_list(filter: "make")` |
| `artisan_run` | Run read-only Artisan commands | `artisan_run(command: "route:list --json")` |

### Resources

| URI | Content |
|---|---|
| `laravel://about` | Application info (version, env, drivers) |
| `laravel://routes` | Full route table as JSON |

### Security

`artisan_run` is restricted to **read-only commands**:

`route:list` · `model:show` · `about` · `migrate:status` · `schedule:list` · `event:list` · `middleware` · `db:show` · `db:table` · `config:show` · `queue:failed` · `package:discover`

Write operations (`migrate`, `make:*`, `db:wipe`, etc.) are **blocked**.

## Requirements

- **Node.js** >= 18
- **PHP** 8.1+ with `php` on PATH
- A **Laravel project** (Laravel 9/10/11/12/13)

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `LARAVEL_PROJECT_PATH` | Yes | — | Absolute path to Laravel project root |
| `PHP_BINARY` | No | `php` | Path to PHP binary |

## Switching Projects

Point `LARAVEL_PROJECT_PATH` at any Laravel project. No rebuild needed.

```json
// Inspect FlightManagement API
"LARAVEL_PROJECT_PATH": "/home/user/Kerjaan/FlightManagement"

// Inspect admin panel
"LARAVEL_PROJECT_PATH": "/home/user/Projects/admin-panel"
```

## Architecture

```
src/
├── index.ts              # MCP server entry point (raw Server)
├── artisan.ts            # PHP exec wrapper + whitelist
├── scanner.ts            # Laravel filesystem scanner
├── tools/
│   ├── routes.ts         # routes_list, routes_cache, routes_clear
│   ├── models.ts         # models_list, model_detail
│   ├── controllers.ts    # controllers_list
│   ├── migrations.ts     # migrations_list
│   ├── schedule.ts       # schedule_list
│   ├── events.ts         # events_list
│   ├── middleware.ts      # middleware_list
│   ├── about.ts          # app_about
│   ├── commands.ts       # commands_list
│   └── artisan.ts        # artisan_run
└── resources/
    └── index.ts          # laravel:// URIs
```

No external API calls — everything runs locally via `php artisan` commands and filesystem scanning.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
