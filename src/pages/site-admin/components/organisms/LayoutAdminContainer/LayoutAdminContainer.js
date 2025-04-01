import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../HeaderAdmin/HeaderAdmin";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import { SCREEN_URL } from "../../../../../constants/screen/PathScreen";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { getCurrent } from "../../../../../store/user/asynsActions";

const LayoutAdminContainer = ({ component: Component, isHeader, isSidebar, title }) => {
    const { isLoggedIn, current } = useSelector((state) => state.user);
    console.log(current);
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