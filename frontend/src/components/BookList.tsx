import { useEffect, useState } from "react";
import type { Book } from "../types/Book";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

function BookList({selectedCategories}: {selectedCategories: string[]}) {
    const [books, setBooks] = useState<Book[]>([]);
    const [pageSize, setPageSize] = useState<number>(() => {
        try {
            const raw = sessionStorage.getItem("books:state");
            if (!raw) return 5;
            const parsed = JSON.parse(raw) as { pageSize?: number };
            return typeof parsed.pageSize === "number" ? parsed.pageSize : 5;
        } catch {
            return 5;
        }
    });
    const [pageNum, setPageNum] = useState<number>(() => {
        try {
            const raw = sessionStorage.getItem("books:state");
            if (!raw) return 1;
            const parsed = JSON.parse(raw) as { pageNum?: number };
            return typeof parsed.pageNum === "number" ? parsed.pageNum : 1;
        } catch {
            return 1;
        }
    });
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [sortOrder, setSortOrder] = useState<string>(() => {
        try {
            const raw = sessionStorage.getItem("books:state");
            if (!raw) return "asc";
            const parsed = JSON.parse(raw) as { sortOrder?: string };
            return typeof parsed.sortOrder === "string" ? parsed.sortOrder : "asc";
        } catch {
            return "asc";
        }
    }); // new state for sorting
    const navigate = useNavigate();
    const { totalItemCount, totalPrice } = useCart();

    useEffect(() => {
        const state = {
            pageSize,
            pageNum,
            sortOrder,
            selectedCategories,
        };
        sessionStorage.setItem("books:state", JSON.stringify(state));
    }, [pageSize, pageNum, sortOrder, selectedCategories]);

    useEffect(() => {
        const fetchProjects = async () => {
            const categoryParams = selectedCategories.map((cat => `projectTypes=${encodeURIComponent(cat)}`)).join("&");
            const response = await fetch(
                `http://localhost:4000/api/Book?pageSize=${pageSize}&pageNum=${pageNum}&sortOrder=${sortOrder}${selectedCategories.length ? `&${categoryParams}` : ""}` // added sortOrder
            );
            const data = await response.json();
                setBooks(data.books);
                setTotalItems(data.totalNumBooks);
                setTotalPages(Math.ceil(data.totalNumBooks / pageSize));
            };
            fetchProjects();
        }, [pageSize, pageNum, sortOrder, selectedCategories]); // sortOrder as dependency

    const toggleSort = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // toggle between asc/desc
        setPageNum(1); // reset to page 1 when sorting changes
    };

    return (
        <>
        <div style={{ marginBottom: 12, padding: 8, border: "1px solid #ddd" }}>
            <strong>Cart:</strong> {totalItemCount} item(s) — ${totalPrice.toFixed(2)}
            <button style={{ marginLeft: 8 }} onClick={() => navigate("/cart")}>View Cart</button>
        </div>

        {/* Sort button */}
        <button onClick={toggleSort}>
            Sort by Title: {sortOrder === "asc" ? "A → Z" : "Z → A"}
        </button>

        <br />
        {/* Bootstrap Grid: row wraps all book slots in one responsive row */}
        <div className="row mt-3">
            {books.map((b) => (
                <div className="col-md-6 col-lg-4 mb-4" key={b.bookId}>
                    {/* Bootstrap Grid: col = 1 col on small, 2 on md, 3 on lg */}
                    {/* Bootstrap Card: each book is a card */}
                    {/* shadow-sm = soft shadow (extra Bootstrap thing we didn't do in class) */}
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex flex-column">
                            <h3 className="card-title fw-bold text-primary mb-2">{b.title}</h3>
                            <ul className="list-unstyled small text-muted mb-3">
                                <li className="mb-1"><strong>Author:</strong> {b.author}</li>
                                <li className="mb-1"><strong>Publisher:</strong> {b.publisher}</li>
                                <li className="mb-1"><strong>ISBN:</strong> {b.isbn}</li>
                                <li className="mb-1"><strong>Classification:</strong> {b.classification}</li>
                                <li className="mb-1"><strong>Category:</strong> {b.category}</li>
                                <li className="mb-1"><strong>Page Count:</strong> {b.pageCount}</li>
                                <li className="mb-0"><strong>Price:</strong> {b.price}</li>
                            </ul>

                            {/* w-100 + mt-auto = full-width button at bottom of card (flex, not from class) */}
                            <button className="btn btn-success w-100 mt-auto" onClick={() => {
                                const state = {
                                    pageSize,
                                    pageNum,
                                    sortOrder,
                                    selectedCategories,
                                    scrollY: window.scrollY,
                                };
                                sessionStorage.setItem("books:state", JSON.stringify(state));
                                sessionStorage.setItem("cart:returnTo", "/books");
                                navigate(`/buy/${b.title}`, { state: b });
                            }}>Buy</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <button disabled={pageNum === 1} onClick={() => setPageNum(pageNum - 1)}>Previous</button>
        {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => setPageNum(i + 1)} disabled={pageNum === i + 1}>{i + 1}</button>
        ))}
        <button disabled={pageNum === totalPages} onClick={() => setPageNum(pageNum + 1)}>Next</button>

        <br />
        <label>
            Results per page:
            <select value={pageSize} onChange={(p) => { setPageSize(Number(p.target.value)); setPageNum(1); }}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
            </select>
        </label>

        <div style={{ marginTop: 8, opacity: 0.7 }}>
            Total books: {totalItems}
        </div>
        </>
    );
}

export default BookList;