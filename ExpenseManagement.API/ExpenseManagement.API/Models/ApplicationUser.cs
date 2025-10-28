using Microsoft.AspNetCore.Identity;

namespace ExpenseManagement.API.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<Category> Categories { get; set; }
        public ICollection<Expense> Expenses { get; set; }
    }
}
