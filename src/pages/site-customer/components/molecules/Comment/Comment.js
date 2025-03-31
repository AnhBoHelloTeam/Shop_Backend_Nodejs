import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './style.css'
import React from 'react'

const Comment = ({ content, avatar, name }) => {
    return (
        <div className='comment'>
            <div class="icon mb-3">
                <FontAwesomeIcon icon={faStar} style={{ color: "#f0aa14", }} />
                <FontAwesomeIcon icon={faStar} style={{ color: "#f0aa14", }} />
                <FontAwesomeIcon icon={faStar} style={{ color: "#f0aa14", }} />
                <FontAwesomeIcon icon={faStar} style={{ color: "#f0aa14", }} />
                <FontAwesomeIcon icon={faStar} style={{ color: "#f0aa14", }} />
            </div>
            <p className='customer-feedback'>{content}</p>
            <div className='customer'>
                <img src={avatar} className='avatar' />
                <p className='name-customer'> {name}</p>
            </div>

        </div>
    )
}

export default Comment
