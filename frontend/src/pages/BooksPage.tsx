import { useEffect, useState } from "react";
import WelcomeBook from "../components/WelcomeBook";
import CategoryFilter from "../components/CategoryFilter";
import BookList from "../components/BookList";

type SavedBooksState = {
    selectedCategories?: string[];
    scrollY?: number;
};

function BooksPage() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
        try {
            const raw = sessionStorage.getItem("books:state");
            if (!raw) return [];
            const parsed = JSON.parse(raw) as SavedBooksState;
            return Array.isArray(parsed.selectedCategories) ? (parsed.selectedCategories as string[]) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("books:state");
            if (!raw) return;
            const parsed = JSON.parse(raw) as SavedBooksState;
            if (typeof parsed.scrollY === "number") {
                requestAnimationFrame(() => window.scrollTo(0, parsed.scrollY as number));
            }
        } catch {
            // ignore
        }
    }, []);

    return (
    <div className="container">
        <WelcomeBook />
      <div className="row">
        <div className="col-md-3">
          <CategoryFilter selectedCategories={selectedCategories} SetSelectedCategories={setSelectedCategories}/>
        </div>
        <div className="col-md-9">
          <BookList selectedCategories={selectedCategories}/>
        </div>
      </div>
    </div>
    )
}

export default BooksPage;