# Getting Started (New Contributors)

[中文](./GETTING_STARTED.md)

## 1. Requirements

- Node.js >= 20
- Yarn (default package manager in this repo)
- Git

## 2. Initialize the project

```bash
yarn
cp .env.example .env.local
```

Set the 4 core environment variables in `.env.local`:

- `NOTION_PAGE_ID`: 32-character Notion database ID
- `ADMIN_PASSWORD`: Admin dashboard password
- `NOTION_ACCESS_TOKEN`: Notion official Integration Token (for data writeback & membership)
- `NOTION_SYNC_SECRET`: Secret key for secure Webhook & Cron sync (prevents 403 Forbidden in production)

Then start dev server:

```bash
yarn dev
```

## 3. Recommended local checks

```bash
yarn lint
yarn type-check
yarn test
```

## 4. Read these first

1. [Architecture Overview](./ARCHITECTURE.en.md)
2. [Project Structure](./PROJECT_STRUCTURE.en.md)
3. [Configuration System](./CONFIGURATION.en.md)
4. [Contribution Workflow](./CONTRIBUTION_WORKFLOW.en.md)

## 5. First contribution advice

- Start with small scoped fixes (single file/module).
- Do not mix multiple change types in one PR.
- Ensure lint/test pass before opening PR.

