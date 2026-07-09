# mcp-server-laravel

Laravel Codebase MCP Server for [opencode](https://opencode.ai). Introspect routes, models, controllers, migrations, and more — without grepping your codebase.

## Features

| Tool | Description |
|---|---|
| `routes_list` | All routes with method, URI, controller, middleware |
| `models_list` | All Eloquent models with file paths and namespaces |
| `model_detail` | Single model: columns, relations, casts, policies |
| `controllers_list` | All controllers with optional route mapping |
| `app_about` | Laravel version, env, packages, config |
| `migrations_list` | Migration status (ran/pending) |
| `schedule_list` | Scheduled tasks with frequency |
| `events_list` | Events and registered listeners |
| `middleware_list` | Middleware aliases with class names |
| `commands_list` | All registered Artisan commands |
| `artisan_run` | Run any read-only Artisan command |

Also exposes `laravel://about` and `laravel://routes` as MCP resources for context.

## Requirements

- Node.js >= 18
- PHP + Composer (with `php` on PATH)
- A Laravel project

## Install

```bash
git clone git@github.com:rendi-febrian/mcp-server-laravel-codebase.git
cd mcp-server-laravel-codebase
npm install
npm run build
```

## Configure (opencode)

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

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `LARAVEL_PROJECT_PATH` | Yes | — | Absolute path to your Laravel project root |
| `PHP_BINARY` | No | `php` | Path to PHP binary |

## Security

`artisan_run` is restricted to **read-only commands only**:

`route:list` · `model:show` · `about` · `migrate:status` · `schedule:list` · `event:list` · `middleware` · `db:show` · `db:table` · `config:show` · `queue:failed` · `package:discover`

Write commands (`migrate`, `make:*`, `queue:flush`, etc.) are **blocked**.

## Switching Projects

Change `LARAVEL_PROJECT_PATH` in your opencode config to point at any Laravel project on your machine. No rebuild required — the server resolves everything at runtime.

```bash
# Example
# devdbcenter backend
"LARAVEL_PROJECT_PATH": "/home/user/projects/my-laravel-api"

# Filament admin
"LARAVEL_PROJECT_PATH": "/home/user/projects/my-admin-panel"
```

## Troubleshooting

**"artisan not found"** — `LARAVEL_PROJECT_PATH` doesn't point to a valid Laravel root. Ensure `artisan` exists at that path.

**"No JSON found in artisan output"** — Some commands emit warnings before JSON. The server skips non-JSON lines. If this persists, check your Laravel logs.

**Command timeout** — Default is 30s. Large projects with many routes/models may need more time. `artisan_run` accepts a `timeout` parameter in ms.

## License

MIT
