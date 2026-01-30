# ADR 0002: Choice of Dapper and SARGable SQL over EF Core

**Status:** Accepted
**Date:** 2026-01-30
**Deciders:** Ramon Reyes
**Technical Story:** N/A

## Context
Financial collections systems involve large datasets where query performance is critical. ORMs like Entity Framework can generate inefficient SQL, especially with complex date logic (e.g., "last called over 7 days ago"), leading to table scans that slow down as the database grows to millions of rows.

## Decision
We chose **Dapper (Micro-ORM)** combined with **Stored Procedures** and **SARGable (Search ARgumentable) queries**. 

1. **SARGability:** In `sp_GetPriorityQueue`, we calculate the `@CutoffDate` once as a variable rather than using functions like `DATEDIFF` or `DATEADD` inside the `WHERE` clause. This allows the SQL engine to perform an **Index Seek**.
2. **Dapper:** Used for its near-native performance and simplicity in mapping SQL results to the `DebtorViewModel`.



## Consequences
- **Pros:** Sub-millisecond query execution; full control over the execution plan; significantly lower CPU overhead on the Web Server compared to EF Core.
- **Cons:** Requires manual SQL maintenance; no automated migrations (handled via `setup.sql`).