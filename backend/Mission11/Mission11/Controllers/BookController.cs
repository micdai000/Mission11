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
    public IEnumerable<Book> Get()
    {
        return _bookContext.Books.ToList();
    }
}