import React, { useEffect } from 'react'

import { SCREEN_URL } from '../../../../../constants/screen/PathScreen'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrent } from '../../../../../store/user/asynsActions';
import { logout } from '../../../../../store/user/userSlice';

const HeaderAdmin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoggedIn, current } = useSelector((state) => state.user);

    // Lấy thông tin user hiện tại khi trang tải
    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getCurrent());
        }
    }, [dispatch, isLoggedIn]);
    return (
        <div id="header" className="d-flex justify-content-between align-items-center">
            <div id="branding">
                <h1 id="site-name">Hello administration</h1>
            </div>
            <div id="user-tools">
                Welcome,
                <strong>admin</strong>.
                <a href="/" className="mx-2">View site</a>
                <i className="mx-2" onClick={() => { dispatch(logout()) }}>Log Out</i>
            </div>
        </div>
    )
}

export default HeaderAdmin
