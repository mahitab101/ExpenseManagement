using ExpenseManagement.API.Models;

namespace ExpenseManagement.API.DTOs.RecurringExpense
{
    public class CreateRecurringExpenseDto
    {
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public RecurrenceInterval Interval { get; set; }
        public int DayOfPeriod { get; set; } = 1;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int CategoryId { get; set; }
    }
}
