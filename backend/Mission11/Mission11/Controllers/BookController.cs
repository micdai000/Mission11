using Mission11.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Mission11.Controllers;

[Route("api/[controller]")]
[ApiController]

public class BookController : ControllerBase
{
    private AppDbContext _bookContext;

    public BookController(AppDbContext temp)
    {
        _bookContext = temp;
    }
    
    [HttpGet(Name = "GetBook")]
    public IActionResult Get(int pageSize = 5, int pageNum = 1)
    {
        var something = _bookContext.Books
            .Skip((pageNum - 1) * pageSize)
            .Take(pageSize)
            .ToList();
        
        var totalNumBooks = _bookContext.Books.Count();

        var someObject = new
        {
            Books = something,
            totalNumBooks = totalNumBooks
        };
        return Ok(someObject);
    }
}