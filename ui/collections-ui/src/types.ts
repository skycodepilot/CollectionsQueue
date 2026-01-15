// This matches your C# DebtorViewModel exactly
// Note: We use camelCase keys because .NET API converted them automatically!
export interface Debtor {
    id: number;
    fullName: string;
    totalBalance: number;
    lastCallDate: string | null; // APIs send Dates as strings
    priorityReason: string;
}