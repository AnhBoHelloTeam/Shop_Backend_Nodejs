import React from 'react';
import './style.css'
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <div className="row pt-5 section-footer">
                    <div className='site-footer-section'>
                        <img src='https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-logo-mono.svg' />

                    </div>
                    <div className='site-footer-section'>
                        <h5 className='widget_block'> Shop</h5>
                        <div className='widget_nav'>
                            <Link to={'#'} >Hot deals</Link>
                            <Link to={'#'} >Categories</Link>
                            <Link to={'#'} >Brands</Link>
                            <Link to={'#'} >Rebates</Link>
                            <Link to={'#'} >Weekly deals</Link>

                        </div>

                    </div>
                    <div className='site-footer-section'>
                        <h5 className='widget_block'> Need help?</h5>
                        <div className='widget_nav'>
                            <Link>Contact</Link>
                            <Link>Order tracking</Link>
                            <Link>FAQs</Link>
                            <Link>Return policy</Link>
                        </div>

                    </div>
                    <div className='site-footer-section'>
                        <h5 className='widget_block'> Contact</h5>
                        <div className='widget_nav'>
                            <Link>123 Fifth Avenue, New York, NY</Link>
                            <Link>contact@info.com</Link>
                            <Link>929-242-6868</Link>
                        </div>

                    </div>
                </div>
                <hr />
                <div className="row pt-3 d-flex justify-content-between">
                    <div className="col-6 mt-2 ">
                        <span className="mt-2 fw-semibold">Payment Partners</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/2560px-Amazon_Pay_logo.svg.png" className="img-fluid payment-img" alt="..." />
                        <img src="https://1000logos.net/wp-content/uploads/2016/10/American-Express-Color.png" className="img-fluid payment-img" alt="..." />
                        <img src="https://1000logos.net/wp-content/uploads/2017/03/MasterCard-Logo-1990.png" className="img-fluid payment-img" alt="..." />
                        <img src="https://cdn.pixabay.com/photo/2015/05/26/09/37/paypal-784404_1280.png" className="img-fluid payment-img" alt="..." />
                        <img src="https://i.pinimg.com/originals/d6/7e/a5/d67ea5a8136ac5296e497566757caf64.png" className="img-fluid payment-img" alt="..." />
                    </div>

                    <div className="col-6  ">
                        <span className="mt-2 fw-semibold">Get deliveries with FreshCart</span>
                        <img src="https://logosmarken.com/wp-content/uploads/2021/02/App-Store-Emblem.png" className="img-fluid mx-2 logo-app" alt="..." />
                        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" className="img-fluid logo-app" alt="..." />
                    </div>
                </div>
                <hr />
                <div className="row mt-2">
                    <div className="col-6">
                        <p className="text-sm-start fw-lighter" style={{ fontSize: 'small' }}>
                            © 2022 - 2023 FreshCart eCommerce HTML Template. All rights reserved. Powered by
                        </p>
                        <p style={{ color: 'green', fontSize: 'small' }}>Codescandy.</p>
                    </div>
                    <div className="col-6 d-flex justify-content-end">
                        <span className="text-sm-start fw-lighter me-2" style={{ fontSize: 'small' }}>Follow us on</span>

                    </div>
                </div>
            </div>
        </footer>
    );
};
export default Footer