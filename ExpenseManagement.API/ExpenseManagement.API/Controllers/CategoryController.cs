using AutoMapper;
using ExpenseManagement.API.Contracts;
using ExpenseManagement.API.DTOs.category;
using ExpenseManagement.API.Helper;
using ExpenseManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExpenseManagement.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryController(ICategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var categories = await _categoryRepository.GetAllAsync(userId);
            if (categories == null || !categories.Any())
            {
                return NotFound(new ApiResponse<object>(
                    false,
                    "No categories found.",
                    null
                ));
            }

            var mappedCategories = _mapper.Map<IEnumerable<CategoryDto>>(categories);

            return Ok(new ApiResponse<IEnumerable<CategoryDto>>(
               true,
               "Categories retrieved successfully.",
               mappedCategories
           ));

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var category = await _categoryRepository.GetByIdAsync(id, userId);
            if (category == null)
            {
                return NotFound(new ApiResponse<object>(
                    false,
                    "Category not found.",
                    null
                ));
            }
            var mappedCategory = _mapper.Map<CategoryDto>(category);
            return Ok(new ApiResponse<CategoryDto>(
               true,
               "Category retrieved successfully.",
               mappedCategory
           ));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto createCategoryDto)
        {
            Console.WriteLine("Auth Type: " + User.Identity?.AuthenticationType);
            Console.WriteLine("Is Authenticated: " + User.Identity?.IsAuthenticated);
            Console.WriteLine("Claims Count: " + User.Claims.Count());

            //var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;- User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = User.GetUserId();
            if (userId == null)
            {
                return Unauthorized("User not found");
            }
            var category = _mapper.Map<Category>(createCategoryDto);
            category.UserId = userId;
            var result = await _categoryRepository.AddAsync(category);
            if (!result)
            {
                return BadRequest(new ApiResponse<object>(
                    false,
                    "Failed to create category.",
                    null
                ));
            }
            var mappedCategory = _mapper.Map<CategoryDto>(category);
            return Ok(new ApiResponse<CategoryDto>(
               true,
               "Category created successfully.",
               mappedCategory
           ));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.GetUserId();
            var isDeleted = await _categoryRepository.DeleteAsync(id, userId);
            if (!isDeleted)
            {
                return BadRequest(new ApiResponse<object>(
                    false,
                    "Failed to delete category.",
                    null
                ));
            }
            return Ok(new ApiResponse<object>(
               true,
               "Category deleted successfully.",
               null
           ));
        }

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto updateDto)
        {
            var userId = User.GetUserId();
            var isUpdated = await _categoryRepository.UpdateAsync(id, updateDto, userId);

            if (!isUpdated)
            {
                return BadRequest(new ApiResponse<object>(false, "Failed to update category.", null));
            }

            return Ok(new ApiResponse<object>(true, "Category updated successfully.", null));
        }

    }
}
