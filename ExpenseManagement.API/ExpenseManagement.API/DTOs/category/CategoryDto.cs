namespace ExpenseManagement.API.DTOs.category
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; } 
        public DateTime CreatedAt { get; set; } 
    }
}
