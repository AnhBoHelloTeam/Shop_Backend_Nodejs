import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../HeaderAdmin/HeaderAdmin";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import { SCREEN_URL } from "../../../../../constants/screen/PathScreen";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { getCurrent } from "../../../../../store/user/asynsActions";

const LayoutAdminContainer = ({ component: Component, isHeader, isSidebar, title }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoggedIn, current } = useSelector((state) => state.user);

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getCurrent());
        }
    }, [dispatch, isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate(SCREEN_URL.ADMIN_LOGIN);
        } else if (current && current.role !== "admin") {
            navigate(SCREEN_URL.HOME);
        }
    }, [isLoggedIn, current, navigate]);

    if (!isLoggedIn || (current && current.role !== "admin")) {
        return null;
    }

    return (
        <>
            {isHeader && <HeaderAdmin />}
            {isSidebar && (
                <div className="row">
                    <div className="col-2 bg-dark min-height-100vh">
                        <SidebarAdmin />
                    </div>
                    <div className="col-10 d-flex justify-content-center mt-3">
                        <Component />
                    </div>
                </div>
            )}
            {!isSidebar && !isHeader && <Component />}
        </>
    );
};

export default LayoutAdminContainer;