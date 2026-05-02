namespace ExpenseManagement.API.DTOs.category
{
    public class AllocateSurplusDto
    {
        public int SavingsGoalId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal Amount { get; set; }
    }
}
