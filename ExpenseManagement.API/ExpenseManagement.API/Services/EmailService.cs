using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using ExpenseManagement.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string bodyHtml)
    {
        var smtpSettings = _config.GetSection("Smtp");

        using var smtpClient = new SmtpClient()
        {
            Host = smtpSettings["Host"],
            Port = int.Parse(smtpSettings["Port"]),
            EnableSsl = bool.Parse(smtpSettings["EnableSsl"]),
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(
                smtpSettings["Username"],
                smtpSettings["Password"]
            )
        };

        using var mailMessage = new MailMessage()
        {
            From = new MailAddress(smtpSettings["FromEmail"]),
            Subject = subject,
            Body = bodyHtml,
            IsBodyHtml = true
        };

        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }
}
