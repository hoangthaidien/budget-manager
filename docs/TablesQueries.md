# Appwrite Tables — Detailed Query Reference

This reference focuses on querying Appwrite Tables (TablesDB). It lists common query operators, pagination, ordering, full-text search, and usage examples across SDKs (JavaScript and Python) and GraphQL. Replace placeholders like `<DATABASE_ID>`, `<TABLE_ID>`, and `<USER_ID>` with your values.

## Query basics
- Queries are used with `listRows` (or the equivalent SDK method) to filter, sort, and paginate table rows.
- Queries are passed as an array of `Query.*` helpers in the Web SDK, or as equivalent parameters in native/server SDKs.

## Common Query Operators
- `Query.equal(field, value)` — exact equality.
- `Query.notEqual(field, value)` — not equal.
- `Query.lessThan(field, value)` — strictly less than.
- `Query.lessThanEqual(field, value)` — less than or equal.
- `Query.greaterThan(field, value)` — strictly greater than.
- `Query.greaterThanEqual(field, value)` — greater than or equal.
- `Query.contains(field, value)` — array contains (for array columns) or substring depends on SDK semantics.
- `Query.search(field, query)` — full-text search (requires `fulltext` index on that column).
- `Query.orderAsc(field)` / `Query.orderDesc(field)` — ordering results.
- `Query.limit(n)` — maximum number of results.
- `Query.offset(n)` — skip first `n` results (pagination).
- `Query.cursorAfter(rowId)` / `Query.cursorBefore(rowId)` — cursor-based pagination when supported.

Note: Supported operators can vary slightly between SDKs and versions — check your SDK docs or Appwrite references for the most up-to-date list.

## Combining queries
- Provide multiple Query clauses in the `queries` array to combine filters (logical AND).
- For OR-like behavior, Appwrite supports some compound query functions depending on SDK/API version — consult the API reference for complex boolean combinations.

## Full-text search
- Add a `fulltext` index on a string column to enable `Query.search`. This index is required for server-side full-text queries.

## Example: Simple list + filters (JavaScript)

```js
import { Client, TablesDB, Query } from 'appwrite';

const client = new Client().setEndpoint('https://<REGION>.cloud.appwrite.io/v1').setProject('<PROJECT_ID>');
const tablesDB = new TablesDB(client);

// Get current user's rows, newest first, limit 20
const res = await tablesDB.listRows({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  queries: [
    Query.equal('owner', '<USER_ID>'),
    Query.orderDesc('$createdAt'),
    Query.limit(20)
  ]
});

console.log(res.total, res.rows);
```

## Example: Full-text search (JavaScript)

```js
// Ensure a `fulltext` index exists on the `content` column
const res = await tablesDB.listRows({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  queries: [ Query.search('content', 'budget planning') ]
});

console.log(res.rows);
```

## Example: Pagination (cursor-based) (JavaScript)

```js
// First page
const first = await tablesDB.listRows({ databaseId: '<DATABASE_ID>', tableId: '<TABLE_ID>', queries: [ Query.orderDesc('$createdAt'), Query.limit(10) ] });
const lastRowId = first.rows[first.rows.length - 1]._id;

// Next page using cursor (if SDK supports cursor queries)
const next = await tablesDB.listRows({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  queries: [ Query.orderDesc('$createdAt'), Query.cursorAfter(lastRowId), Query.limit(10) ]
});
```

If cursor helpers are not available in your SDK version, use `offset` + `limit` for simple pagination.

## Example: Compound numeric/date queries (JavaScript)

```js
// Find rows with price between 10 and 100, and created after a date
const res = await tablesDB.listRows({
  databaseId: '<DATABASE_ID>',
  tableId: '<TABLE_ID>',
  queries: [
    Query.greaterThanEqual('price', 10),
    Query.lessThanEqual('price', 100),
    Query.greaterThan('createdAt', '2025-01-01T00:00:00Z'),
    Query.orderAsc('price')
  ]
});
```

## Example: Python (server SDK)

```py
from appwrite.client import Client
from appwrite.services.tablesDB import TablesDB

client = Client()
client.set_endpoint('https://<REGION>.cloud.appwrite.io/v1').set_project('<PROJECT_ID>')
tables = TablesDB(client)

# List rows with simple equality and ordering
res = tables.list_rows(database_id='<DATABASE_ID>', table_id='<TABLE_ID>', queries=["equal('owner', ['<USER_ID>'])", "orderDesc('$createdAt')", "limit(20)"])
print(res)
```

Note: Python SDK may accept `queries` as a list of query strings rather than helper objects — follow SDK conventions.

## Example: GraphQL

```graphql
query {
  tablesListRows(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    queries: ["equal(\"owner\", [\"<USER_ID>\"])", "orderDesc(\"$createdAt\")", "limit(20)"]
  ) {
    total
    rows { _id data _createdAt }
  }
}
```

## Type-safe usage (mobile/native SDKs)
- Native SDKs allow `nestedType` (Kotlin/Swift) or generics (TypeScript) so responses map to typed models.

## Performance tips
- Index every column you frequently query — Appwrite recommends indexes per queried column.
- Use compound indexes when you often query by multiple columns together.
- Prefer cursor-based pagination for large datasets when supported.

## Permissions and queries
- You must have `read` permissions at the table level or for the specific rows to retrieve data.
- Queries do not bypass Appwrite permissions — results are filtered by the permissions of the requesting API key or user.

## When queries fail or return empty
- Verify your column names (use exact column keys).
- Ensure the correct index exists for full-text operations.
- Confirm permissions are granted for the requesting user or API key.

## Further reading
- Official Tables docs: https://appwrite.io/docs/products/databases/tables
- Queries guide & API references: https://appwrite.io/docs/products/databases/queries

---
This file was generated as a developer-friendly, detailed query reference for Appwrite Tables.

## Advanced Examples

### Compound queries (OR / IN / array checks)
- Appwrite's basic `queries` array composes filters with logical AND. For OR-like semantics or complex boolean logic, some SDK/API versions provide compound helpers or allow you to pass compound query strings (GraphQL/REST). If your SDK doesn't provide OR helpers, you can issue multiple queries client-side and merge results (with attention to pagination and deduplication).

JavaScript example: `IN`-style (multiple equality filters merged client-side):

```js
// Find rows where status is 'pending' OR 'draft' (client-side merge)
const pending = await tablesDB.listRows({ databaseId, tableId, queries: [ Query.equal('status', 'pending') ] });
const draft = await tablesDB.listRows({ databaseId, tableId, queries: [ Query.equal('status', 'draft') ] });
// Merge and dedupe by _id
const map = new Map();
[...pending.rows, ...draft.rows].forEach(r => map.set(r._id, r));
const combined = Array.from(map.values());
```

GraphQL / REST may accept compound expressions like `in()` depending on your Appwrite version. Example GraphQL `in` pseudo-string (check API reference):

```graphql
query {
  tablesListRows(
    databaseId: "<DATABASE_ID>",
    tableId: "<TABLE_ID>",
    queries: ["in(\"status\", [\"pending\", \"draft\"])", "limit(50)"]
  ) { total rows { _id data } }
}
```

Array contains (example)

```js
// For an array column `tags`, find rows that contain 'finance'
const res = await tablesDB.listRows({ databaseId, tableId, queries: [ Query.contains('tags', 'finance') ] });
```

### Transactions (staging multiple ops)
- Use `transactionId` to stage row operations and then commit them atomically via the Transactions API. This prevents partial updates during multi-step workflows.

JavaScript example (staged ops):

```js
const txId = 'tx-' + Date.now();

// Stage create
await tablesDB.createRow({ databaseId, tableId, rowId: ID.unique(), data: { title: 'Draft' }, transactionId: txId });

// Stage update to another row
await tablesDB.updateRow({ databaseId, tableId, rowId: '<ROW_ID_TO_UPDATE>', data: { status: 'locked' }, transactionId: txId });

// Commit transaction (Transactions API / SDK method)
// Pseudocode — see Appwrite Transactions API for exact call
// await transactions.commitTransaction({ databaseId, transactionId: txId });
```

Python example (staged ops):

```py
# Stage ops with a shared transaction_id string
tx_id = 'tx-12345'
tables.create_row(database_id=database_id, table_id=table_id, row_id='r1', data={'title':'Draft'}, transaction_id=tx_id)
tables.update_row(database_id=database_id, table_id=table_id, row_id='r2', data={'status':'locked'}, transaction_id=tx_id)
# Commit via Transactions API (refer to Appwrite docs for commit call)
```

Notes:
- The exact commit/rollback API calls depend on Appwrite server API versions and SDKs — consult the Transactions guide in the Appwrite docs.
- Transactions are useful for workflows that must not leave partially-applied changes.

### Type-safe usage (expanded)
- Type-safe models improve developer DX and reduce runtime errors. Use `nestedType` (native SDKs) or generics (TypeScript) to map rows to typed models.

TypeScript (web) example with generics:

```ts
interface BudgetItem { id?: string; title: string; amount: number; owner: string }

const res = await tablesDB.listRows<BudgetItem>({ databaseId, tableId, queries: [ Query.limit(50) ] });
const items: BudgetItem[] = res.rows;
```

Kotlin (native) example with `nestedType`:

```kotlin
data class BudgetItem(val title: String, val amount: Double, val owner: String)

val result = tablesDB.listRows(databaseId = "<DATABASE_ID>", tableId = "<TABLE_ID>", nestedType = BudgetItem::class.java)
val items: List<BudgetItem> = result.rows
```

Swift (native) example:

```swift
struct BudgetItem: Codable { let title: String; let amount: Double; let owner: String }

let rows = try await tablesDB.listRows(databaseId: "<DATABASE_ID>", tableId: "<TABLE_ID>", nestedType: BudgetItem.self)
// rows.rows is typed to BudgetItem
```

Tips:
- Generate client types with the Appwrite CLI (`appwrite types collection`) to keep types in sync with your table schema.
- Use typed models for API responses and map unmapped fields carefully (e.g., `$createdAt`, `$permissions`).

---
Appendix: if you want, I can add concrete Transaction API calls and explicit GraphQL/REST payload examples for commit/rollback based on your Appwrite server version.
