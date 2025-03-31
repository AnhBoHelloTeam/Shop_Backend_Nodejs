import React, { useRef } from 'react';

const QuantityPicker = (props) => {
    const { value, onQuantityChange } = props;
    const quantityRef = useRef();

    const decreaseQuantity = () => {
        if (quantityRef.current && quantityRef.current.value > 0) {
            onQuantityChange(parseInt(quantityRef.current.value) - 1);
        }
    };

    const increaseQuantity = () => {
        onQuantityChange(parseInt(quantityRef.current.value) + 1);
    };

    return (
        <span className="quantity-picker rounded">
            <button className="quantity-modifier modifier-left rounded" onClick={decreaseQuantity}>
                &ndash;
            </button>
            <input className="quantity-display" value={value} ref={quantityRef} readOnly />
            <button className="quantity-modifier modifier-right rounded" onClick={increaseQuantity}>
                &#xff0b;
            </button>
        </span>
    );
};

export default QuantityPicker;
