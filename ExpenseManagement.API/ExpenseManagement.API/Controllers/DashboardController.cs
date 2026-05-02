//using ExpenseManagement.API.Data;
//using ExpenseManagement.API.DTOs.Dashboard;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using System.Security.Claims;

//namespace ExpenseManagement.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class DashboardController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;

//        public DashboardController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetDashboardData()
//        {

//            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

//            if (string.IsNullOrEmpty(userId)) return Unauthorized();
//            var now = DateTime.Now;
//            var firstDayThisMonth = new DateTime(now.Year, now.Month, 1);
//            var firstDayLastMonth = firstDayThisMonth.AddMonths(-1);
//            var today = now.Date;
//            var yesterday = today.AddDays(-1);

//            // استعلام أساسي لتقليل التكرار
//            var userExpenses = _context.Expenses
//                .Where(e => e.UserId == userId && !e.IsDelete);

//            // 1. حساب إحصائيات الشهر الحالي والشهر الماضي للمقارنة
//            var thisMonthTotal = await userExpenses
//                .Where(e => e.Date >= firstDayThisMonth)
//                .SumAsync(e => e.Amount);

//            var lastMonthTotal = await userExpenses
//                .Where(e => e.Date >= firstDayLastMonth && e.Date < firstDayThisMonth)
//                .SumAsync(e => e.Amount);

//            // حساب نسبة التغير (مثلاً: +10% أو -5%)
//            double percentageChange = 0;
//            if (lastMonthTotal > 0)
//            {
//                percentageChange = (double)((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
//            }

//            // 2. الفئة الأكثر إنفاقاً (Top Category)
//            var topCategory = await userExpenses
//                .GroupBy(e => e.Category.CategoryName)
//                .Select(g => new { Name = g.Key, Amount = g.Sum(e => e.Amount) })
//                .OrderByDescending(x => x.Amount)
//                .FirstOrDefaultAsync();

//            // 3. بيانات الرسم البياني الشهري (آخر 6 أشهر)
//            var monthlyCharts = await userExpenses
//                .Where(e => e.Date >= now.AddMonths(-6))
//                .GroupBy(e => new { e.Date.Year, e.Date.Month })
//                .Select(g => new ChartDataDto
//                {
//                    Label = g.Key.Month + "/" + g.Key.Year,
//                    Total = g.Sum(e => e.Amount)
//                })
//                .ToListAsync();

//            // 4. بيانات الرسم البياني السنوي
//            var yearlyCharts = await userExpenses
//                .GroupBy(e => e.Date.Year)
//                .Select(g => new ChartDataDto
//                {
//                    Label = g.Key.ToString(),
//                    Total = g.Sum(e => e.Amount)
//                })
//                .ToListAsync();

//            // 5. المصاريف الأخيرة (اليوم وأمس) مع تفاصيل الفئة
//            var recentData = await userExpenses
//                .Where(e => e.Date >= yesterday)
//                .OrderByDescending(e => e.Date)
//                .Select(e => new { e.Title, e.Amount, e.Date, CategoryName = e.Category.CategoryName })
//                .ToListAsync();

//            var response = new DashboardDto
//            {
//                Summary = new SummaryDto
//                {
//                    TotalExpense = await userExpenses.SumAsync(e => e.Amount),
//                    ThisMonthExpense = thisMonthTotal,
//                    PercentageChange = Math.Round(percentageChange, 2),
//                    TopCategoryName = topCategory?.Name ?? "لا يوجد",
//                    TopCategoryAmount = topCategory?.Amount ?? 0
//                },
//                MonthlyCharts = monthlyCharts,
//                YearlyCharts = yearlyCharts,
//                RecentExpenses = new RecentExpensesDto
//                {
//                    Today = recentData.Where(d => d.Date.Date == today)
//                        .Select(d => new ExpenseShortDto { Title = d.Title, Amount = d.Amount, CategoryName = d.CategoryName }).ToList(),
//                    Yesterday = recentData.Where(d => d.Date.Date == yesterday)
//                        .Select(d => new ExpenseShortDto { Title = d.Title, Amount = d.Amount, CategoryName = d.CategoryName }).ToList()
//                }
//            };

//            return Ok(response);
//        }
//    }
//}


using ExpenseManagement.API.Data;
using ExpenseManagement.API.DTOs.Dashboard;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ExpenseManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardData()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var now = DateTime.Now;
            var today = now.Date;
            var yesterday = today.AddDays(-1);
            var firstDayThisMonth = new DateTime(now.Year, now.Month, 1);
            var firstDayLastMonth = firstDayThisMonth.AddMonths(-1);

            // ── Base query ─────────────────────────────────────────────────────
            var userExpenses = _context.Expenses
                .Where(e => e.UserId == userId && !e.IsDelete);

            // ── 1. Monthly totals for percentage change ────────────────────────
            var thisMonthTotal = await userExpenses
                .Where(e => e.Date >= firstDayThisMonth)
                .SumAsync(e => e.Amount);

            var lastMonthTotal = await userExpenses
                .Where(e => e.Date >= firstDayLastMonth && e.Date < firstDayThisMonth)
                .SumAsync(e => e.Amount);

            double percentageChange = lastMonthTotal > 0
                ? (double)((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
                : 0;

            // ── 2. Top spending categories (monthly) ───────────────────────────
            var topCategories = await userExpenses
                .Where(e => e.Date >= firstDayThisMonth)
                .GroupBy(e => new {
                    e.Category.CategoryName,
                    e.CategoryId,
                    e.Category.Icon,
                    e.Category.Color
                })
                .Select(g => new TopCategoryDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.CategoryName,
                    Icon = g.Key.Icon,
                    Color = g.Key.Color,
                    Amount = g.Sum(e => e.Amount),
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Amount)
                .Take(4)
                .ToListAsync();

            // Add percentage share of each category vs this month total
            if (thisMonthTotal > 0)
            {
                foreach (var cat in topCategories)
                    cat.Percentage = Math.Round((double)(cat.Amount / thisMonthTotal) * 100, 1);
            }

            var topCategory = topCategories.FirstOrDefault();

            var monthlyCharts = await userExpenses
                .Where(e => e.Date >= now.AddMonths(-6))
                .GroupBy(e => new { e.Date.Year, e.Date.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Total = g.Sum(e => e.Amount)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            var monthlyChartDtos = monthlyCharts.Select(x => new ChartDataDto
            {
                Label = x.Month + "/" + x.Year,
                Total = x.Total
            }).ToList();
            // ── 4. Yearly chart ────────────────────────────────────────────────
            var yearlyCharts = await userExpenses
                .GroupBy(e => e.Date.Year)
                .Select(g => new ChartDataDto
                {
                    Label = g.Key.ToString(),
                    Total = g.Sum(e => e.Amount)
                })
                .OrderBy(x => x.Label)
                .ToListAsync();

            // ── 5. Recent expenses (today + yesterday) ─────────────────────────
            var recentData = await userExpenses
                .Where(e => e.Date >= yesterday)
                .OrderByDescending(e => e.Date)
                .Select(e => new
                {
                    e.Title,
                    e.Amount,
                    e.Date,
                    CategoryName = e.Category.CategoryName
                })
                .ToListAsync();

            // ── 6. Smart alerts ────────────────────────────────────────────────
            var alerts = new List<AlertDto>();

            // Alert: spending up more than 20% vs last month
            if (percentageChange > 20)
            {
                alerts.Add(new AlertDto
                {
                    Type = "warning",
                    Message = $"Your spending is up {Math.Round(percentageChange, 1)}% compared to last month."
                });
            }

            // Alert: spending down (positive feedback)
            if (percentageChange < -10)
            {
                alerts.Add(new AlertDto
                {
                    Type = "success",
                    Message = $"Great job! You spent {Math.Abs(Math.Round(percentageChange, 1))}% less than last month."
                });
            }

            // Alert: category over budget (any single category > 50% of total this month)
            var dominantCategory = topCategories.FirstOrDefault(c => c.Percentage > 50);
            if (dominantCategory != null)
            {
                alerts.Add(new AlertDto
                {
                    Type = "info",
                    Message = $"\"{dominantCategory.CategoryName}\" accounts for {dominantCategory.Percentage}% of your spending this month."
                });
            }

            // Alert: no expenses yet this month
            if (thisMonthTotal == 0)
            {
                alerts.Add(new AlertDto
                {
                    Type = "info",
                    Message = "No expenses recorded this month yet."
                });
            }

            // ── Response ───────────────────────────────────────────────────────
            var response = new DashboardDto
            {
                Summary = new SummaryDto
                {
                    TotalExpense = await userExpenses.SumAsync(e => e.Amount),
                    ThisMonthExpense = thisMonthTotal,
                    LastMonthTotal = lastMonthTotal,
                    PercentageChange = Math.Round(percentageChange, 2),
                    TopCategoryName = topCategory?.CategoryName ?? "N/A",
                    TopCategoryAmount = topCategory?.Amount ?? 0
                },
                TopCategories = topCategories,
                MonthlyCharts = monthlyChartDtos,  
                YearlyCharts = yearlyCharts,
                Alerts = alerts,
                RecentExpenses = new RecentExpensesDto
                {
                    Today = recentData
                        .Where(d => d.Date.Date == today)
                        .Select(d => new ExpenseShortDto
                        {
                            Title = d.Title,
                            Amount = d.Amount,
                            CategoryName = d.CategoryName
                        }).ToList(),
                    Yesterday = recentData
                        .Where(d => d.Date.Date == yesterday)
                        .Select(d => new ExpenseShortDto
                        {
                            Title = d.Title,
                            Amount = d.Amount,
                            CategoryName = d.CategoryName
                        }).ToList()
                }
            };

            return Ok(response);
        }
    }
}
