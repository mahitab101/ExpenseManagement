using ExpenseManagement.API.Contracts;

namespace ExpenseManagement.API.Services
{
    /// <summary>
    /// Runs every hour and processes any recurring expenses that are due.
    /// Registered as a hosted service in Program.cs.
    /// </summary>
    public class RecurringExpenseBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<RecurringExpenseBackgroundService> _logger;
        private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

        public RecurringExpenseBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<RecurringExpenseBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Recurring expense background service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IRecurringExpenseRepository>();
                    await repo.ProcessDueRecurringExpenses();
                    _logger.LogInformation("Processed recurring expenses at {Time}", DateTime.UtcNow);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing recurring expenses.");
                }

                await Task.Delay(Interval, stoppingToken);
            }
        }
    }
}
