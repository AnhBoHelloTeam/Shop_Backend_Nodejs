import React, { useState } from 'react';
import './style.css';
import { Button } from 'react-bootstrap';

const DetailProduct = () => {
    const [quantityBuy, setQuantityBuy] = useState(1);

    const handleQuantityChange = (value) => {
        setQuantityBuy(prevQuantity => Math.max(1, prevQuantity + value));
    };

    return (
        <div className="detail-product">
            <div className="product-img">
                <img src="https://via.placeholder.com/150" alt="Demo Product" />
            </div>
            <div className="product-information">
                <div className="product-name">
                    <h2>Sản phẩm Demo</h2>
                </div>
                <div className="more-infor">
                    <span>Category</span>
                    <p>Danh mục Demo</p>
                </div>
                <div className="more-infor">
                    <span>Giá</span>
                    <span>₫500,000</span>
                </div>
                <div className="more-infor">
                    <span>Tình trạng:</span>
                    <span>Còn hàng (10 sản phẩm)</span>
                </div>
                <div className="add-to-cart">
                    <td className="product-quantity">
                        <div className="quantity-control">
                            <Button
                                variant="outline-secondary"
                                className="quantity-button"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantityBuy <= 1}
                            >
                                -
                            </Button>
                        </div>
                        <input
                            type="text"
                            className="quantity-input"
                            value={quantityBuy}
                            readOnly
                        />
                        <div className="quantity-control">
                            <Button
                                variant="outline-secondary"
                                className="quantity-button"
                                onClick={() => handleQuantityChange(1)}
                            >
                                +
                            </Button>
                        </div>
                    </td>
                    <Button>
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DetailProduct;
