namespace CollectionsApi;

public class CallLogRequest
{
    // We don't need the DebtorId here because it will be in the URL (e.g., /api/queue/55/log)
    public string Note { get; set; } = string.Empty;
    public string ResultCode { get; set; } = string.Empty; // e.g. "PTP", "Hangup"
}