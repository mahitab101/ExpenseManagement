using ExpenseManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileSystemGlobbing.Internal;
using System.Text;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class InsightsController : ControllerBase
{
    private readonly IConfiguration _config;

    public InsightsController(IConfiguration config)
    {
        _config = config;
    }

    //  [HttpPost("analyze")]
    //  public async Task<IActionResult> Analyze([FromBody] object expenses)
    //  {
    //      var apiKey = _config["Gemini:ApiKey"];

    //         var prompt = $@"
    //              Return ONLY valid JSON (no text before or after) in this format:

    //              {{
    //                ""insights"": [""...""],
    //                ""warnings"": [""...""],
    //                ""tips"": [""...""]
    //              }}

    //              Analyze these expenses:
    //              {JsonSerializer.Serialize(expenses)}
    //              ";

    //      var body = new
    //      {
    //          contents = new[]
    //          {
    //              new {
    //                  parts = new[] {
    //                      new { text = prompt }
    //                  }
    //              }
    //          }
    //      };

    //      var httpClient = new HttpClient();
    //      httpClient.DefaultRequestHeaders.Add("X-goog-api-key", apiKey);
    //      var content = new StringContent(
    //          JsonSerializer.Serialize(body),
    //          Encoding.UTF8,
    //          "application/json"
    //      );

    //      var response = await httpClient.PostAsync(
    //    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",

    //    content
    //);
    //      var responseText = await response.Content.ReadAsStringAsync();

    //      Console.WriteLine(responseText);

    //      using var doc = JsonDocument.Parse(responseText);
    //      var root = doc.RootElement;

    //      if (root.TryGetProperty("error", out var error))
    //      {
    //          return BadRequest(error.ToString());
    //      }

    //      var text = root
    //          .GetProperty("candidates")[0]
    //          .GetProperty("content")
    //          .GetProperty("parts")[0]
    //          .GetProperty("text")
    //          .GetString();

    //      var structured = JsonSerializer.Deserialize<object>(text);

    //      return Ok(structured);
    //  }


    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze([FromBody] object expenses)
    {
        var apiKey = _config["Gemini:ApiKey"];

        if (string.IsNullOrEmpty(apiKey))
            return BadRequest("API key is missing");
       // Analyze these expenses and give short financial insights.
       //Return:
       // 1.spending summary
       // 2.unusual patterns
       // 3.saving suggestions

        var prompt = $@"
                Return ONLY valid JSON (no text before or after) in this format:

                {{
                  ""insights"": [""...""],
                  ""warnings"": [""...""],
                  ""tips"": [""...""]
                }}

                Analyze these expenses:
                {JsonSerializer.Serialize(expenses)}
                ";

        var body = new
        {
            contents = new[]
            {
            new {
                parts = new[] {
                    new { text = prompt }
                }
            }
        }
        };

        var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("X-goog-api-key", apiKey);

        var content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json"
        );

        var response = await httpClient.PostAsync(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent",
            content
        );

        var responseText = await response.Content.ReadAsStringAsync();

        Console.WriteLine(responseText);

        // If request fail
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, responseText);

        using var doc = JsonDocument.Parse(responseText);
        var root = doc.RootElement;

        // If Gemini return error
        if (root.TryGetProperty("error", out var error))
        {
            return BadRequest(error.ToString());
        }

        // Check candidates
        if (!root.TryGetProperty("candidates", out var candidates))
        {
            return BadRequest("Invalid response: " + responseText);
        }

        var text = candidates[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        // TO JSON
        try
        {
            var structured = JsonSerializer.Deserialize<object>(text);
            return Ok(structured);
        }
        catch
        {
            // If Gemini Text not JSON
            return Ok(new { raw = text });
        }
    }
}