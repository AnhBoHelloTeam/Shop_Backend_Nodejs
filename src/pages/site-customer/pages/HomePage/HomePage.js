import React, { useEffect, useState } from "react";
import "./style.css";
import { faCarSide, faCircleNotch, faComment, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import Card from "../../components/molecules/Card/Card";
import ServiceItem from "../../components/molecules/ServiceItem/ServiceItem";
import { GroceryBanner } from "../../components/molecules/GroceryBanner/GroceryBanner";
import SaleProduct from "../../components/molecules/SaleProduct/SaleProduct";
import Comment from "../../components/molecules/Comment/Comment";
import { Carousel } from "react-bootstrap";
import { fetchProductsApi } from "../../../../api/productsAPI";

const HomePage = () => {
    const [products, setProducts] = useState([]);

    // Lấy dữ liệu từ API
    const fetchData = async () => {
        try {
            const response = await fetchProductsApi();
            setProducts(response || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderProductCategory = (title, filterCondition, limit = 4) => (
        <section className="elementor-section">
            <div className="category">
                <h2>{title}</h2>
                <div className="products">
                    {products.length > 0 ? (
                        products
                            .filter(filterCondition)
                            .slice(0, limit)
                            .map((product) => <Card key={product._id} product={product} />)
                    ) : (
                        <p>Đang tải {title.toLowerCase()}...</p>
                    )}
                </div>
            </div>
        </section>
    );

    return (
        <main style={{ backgroundColor: "#E6E8EA" }}>
            <div className="container banner mb-5">
                <Carousel className="py-4">
                    <Carousel.Item>
                        <img
                            className="imgCarousel"
                            src="https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg"
                            alt="Tech banner 1"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="imgCarousel"
                            src="https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg"
                            alt="Tech banner 2"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="imgCarousel"
                            src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg"
                            alt="Tech banner 3"
                        />
                    </Carousel.Item>
                </Carousel>
            </div>

            <div className="container elementor">
                <section className="elementor-section services d-flex justify-content-around align-items-center mb-5">
                    <ul className="list-unstyled d-flex m-0 p-0">
                        <ServiceItem icon={faCarSide} text="Free Shipping" />
                        <ServiceItem icon={faComment} text="24/7 Support" />
                        <ServiceItem icon={faCircleNotch} text="30-Day Returns" />
                        <ServiceItem icon={faCreditCard} text="Secure Payments" />
                    </ul>
                </section>

                {/* Best Selling Laptops */}
                {renderProductCategory("Best Selling Laptops Today", () => true, 8)}

                {/* Grocery Banners */}
                <section className="elementor-section">
                    <div className="row my-5">
                        <div className="col-6">
                            <GroceryBanner
                                image="https://images.pexels.com/photos/204264/pexels-photo-204264.jpeg"
                                title="Gaming Laptops"
                                content="Up to 30% Off"
                            />
                        </div>
                        <div className="col-6">
                            <GroceryBanner
                                image="https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"
                                title="Ultrabooks"
                                content="Latest Models"
                            />
                        </div>
                    </div>
                </section>

                {/* Premium Laptops */}
                {renderProductCategory(
                    "Premium Laptops",
                    (product) => product.price > 30000000
                )}

                {/* Work & Create Banner */}
                <section className="elementor-section">
                    <div className="row my-5">
                        <div className="col-12">
                            <GroceryBanner
                                image="https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg"
                                title="WORK. CREATE."
                                content="Powerful laptops for professionals"
                            />
                        </div>
                    </div>
                </section>

                {/* Student Laptops */}
                {renderProductCategory(
                    "Student Laptops",
                    (product) => product.price <= 20000000
                )}

                {/* MacBooks */}
                {renderProductCategory(
                    "MacBooks",
                    (product) => product.name.toLowerCase().includes("macbook")
                )}

                {/* Special Offer */}
                <section className="elementor-section mb-2">
                    <SaleProduct
                        title="Special Offer"
                        content="Save up to 15% on orders over 2 units"
                        image="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg"
                    />
                </section>

                {/* Gaming Laptops */}
                {renderProductCategory(
                    "Gaming Laptops",
                    (product) => product.name.toLowerCase().includes("gaming")
                )}

                {/* Customer Reviews */}
                <section className="elementor-section">
                    <h2>Customer Reviews</h2>
                    <div className="comments">
                        <Comment
                            content="Great selection of laptops with amazing performance. Perfect for gaming!"
                            avatar="https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-reviewer-avatar-image-1.jpg"
                            name="Chelsea Turner"
                        />
                        <Comment
                            content="Fast delivery and excellent customer service. My new laptop works perfectly."
                            avatar="https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-reviewer-avatar-image-3.jpg"
                            name="Rafael Stokes"
                        />
                        <Comment
                            content="The MacBook I bought exceeded my expectations. Great for work and design."
                            avatar="https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-reviewer-avatar-image-6.jpg"
                            name="Jacqueline Mueller"
                        />
                        <Comment
                            content="Affordable student laptops with good specs. Highly recommended!"
                            avatar="https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-reviewer-avatar-image-2.jpg"
                            name="Olive Borer"
                        />
                        <Comment
                            content="Perfect for programming and multitasking. Solid build quality."
                            avatar="https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-reviewer-avatar-image-5.jpg"
                            name="Priscilla Jacobson"
                        />
                        <Comment
                            content="Best tech store I’ve shopped at. Great deals and fast shipping!"
                            avatar="https://maychusaigon.vn/wp-content/uploads/2023/02/gioi-thieu-elon-musk-la-ai-maychusaigon.jpg"
                            name="Elon Musk"
                        />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default HomePage;