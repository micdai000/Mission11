
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BooksPage from "./pages/BooksPage";
import CartPage from "./pages/CartPage";
import BuyPage from "./pages/BuyPage";
import AdminBooksPage from "./pages/AdminBooksPage";
import { CartProvider } from "./contexts/CartContext";


function App() {
  

  return (
    <>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<BooksPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/buy/:bookTitle" element={<BuyPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/adminbooks" element={<AdminBooksPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </>
  )
}

export default App
