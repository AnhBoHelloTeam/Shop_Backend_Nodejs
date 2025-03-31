export const GroceryBanner = ({ image, title, content }) => {
    return (
        <div
            className="grocery-banner rounded py-auto d-flex align-items-center"
            style={{
                backgroundImage: `url(${image})`,
                height: '15rem',
                backgroundSize: 'cover', // Ensure the image covers the container
                backgroundRepeat: 'no-repeat', // Prevent the image from repeating
            }}
        >
            <div className="grocery-banner-content ms-5" style={{ color: 'white' }}>
                <p className="fs-2 fw-bold">{title}</p>
                <p className="fs-4 fw-semibold">{content}</p>
                <button type="button" className="btn btn btn-dark">
                    Shop Now
                </button>
            </div>
        </div>
    );
};
