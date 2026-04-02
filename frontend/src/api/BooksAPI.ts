import type { Book } from "../types/Book";

const BOOKS_API_BASE = "https://mission13-michaeldavila-backend-cfgjhuc3crfuf5f0.northcentralus-01.azurewebsites.net/api/Book";

export interface FetchBooksResult {
  books: Book[];
  totalPages: number;
  totalNumBooks: number;
}

interface RawBooksResponse {
  books?: Book[];
  Books?: Book[];
  totalNumBooks?: number;
  TotalNumBooks?: number;
}

function normalizePayload(raw: RawBooksResponse, pageSize: number): FetchBooksResult {
  const books = raw.books ?? raw.Books ?? [];
  const totalNumBooks = raw.totalNumBooks ?? raw.TotalNumBooks ?? 0;
  const totalPages =
    pageSize > 0 ? Math.ceil(totalNumBooks / pageSize) : 0;
  return { books, totalPages, totalNumBooks };
}

export const fetchBooks = async (
  pageSize: number,
  pageNumber: number,
  selectedCategories: string[],
  sortOrder: string = "asc"
): Promise<FetchBooksResult> => {
  try {
    const categoryParams = selectedCategories
      .map((cat) => `projectTypes=${encodeURIComponent(cat)}`)
      .join("&");

    const url =
      `${BOOKS_API_BASE}?pageSize=${pageSize}&pageNum=${pageNumber}&sortOrder=${encodeURIComponent(sortOrder)}` +
      (selectedCategories.length > 0 ? `&${categoryParams}` : "");

    const response = await fetch(url);

    if (!response.ok) {
      let detail = "";
      try {
        detail = await response.text();
      } catch {
        /* ignore */
      }
      throw new Error(
        `Failed to load books (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
    }

    let raw: RawBooksResponse;
    try {
      raw = (await response.json()) as RawBooksResponse;
    } catch {
      throw new Error("Invalid response: expected JSON from server");
    }

    return normalizePayload(raw, pageSize);
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(typeof err === "string" ? err : "Unknown error loading books");
  }
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (text) return text;
  } catch {
    /* ignore */
  }
  return `${response.status} ${response.statusText}`;
}

export const updateBook = async (book: Book): Promise<void> => {
  const priceNum = Number(String(book.price).replace(/[^0-9.-]/g, "")) || 0;
  const body = {
    bookId: book.bookId,
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    isbn: book.isbn,
    classification: book.classification,
    category: book.category,
    pageCount: book.pageCount,
    price: priceNum,
  };

  try {
    const response = await fetch(`${BOOKS_API_BASE}/${book.bookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to update book: ${await readErrorMessage(response)}`);
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Unknown error updating book");
  }
};

export type NewBookPayload = Omit<Book, "bookId">;

export const createBook = async (book: NewBookPayload): Promise<void> => {
  const priceNum = Number(String(book.price).replace(/[^0-9.-]/g, "")) || 0;
  const body = {
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    isbn: book.isbn,
    classification: book.classification,
    category: book.category,
    pageCount: book.pageCount,
    price: priceNum,
  };

  try {
    const response = await fetch(BOOKS_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to add book: ${await readErrorMessage(response)}`);
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Unknown error adding book");
  }
};

export const deleteBook = async (bookId: number): Promise<void> => {
  try {
    const response = await fetch(`${BOOKS_API_BASE}/${bookId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete book: ${await readErrorMessage(response)}`);
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Unknown error deleting book");
  }
};
