# Appwrite Tables (TablesDB) — Quick Reference

Compact, AI-friendly summary of Appwrite Tables (TablesDB) usage: create tables, rows, queries, indexes, permissions, and transactions with short code examples.

## Overview
- Purpose: Tables are containers of rows; each row follows the table's column schema. Appwrite exposes a JSON REST API and SDKs (Web, Server, Mobile).
- When to use: structured application data, user preferences, app content, relations between entities.

## Quick setup (SDK init)
Replace placeholders with your values.

JavaScript (Web / Node):

```js
import { Client, TablesDB } from 'appwrite';

const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const tablesDB = new TablesDB(client);
```

Server SDKs (require API key): set `.setKey('<API_KEY>')` on the client.

## Create a table
Create via Console, CLI or SDK. Example (JS Server style):

```js
// Server/Node example (API key required)
const client = new Client()
  .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>')
  .setKey('<API_KEY>');

const tablesDB = new TablesDB(client);
await tablesDB.createTable({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  name: 'MyTable'
});
```

## Columns (schema)
- Column types: `string`, `integer`, `float`, `boolean`, `datetime`, `enum`, `ip`, `email`, `url`, `point`, `line`, `polygon`, `relationship`.
- Options: `required`, `default`, single vs array values, string size.

## Indexes
- Types: `key` (plain index), `unique`, `fulltext` (for text search).
- Add indexes for columns you query to improve performance.

## Rows — CRUD operations
Note: Table-level or row-level permissions are required for each operation (create/read/update/delete).

Create row (JS):

```js
const row = await tablesDB.createRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: 'unique-id-or-ID.unique()',
  data: { title: 'Hello', owner: '<USER_ID>' },
  // optional permissions array
  // permissions: [ Permission.read('any') ]
});
```

List rows / query (JS):

```js
import { Query } from 'appwrite';

const res = await tablesDB.listRows({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  queries: [ Query.equal('owner', '<USER_ID>'), Query.orderDesc('$createdAt'), Query.limit(25) ]
});
// res.rows contains the items
```

Update row (JS):

```js
await tablesDB.updateRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>',
  data: { title: 'Updated' }
});
```

Upsert (create or update):

```js
await tablesDB.upsertRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>',
  data: { /* ... */ }
});
```

Delete row:

```js
await tablesDB.deleteRow({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  rowId: '<ROW_ID>'
});
```

## Permissions
- Appwrite permissions control access. By default, no permissions are granted when creating a table.
- Grant permissions at table level (applies to all rows) or row level (per-row control).
- Common pattern: table-level `read` = `any` for public read, and per-row `update`/`delete` assigned to `user:<USER_ID>` so only creator can modify their rows.

## Transactions
- Use `transactionId` to stage operations and commit later. Pass the same `transactionId` to multiple operations.

Example:

```js
await tablesDB.createRow({ databaseId, tableId, rowId, data, transactionId: '<TX_ID>' });
await tablesDB.updateRow({ databaseId, tableId, rowId, data2, transactionId: '<TX_ID>' });
// commit via Transactions API (see Appwrite docs)
```

## Type Safety / Models
- Native SDKs (Kotlin, Swift, etc.) and TypeScript generics support type-safe models via `nestedType` or generics on list/create methods.
- Use generated types (CLI helper) for model generation if desired.

## CLI
- You can define tables in `appwrite.json` and use `appwrite init tables` and `appwrite push tables` to create/update tables.

## Best practices
- Add indexes for frequently queried columns.
- Use per-row permissions for user-owned content.
- Keep column sizes flexible when possible to avoid migration issues when increasing string sizes.
- Use transactions for multi-step state changes.

## Useful links
- Official Tables docs: https://appwrite.io/docs/products/databases/tables
- Databases overview: https://appwrite.io/docs/products/databases
- Queries guide & API refs: see Appwrite docs references for Tables endpoints

---
Generated from Appwrite docs (Tables) for quick local reference.
