using System.Text.Json.Serialization;

namespace ExpenseManagement.API.DTOs.Account
{
    public class UserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Token { get; set; }
        [JsonIgnore]
        public string RefreshToken { get; set; }
        public string Email { get; set; }
        public DateTime ExpiresOn { get; set; }
    }
}
