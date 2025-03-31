import React from 'react'
import { Link } from 'react-router-dom'
import './style.css'
const SaleProduct = ({ title, content, image }) => {
    return (
        <div className='sale'>
            <div className='details-sale'>
                <h3>BRAND’S DEAL</h3>
                <p className='text'>{title}</p>
                <p className='fs-5'>{content}</p>
                <Link>Shop now</Link>
            </div>
            <div className='product-sale'>
                <img className='img-sale' src={image} />
            </div>
        </div>
    )
}

export default SaleProduct
