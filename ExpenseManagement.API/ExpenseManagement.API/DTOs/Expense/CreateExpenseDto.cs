namespace ExpenseManagement.API.DTOs.Expense
{
    public class CreateExpenseDto
    {
        public string Title { get; set; }
        public decimal Amount { get; set; }
        public int CategoryId { get; set; }
        public DateTime Date { get; set; }
    }
}
