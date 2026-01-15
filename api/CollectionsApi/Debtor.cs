namespace CollectionsApi;

public class DebtorViewModel
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public decimal TotalBalance { get; set; }
    public DateTime? LastCallDate { get; set; }
    public string PriorityReason { get; set; } = string.Empty;
}