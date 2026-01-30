# ADR 0003: Implementation of Optimistic UI with Undo Pattern

**Status:** Accepted
**Date:** 2026-01-30
**Deciders:** Ramon Reyes
**Technical Story:** N/A

## Context
In high-volume call centers, agent efficiency is paramount. Waiting for a server round-trip to refresh the queue after every call log creates "UI friction" and slows down the workflow, making the application feel sluggish.



## Decision
We implemented **Optimistic UI Updates** in the React frontend. When an agent saves a call log:

1. **Instant Feedback:** The UI immediately filters the debtor out of the local state.
2. **Safety Net:** A "Toast" notification appears with an **Undo** action.
3. **Background Sync:** The API request (`POST /api/queue/{id}/log`) is sent in the background.

If the "Undo" is clicked, the record is restored to the local list. **NOTE:** this feature is *demonstrated* in this PoC; see **Consequences** section below for details. (A vertical-slice implementation of a "Delete Last Log" action has yet to be added.)

## Consequences
- **Pros:** "Instant" perceived performance; reduced cognitive load for the agent; allows for a rapid-fire workflow.
- **Cons:** Increased complexity in frontend state management. In the current PoC, the Undo action is a UI-only restoration; it does not roll back the database transaction. Future iterations would require a DELETE endpoint for the log to maintain full data synchronization.