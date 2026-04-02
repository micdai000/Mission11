import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Book } from "../types/Book";
import {
    createBook,
    deleteBook,
    fetchBooks,
    updateBook,
    type NewBookPayload,
} from "../api/BooksAPI";

const ADMIN_LIST_PAGE_SIZE = 10_000;

const emptyNewBook = (): NewBookPayload => ({
    title: "",
    author: "",
    publisher: "",
    isbn: "",
    classification: "",
    category: "",
    pageCount: 0,
    price: "",
});

const AdminBooksPage = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [rowBusyId, setRowBusyId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [newBook, setNewBook] = useState<NewBookPayload>(() => emptyNewBook());
    const [addSubmitting, setAddSubmitting] = useState<boolean>(false);

    const refreshBooksList = useCallback(async () => {
        setError(null);
        try {
            const data = await fetchBooks(ADMIN_LIST_PAGE_SIZE, 1, [], "asc");
            setBooks(data.books);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load books");
        }
    }, []);

    const loadBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchBooks(ADMIN_LIST_PAGE_SIZE, 1, [], "asc");
            setBooks(data.books);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load books");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadBooks();
    }, [loadBooks]);

    const startEdit = (book: Book) => {
        setEditingBook({ ...book });
    };

    const cancelEdit = () => {
        setEditingBook(null);
    };

    const saveEdit = async () => {
        if (!editingBook) return;
        setRowBusyId(editingBook.bookId);
        setError(null);
        try {
            await updateBook(editingBook);
            setEditingBook(null);
            await refreshBooksList();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save book");
        } finally {
            setRowBusyId(null);
        }
    };

    const handleDelete = async (book: Book) => {
        if (!window.confirm(`Delete “${book.title}”? This cannot be undone.`)) return;
        setRowBusyId(book.bookId);
        setError(null);
        try {
            await deleteBook(book.bookId);
            if (editingBook?.bookId === book.bookId) setEditingBook(null);
            await refreshBooksList();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete book");
        } finally {
            setRowBusyId(null);
        }
    };

    const updateDraft = (patch: Partial<Book>) => {
        setEditingBook((prev) => (prev ? { ...prev, ...patch } : prev));
    };

    const updateNewBook = (patch: Partial<NewBookPayload>) => {
        setNewBook((prev) => ({ ...prev, ...patch }));
    };

    const handleAddBook = async (e: FormEvent) => {
        e.preventDefault();
        setAddSubmitting(true);
        setError(null);
        try {
            await createBook(newBook);
            setNewBook(emptyNewBook());
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add book");
        } finally {
            setAddSubmitting(false);
        }
    };

    return (
        <div className="container py-4">
            <h1 className="h3 mb-4">Admin - Books</h1>

            <button
                type="button"
                className="btn btn-primary btn-sm mb-2"
                onClick={() => setShowAddForm((open) => !open)}
            >
                Add Book
            </button>

            {showAddForm && (
                <form className="mb-4 pb-3 border-bottom" onSubmit={(ev) => void handleAddBook(ev)}>
                    <div className="row g-2 mb-2">
                        <div className="col-md-6">
                            <label className="form-label small mb-0">Title (Book Name)</label>
                            <input
                                className="form-control form-control-sm"
                                value={newBook.title}
                                onChange={(ev) => updateNewBook({ title: ev.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small mb-0">Author</label>
                            <input
                                className="form-control form-control-sm"
                                value={newBook.author}
                                onChange={(ev) => updateNewBook({ author: ev.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small mb-0">Publisher</label>
                            <input
                                className="form-control form-control-sm"
                                value={newBook.publisher}
                                onChange={(ev) => updateNewBook({ publisher: ev.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small mb-0">ISBN</label>
                            <input
                                className="form-control form-control-sm"
                                value={newBook.isbn}
                                onChange={(ev) => updateNewBook({ isbn: ev.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small mb-0">Classification</label>
                            <input
                                className="form-control form-control-sm"
                                value={newBook.classification}
                                onChange={(ev) => updateNewBook({ classification: ev.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small mb-0">Category</label>
                            <input
                                className="form-control form-control-sm"
                                value={newBook.category}
                                onChange={(ev) => updateNewBook({ category: ev.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small mb-0">Page Count</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={newBook.pageCount}
                                onChange={(ev) =>
                                    updateNewBook({ pageCount: Number(ev.target.value) || 0 })
                                }
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small mb-0">Price</label>
                            <input
                                className="form-control form-control-sm"
                                value={newBook.price}
                                onChange={(ev) => updateNewBook({ price: ev.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-success btn-sm" disabled={addSubmitting}>
                        {addSubmitting ? "Loading ..." : "Submit"}
                    </button>
                </form>
            )}

            {loading && <p>Loading ...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-sm align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Author</th>
                                <th>Name of the Book</th>
                                <th>Publisher</th>
                                <th>ISBN</th>
                                <th>Classification</th>
                                <th>Category</th>
                                <th>Page Count</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((b) => {
                                const isEditing = editingBook?.bookId === b.bookId;
                                const busy = rowBusyId === b.bookId;
                                if (isEditing && editingBook) {
                                    const d = editingBook;
                                    return (
                                        <tr key={b.bookId}>
                                            <td>{d.bookId}</td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={d.author}
                                                    onChange={(ev) => updateDraft({ author: ev.target.value })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={d.title}
                                                    onChange={(ev) => updateDraft({ title: ev.target.value })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={d.publisher}
                                                    onChange={(ev) => updateDraft({ publisher: ev.target.value })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={d.isbn}
                                                    onChange={(ev) => updateDraft({ isbn: ev.target.value })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={d.classification}
                                                    onChange={(ev) => updateDraft({ classification: ev.target.value })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={d.category}
                                                    onChange={(ev) => updateDraft({ category: ev.target.value })}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={d.pageCount}
                                                    onChange={(ev) =>
                                                        updateDraft({ pageCount: Number(ev.target.value) || 0 })
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    value={d.price}
                                                    onChange={(ev) => updateDraft({ price: ev.target.value })}
                                                />
                                            </td>
                                            <td className="text-nowrap">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm me-1"
                                                    disabled={busy}
                                                    onClick={() => void saveEdit()}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    disabled={busy}
                                                    onClick={cancelEdit}
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={b.bookId}>
                                        <td>{b.bookId}</td>
                                        <td>{b.author}</td>
                                        <td>{b.title}</td>
                                        <td>{b.publisher}</td>
                                        <td>{b.isbn}</td>
                                        <td>{b.classification}</td>
                                        <td>{b.category}</td>
                                        <td>{b.pageCount}</td>
                                        <td>{String(b.price)}</td>
                                        <td className="text-nowrap">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm me-1"
                                                disabled={busy || editingBook !== null}
                                                onClick={() => startEdit(b)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                disabled={busy || editingBook !== null}
                                                onClick={() => void handleDelete(b)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminBooksPage;
