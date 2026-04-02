using System.Xml.XPath;
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
    public IActionResult Get(int pageSize = 5, int pageNum = 1, string sortOrder = "asc", [FromQuery] List<string> projectTypes = null)
    {
        var query = _bookContext.Books.AsQueryable();
            if (projectTypes != null && projectTypes.Any())
            {
                query = query.Where(p => projectTypes.Contains(p.Category));
            }
        
        var q = _bookContext.Books.AsQueryable();
        
        q = sortOrder == "desc"
            ? q.OrderByDescending(b => b.Title)
            : q.OrderBy(b => b.Title);
        
        var totalNumBooks = query.Count();

        var something = query
            .Skip((pageNum - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var someObject = new
        {
            Books = something,
            totalNumBooks = totalNumBooks
        };
        return Ok(someObject);
    }

    [HttpPost]
    public IActionResult Create([FromBody] Book book)
    {
        if (book == null)
            return BadRequest("Book payload is required.");

        book.BookId = 0;
        _bookContext.Books.Add(book);
        _bookContext.SaveChanges();
        return Ok(book);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] Book incoming)
    {
        if (incoming == null || id != incoming.BookId)
            return BadRequest("Book id mismatch.");

        var book = _bookContext.Books.Find(id);
        if (book == null)
            return NotFound();

        book.Title = incoming.Title;
        book.Author = incoming.Author;
        book.Publisher = incoming.Publisher;
        book.Isbn = incoming.Isbn;
        book.Classification = incoming.Classification;
        book.Category = incoming.Category;
        book.PageCount = incoming.PageCount;
        book.Price = incoming.Price;

        _bookContext.SaveChanges();
        return Ok(book);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var book = _bookContext.Books.Find(id);
        if (book == null)
            return NotFound();

        _bookContext.Books.Remove(book);
        _bookContext.SaveChanges();
        return NoContent();
    }
    
    [HttpGet("GetCategoryTypes")]
    public IActionResult GetCategoryTypes()
    {
        var categoryTypes = _bookContext.Books.Select(p => p.Category)
            .Distinct()
            .ToList();
        
        return Ok(categoryTypes);
    }
}