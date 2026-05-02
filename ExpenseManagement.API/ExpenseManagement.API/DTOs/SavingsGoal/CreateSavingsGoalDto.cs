namespace ExpenseManagement.API.DTOs.SavingsGoal
{
    public class CreateSavingsGoalDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Target { get; set; }
        public decimal Saved { get; set; } = 0;
        public string Color { get; set; } = "0";
    }
}
