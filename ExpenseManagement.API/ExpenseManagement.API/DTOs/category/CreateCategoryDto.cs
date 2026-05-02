using System.ComponentModel.DataAnnotations;

namespace ExpenseManagement.API.DTOs.category
{
    public class CreateCategoryDto
    {
        [Required]
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryDescription { get; set; } = string.Empty;
        public string Icon { get; set; } = "🍔";
        public string Color { get; set; } = "#6366F1";
    }
}
