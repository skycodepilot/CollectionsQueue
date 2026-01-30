# ADR 0001: Use of Vertical Slice Architecture

**Status:** Accepted
**Date:** 2026-01-30
**Deciders:** Ramon Reyes
**Technical Story:** N/A

## Context
Traditional N-Tier or "Clean" architectures often lead to "Lasagna Code," where adding a single field requires changes across multiple projects (Domain, Application, Infrastructure, Web). For a high-speed Proof-of-Concept like CollectionsQueue, we needed a structure that maximizes developer velocity and keeps related logic together.



## Decision
We have adopted a **Vertical Slice Architecture**. Each feature (e.g., "Get Queue" or "Log Call") is treated as a distinct "slice" from the UI down to the Database. 

- In the .NET API, we use Minimal APIs to handle requests directly.
- Data access (Dapper) is contained within the endpoint logic or a feature-specific handler.
- This replaces the traditional approach of horizontal layers (Service/Repository).

## Consequences
- **Pros:** High cohesion; easier to navigate; reduced boilerplate; changes to one feature don't risk breaking unrelated features.
- **Cons:** Potential for code duplication across slices (e.g., SQL connection setup), though this is managed via shared extensions.