using System.ComponentModel.DataAnnotations;

namespace ExpenseManagement.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        [Required]
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }=DateTime.Now;
        public DateTime UpdatedAt { get; set; }
        public bool IsDelete { get; set; } = false;
        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; }

        public ICollection<Expense> Expenses { get; set; }
    }
}
