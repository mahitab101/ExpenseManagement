namespace ExpenseManagement.API.DTOs.CategoryBudget
{
    public class SetCategoryBudgetDto
    {
        public int CategoryId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal Amount { get; set; }
    }
}
