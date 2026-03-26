import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

function CartPage() {
    const navigate = useNavigate();

    const { items, updateQuantity, removeFromCart, clearCart, totalItemCount, totalPrice } = useCart();

    const rows = useMemo(() => {
        return items.map((x) => ({
            ...x,
            subtotal: x.price * x.quantity,
        }));
    }, [items]);

    const formatMoney = (n: number) => n.toFixed(2);

    const handleContinueShopping = () => {
        const returnTo = sessionStorage.getItem("cart:returnTo") || "/books";
        const raw = sessionStorage.getItem("books:state");
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as { scrollY?: number };
                if (typeof parsed.scrollY === "number") {
                    requestAnimationFrame(() => window.scrollTo(0, parsed.scrollY as number));
                }
            } catch {
                // ignore
            }
        }
        navigate(returnTo);
    };

    return (
        <>
        {/* Bootstrap container adds side margins and spacing for the whole page */}
        <div className="container my-5">
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                    <h1 className="fw-bold mb-1">Shopping Cart</h1>
                    <div className="text-muted">Review your selected books</div>
                </div>
                <div className="text-muted">
                    <span className="fw-bold text-dark">{totalItemCount}</span> item(s)
                </div>
            </div>

            {items.length === 0 ? (
                <>
                {/* Bootstrap Card for the empty-cart message */}
                <div className="card shadow-sm border-0 p-4 text-center">
                    <h4 className="fw-bold mb-2">Your cart is empty</h4>
                    <div className="text-muted mb-3">Browse books and add something you’ll love.</div>
                    <button className="btn btn-primary" onClick={handleContinueShopping}>
                        Continue Shopping
                    </button>
                </div>
                </>
            ) : (
                <>
                    {/* Bootstrap Grid: row splits table (wide) vs summary (sidebar) */}
                    <div className="row g-4">
                        <div className="col-lg-8">
                            {/* Bootstrap Card wraps the cart table */}
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    {/* table-responsive = scroll table on small screens (not covered in class) */}
                                    <div className="table-responsive">
                                        {/* Bootstrap Table + table-hover highlights rows (not covered in class) */}
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Title</th>
                                                    <th className="text-end">Price</th>
                                                    <th className="text-end">Quantity</th>
                                                    <th className="text-end">Subtotal</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((x) => (
                                                    <tr key={x.bookId}>
                                                        <td className="fw-semibold">{x.title}</td>
                                                        <td className="text-end">${formatMoney(x.price)}</td>
                                                        <td className="text-end">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={x.quantity}
                                                                onChange={(e) =>
                                                                    updateQuantity(x.bookId, Number(e.target.value))
                                                                }
                                                                className="form-control form-control-sm ms-auto"
                                                                style={{ width: 90 }}
                                                            />
                                                        </td>
                                                        <td className="text-end fw-semibold">
                                                            ${formatMoney(x.subtotal)}
                                                        </td>
                                                        <td className="text-end">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => removeFromCart(x.bookId)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            {/* Bootstrap Card for order total / checkout */}
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    <h5 className="fw-bold mb-3">Order Summary</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Items</span>
                                        <span className="fw-semibold">{totalItemCount}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">Grand Total</span>
                                        <span className="fw-bold text-success fs-5">
                                            ${formatMoney(totalPrice)}
                                        </span>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => alert("Checkout not implemented.")}
                                        >
                                            Checkout
                                        </button>
                                        <button className="btn btn-danger" onClick={clearCart}>
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-4">
                        <button className="btn btn-outline-secondary" onClick={handleContinueShopping}>
                            Continue Shopping
                        </button>
                    </div>
                </>
            )}
        </div>
        </>
    )
}

export default CartPage;