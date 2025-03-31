import React from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { SCREEN_URL } from '../../../../../constants/screen/PathScreen'

const Product = ({ index, data, deleteProduct }) => {
    const { id, name, image, category, price, quantity, created_at, updated_at } = data
    return (
        <tr>
            <td>{id}</td>
            <td>{created_at}</td>
            <td>{updated_at}</td>
            <td>
                <img src={image} alt={name} style={{ width: "100px", objectFit: "contain" }} />
            </td>
            <td>
                <Link to={`${SCREEN_URL.ADMIN_PRODUCT}/${id}`}>{name}</Link>
            </td>
            <td>{category?.name}</td>
            <td>{price}</td>
            <td>{quantity}</td>
            <td>
                <Button variant="primary" onClick={() => deleteProduct(id)}>Xoá sản phẩm này</Button>
            </td>
        </tr>
    )
}

export default Product
