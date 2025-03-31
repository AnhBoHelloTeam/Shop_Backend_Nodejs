import React from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import { SCREEN_URL } from '../../../../../constants/screen/PathScreen';

const Card = ({ product }) => {
    const urlPath = product.name.toLowerCase().replace(/ /g, '-');
    const productDetailUrl = SCREEN_URL.DETAILS
        .replace(':urlPath', urlPath)
        .replace(':productId', product._id);

    const daysDiff = Math.ceil(
        (new Date(product.updatedAt) - new Date(product.createdAt)) / (1000 * 3600 * 24)
    );

    const cardClass = daysDiff <= 7
        ? 'new-product'
        : product.stock === 0
            ? 'out-of-stock'
            : '';

    return (
        <div className={`col ${cardClass}`}>
            <div className="p-3">
                <div className="card">
                    <NavLink to={productDetailUrl}>
                        <img src={product.image} className="img-product card-img-top" alt={product.name} />
                    </NavLink>
                    <div className="card-body">
                        <NavLink to={productDetailUrl} className="text-start fw-semibold text-decoration-none">
                            {product.name}
                        </NavLink>
                        <div className="d-flex mb-3">
                            {[...Array(5)].map((_, i) => (
                                <FontAwesomeIcon key={i} icon={faStar} style={{ color: "#f0aa14" }} />
                            ))}
                        </div>
                        <p className="fw-bold">
                            {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;