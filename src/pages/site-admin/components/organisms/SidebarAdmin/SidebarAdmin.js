import { NavLink } from "react-router-dom";
import { SCREEN_URL } from "../../../../../constants/screen/PathScreen";

const AdminMenu = () => {
    const navLinkClass = ({ isActive }) => {
        return isActive ? "nav-link activated" : "nav-link";
    };
    return (
        <>
            <h2 className="my-3 text-white">
                <NavLink to={SCREEN_URL.ADMIN_HOME} className={navLinkClass}>
                    Trang chủ
                </NavLink>
            </h2>
            <div className="pt-3">
                <ul className="nav nav-pills flex-column">

                    <li className="nav-item">
                        <NavLink to={SCREEN_URL.ADMIN_PRODUCT} className={navLinkClass}>
                            Quản lý products
                        </NavLink>
                    </li>
                    {/* <li className="nav-item">
                        <NavLink to={SCREEN_URL.ADMIN_CARTS} className={navLinkClass}>
                            Quản lý Giỏ hàng
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to={SCREEN_URL.ADMIN_CART_ITEMS} className={navLinkClass}>
                            Quản lý Đơn hàng
                        </NavLink>
                    </li> */}
                </ul>
            </div>
        </>
    );
};

export default AdminMenu;
