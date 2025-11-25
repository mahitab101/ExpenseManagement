using System.ComponentModel.DataAnnotations;

namespace ExpenseManagement.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }=DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDelete { get; set; } = false;
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        public ICollection<Expense> Expenses { get; set; }
    }
}
