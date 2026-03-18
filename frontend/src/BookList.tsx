import { useEffect, useState } from "react";
import type { Book } from "./types/Book";

function BookList(){
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const response = await fetch("http://localhost:4000/api/Book");
            const data = await response.json();
            setBooks(data);
            };
            fetchProjects();
    }, []);

    return (
        <>
        <h1>Book List</h1>
        <br />
        {books.map((b) =>
        <div id="bookCard" className="card" key={b.bookId}>
            <h3 className="card-title">{b.title}</h3>
            <div className="card-body">
                <ul className="list-unstyled">
                    <li><strong>Author:</strong> {b.author}</li>
                    <li><strong>Publisher:</strong> {b.publisher}</li>
                    <li><strong>ISBN:</strong> {b.isbn}</li>
                    <li><strong>Classification:</strong> {b.classification}</li>
                    <li><strong>Category:</strong> {b.category}</li>
                    <li><strong>Page Count:</strong> {b.pageCount}</li>
                    <li><strong>Price:</strong> {b.price}</li>
                </ul>
            </div>
        </div>
        )}
        </>
    );
}

export default BookList;