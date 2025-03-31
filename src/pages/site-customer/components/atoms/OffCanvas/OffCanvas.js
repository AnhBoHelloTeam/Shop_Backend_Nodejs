import React, { useEffect, useState } from 'react';
import { Button, CloseButton, Offcanvas } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { SCREEN_URL } from '../../../../../constants/screen/PathScreen';
import { decodeToken } from 'react-jwt';
import { fetchCartByIDApi } from '../../../../../api/cartAPI';
import './style.css'; // Your custom CSS

const OffCanvas = () => {
    const [show, setShow] = useState(false);
    const [cart, setCart] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const myDecodedToken = decodeToken(token);
                const fetchedCart = await fetchCartByIDApi(myDecodedToken.id);
                setCart(fetchedCart);
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };
        fetchData();
    }, [show]);

    const calculateTotalPrice = () => {
        if (!cart) return 0;
        return cart.cart_items.reduce((total, item) => {
            return total + item.product_id.price * item.quantity;
        }, 0);
    };

    return (
        <div>
            <Button variant="primary" onClick={handleShow} className="me-2">
                <FontAwesomeIcon
                    className="fs-3 icon"
                    icon={faCartShopping}
                    style={{ color: "#ffffff" }}
                />
            </Button>

            <Offcanvas show={show} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton className="border-bottom border-2 p-3">
                    <Offcanvas.Title>Shopping Cart</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-3">
                    <div className="product-cart">
                        {cart && cart.cart_items.map((item) => (
                            <div
                                key={item.id}
                                className="cart-item mb-4 border-bottom border-2 p-2"
                            >
                                <div className="img-buy-item">
                                    <img src={item.product_id.image} alt={item.product_id.name} />
                                </div>
                                <div className="name-item d-flex flex-column">
                                    <p>{item.product_id.name}</p>
                                    <p>
                                        Giá:{" "}
                                        {item.product_id.price.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </p>
                                    <p>Số lượng: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="subtotal">
                        <p>Subtotal:</p>
                        <p className="total">
                            {calculateTotalPrice().toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            })}
                        </p>
                    </div>
                    <div className="remote-button d-flex justify-content-between"> {/* Added flexbox */}
                        <Link to={SCREEN_URL.CART}>
                            <button>VIEW CART</button>
                        </Link>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};
export default OffCanvas