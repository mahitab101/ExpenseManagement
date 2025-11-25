using System.ComponentModel.DataAnnotations;

namespace ExpenseManagement.API.DTOs.category
{
    public class CreateCategoryDto
    {
        [Required]
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; } = string.Empty;
    }
}
