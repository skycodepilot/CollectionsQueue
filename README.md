# Collections Queue Dashboard (PoC)

A "Vertical Slice" Proof-of-Concept for a high-volume financial collections system. This project demonstrates a full-stack implementation of a prioritized work queue, focusing on performance, data integrity, and optimistic UI patterns.

## 🏗 Tech Stack & Architecture

* **Database:** MS SQL Server 2022 (Dockerized)
* **API:** .NET 9 Web API (Minimal API pattern)
* **ORM:** Dapper (Micro-ORM for high-performance raw SQL execution)
* **Frontend:** React 19 + TypeScript (Vite)
* **State Management:** React Hooks + Optimistic UI updates

## 🚀 Key Features & Interview Talking Points

### 1. Performance-First SQL (SARGable Queries)
The core logic resides in the `sp_GetPriorityQueue` stored procedure. 
* **Optimization:** Instead of using functions like `DATEDIFF` on table columns (which kills index usage), the query calculates the `@CutoffDate` variable *before* the lookup.
* **Result:** This ensures the SQL engine performs an **Index Seek** rather than a full Table Scan, essential for scaling to millions of debtor records.

### 2. Vertical Slice Architecture
The application is not built in horizontal layers (all generic Repositories, then all Services). It is built in vertical slices per feature. 
* **Read Slice:** `GET /api/queue` → Dapper Query → SQL Stored Proc
* **Write Slice:** `POST /api/queue/{id}/log` → Dapper Command → Parametrized SQL Insert

### 3. Optimistic UI & Error Recovery
The React frontend implements the "Work Queue" pattern.
* **Instant Feedback:** When an agent logs a call, the item is removed from the UI *immediately* (Optimistic Update) without waiting for the server round-trip.
* **Safety Net:** An "Undo" Toast notification allows the agent to recover the item in case of accidental clicks, restoring the view state without refreshing the data.

## 🛠 How to Run Locally

### Prerequisites
* Docker
* .NET 9 SDK
* Node.js (LTS)

### 1. Database Setup

    # Configuration
    The appsettings.json file contains a placeholder connection string. Update Password=YOUR_PASSWORD_HERE with your local SQL Server password before running.

    # Spin up the container
    docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YOUR_PASSWORD_HERE" -p 1433:1433 --name sql_server_dev -d mcr.microsoft.com/mssql/server:2022-latest

    # (See the Configuration section above for context on the password in the connection string)

    # Connect via Azure Data Studio and run the setup scripts in /sql (if provided) or manually seed data.

### 2. API Setup

    # Navigate to the nested project folder
    cd api/CollectionsApi
    dotnet run
    # API will be available at http://localhost:5196

### 3. Frontend Setup

    # Navigate to the nested project folder
    cd ui/collections-ui
    npm install
    npm run dev
    # UI will be available at http://localhost:5173