import { useNavigate, useParams, useLocation } from "react-router-dom";
import WelcomeBook from "../components/WelcomeBook";
import { useCart } from "../contexts/CartContext";
import type { Book } from "../types/Book";

function BuyPage() {
    const navigate = useNavigate();
    const { bookTitle } = useParams();
    const location = useLocation();
    const { addToCart } = useCart();
    const book = location.state as Book | undefined;

    const handleAddToCart = () => {
        if (!book) {
            navigate("/books");
            return;
        }

        addToCart(book, 1);
        navigate("/cart");
    };

    return (
        <>
            < WelcomeBook />
            <h2>Buy {bookTitle}</h2>

            <div>
                <label>Price: {book?.price} </label>
                <button onClick={handleAddToCart}>Add to Cart</button>
            </div>

            <button onClick={() => navigate(-1)}>Go Back</button>
                
        </>
    )
}

export default BuyPage;