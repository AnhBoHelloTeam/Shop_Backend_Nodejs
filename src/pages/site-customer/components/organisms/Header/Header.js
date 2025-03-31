import React, { useEffect } from "react";
import { Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faMagnifyingGlass, faRightToBracket, faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import "./style.css";
import { SCREEN_URL } from "../../../../../constants/screen/PathScreen";
import { useDispatch, useSelector } from "react-redux";
import { getCurrent } from "../../../../../store/user/asynsActions"; // Thêm logout
import { logout } from "../../../../../store/user/userSlice";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Thêm useNavigate để chuyển hướng sau khi logout
    const { isLoggedIn, current } = useSelector((state) => state.user);

    // Lấy thông tin user hiện tại khi đã đăng nhập
    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getCurrent());
        }
    }, [dispatch, isLoggedIn]);

    // Xử lý đăng xuất

    return (
        <header className="bg-primary p-3">
            <Container>
                <div className="row justify-content-between align-items-center mb-3">
                    <div className="col-2">
                        <Link to={SCREEN_URL.HOME}>
                            <img
                                src="https://seeklogo.com/images/G/gigabyte-technology-logo-EDA7FE7C37-seeklogo.com.png"
                                className="img-fluid mt-1 logo"
                                alt="logo"
                            />
                        </Link>
                    </div>
                    <div className="col-5">
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Search for products" />
                            <span className="input-group-text">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className="row justify-content-between align-items-center">
                    <div className="col-2 me-5"></div>
                    <div className="col-7">
                        <nav className="navbar navbar-expand-lg">
                            <div className="container-fluid">
                                {/* Có thể thêm các link nav ở đây nếu cần */}
                            </div>
                        </nav>
                    </div>
                    <div className="col-2 d-flex justify-content-center align-items-center">
                        {/* Điều kiện hiển thị đăng nhập/đăng xuất */}
                        {isLoggedIn ? (
                            <>
                                {/* Hiển thị thông tin user (nếu có) */}
                                <Dropdown>
                                    <Dropdown.Toggle variant="link" id="dropdown-user" className="text-white p-0">
                                        <FontAwesomeIcon className="fs-3 icon me-2" icon={faUser} style={{ color: "#fafafa" }} />
                                        {current?.name || "User"}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => {
                                            dispatch(logout());
                                        }}>
                                            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                                            Đăng xuất
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                        ) : (
                            <Link to={SCREEN_URL.LOGIN} className="text-decoration-none">
                                <FontAwesomeIcon className="fs-3 icon me-3" icon={faRightToBracket} style={{ color: "#fafafa" }} />
                                <span className="text-white">Đăng nhập</span>
                            </Link>
                        )}
                        {/* Icon giỏ hàng luôn hiển thị */}
                        <Link to={SCREEN_URL.CART}>
                            <FontAwesomeIcon className="fs-3 icon ms-4" icon={faCartShopping} style={{ color: "#ffffff" }} />
                        </Link>
                    </div>
                </div>
            </Container>
        </header>
    );
};

export default Header;