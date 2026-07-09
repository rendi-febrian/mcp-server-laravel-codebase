# Contributing

Contributions are welcome! Here's how to get started:

## Development

```bash
git clone git@github.com:rendi-febrian/mcp-server-laravel-codebase.git
cd mcp-server-laravel-codebase
npm install
npm run build
```

Set `LARAVEL_PROJECT_PATH` env var to a Laravel project on your machine, then:

```bash
node dist/index.js
```

Test via MCP Inspector or by piping JSON-RPC messages:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  | LARAVEL_PROJECT_PATH=/path/to/laravel node dist/index.js
```

## Code Style

- TypeScript with strict mode
- ES modules (`"type": "module"`)
- NodeNext module resolution
- 2-space indentation
- No semicolons — let Prettier handle it

## Pull Request Process

1. Ensure build passes (`npm run build`)
2. Update README if adding/changing tools
3. Bump version in `package.json` following semver

## Adding a New Tool

1. Create `src/tools/your-tool.ts` following the `ToolHandler` interface
2. Import and add to `ALL_TOOLS` in `src/index.ts`
3. Export a `ToolHandler` with `name`, `description`, `inputSchema`, and `handler`

## Adding a New Resource

1. Add to the `resources` array in `src/resources/index.ts`
2. Follow the `ResourceDefinition` interface
