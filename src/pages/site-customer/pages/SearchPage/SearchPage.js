import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './style.css'
import Card from '../../components/molecules/Card/Card'
import { SCREEN_URL } from '../../../../constants/screen/PathScreen'
import { fetchProductsApi } from '../../../../api/productsAPI'

const SearchPage = () => {
    const params = useParams('')
    const productSearch = params.productSearch.split("-").join(" ")
    // State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sortByPrice, setSortByPrice] = useState("");


    const fetchData = async () => {
        try {

            const fetchedProducts = await fetchProductsApi({
                productName: productSearch,
                sortByPrice: sortByPrice
            });
            setProducts(fetchedProducts.data.products);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    const handleSortChange = (event) => {
        setSortByPrice(event.target.value);
    };

    useEffect(() => {
        fetchData();
    }, [params.productSearch, sortByPrice]);
    return (
        <main className='container'>
            <div className=' row mt-2'>
                <div className='col-3 navigate '>
                    <div className='nav-item'>
                        <h3 className='my-4'>Categories</h3>
                        <div className='list-categories p-4'>

                            {categories.map(category => <div className='item'>
                                <Link class="nav-link" style={{ whiteSpace: "nowrap" }} to={SCREEN_URL.CATEGORY.replace(':urlPath', category.name.toLowerCase().replace(/ /g, '-')).replace(':productCategory', category.id)}>
                                    {category.name}
                                </Link>
                            </div>)}
                        </div>
                    </div>
                </div>
                <div className='col-9 category'>
                    <h1 className='name-category'>
                        {productSearch ? `Kết quả tìm kiếm cho "${productSearch}"` : "Tất cả sản phẩm"}
                    </h1>

                    <div className='category-products'>
                        <div className='sort-product'>
                            <p>Showing all {products.length} results</p>
                            <select id="productsSelect" name="products" onChange={handleSortChange}>
                                <option value="">Default Sorting</option>
                                <option value="asc">Sort by Price: low to high</option>
                                <option value="desc">Sort by Price: high to low</option>
                            </select>
                        </div>
                        {products.length === 0 && productSearch && (
                            <p>Không tìm thấy sản phẩm nào.</p>
                        )}
                        <div className='card-list'>
                            {products.map(product => (
                                <Card key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>

    )
}

export default SearchPage
