/* MASTER SETUP SCRIPT
   Run this in Azure Data Studio or SSMS to initialize the PoC.
*/

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CollectionsDB')
BEGIN
    CREATE DATABASE CollectionsDB;
END
GO

USE CollectionsDB;
GO

-- 1. Schema: Debtors (The Queue)
IF OBJECT_ID('Debtors', 'U') IS NOT NULL DROP TABLE Debtors;
CREATE TABLE Debtors (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    TotalBalance DECIMAL(18, 2) NOT NULL, 
    LastCallDate DATETIME NULL,
    Status NVARCHAR(20) DEFAULT 'New'
);

-- 2. Schema: CallLogs (The History)
IF OBJECT_ID('CallLogs', 'U') IS NOT NULL DROP TABLE CallLogs;
CREATE TABLE CallLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DebtorId INT NOT NULL FOREIGN KEY REFERENCES Debtors(Id),
    AgentNote NVARCHAR(500),
    ResultCode NVARCHAR(50), 
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. Logic: Stored Procedure (SARGable Optimization)
GO
CREATE OR ALTER PROCEDURE sp_GetPriorityQueue
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Optimization: Calculate date ONCE to allow Index Seek
    DECLARE @CutoffDate DATETIME = DATEADD(day, -7, GETDATE());

    SELECT 
        Id, FullName, TotalBalance, LastCallDate,
        CASE 
            WHEN LastCallDate IS NULL THEN 'New Account'
            ELSE 'Follow Up'
        END AS PriorityReason
    FROM Debtors
    WHERE (LastCallDate IS NULL OR LastCallDate <= @CutoffDate)
      AND TotalBalance > 500.00
    ORDER BY TotalBalance DESC;
END
GO

-- 4. Seed Data
SET NOCOUNT ON;
IF NOT EXISTS (SELECT TOP 1 * FROM Debtors)
BEGIN
    INSERT INTO Debtors (FullName, TotalBalance, LastCallDate)
    VALUES 
    ('John Smith', 4500.00, NULL),
    ('Jane Doe', 1200.50, DATEADD(day, -10, GETDATE())),
    ('Bob Wilson', 8900.00, DATEADD(day, -2, GETDATE())), -- Won't show (called recently)
    ('Alice Brown', 340.00, NULL), -- Won't show (balance too low)
    ('Charlie Miller', 6700.25, DATEADD(day, -30, GETDATE()));
    
    PRINT 'Database seeded.';
END