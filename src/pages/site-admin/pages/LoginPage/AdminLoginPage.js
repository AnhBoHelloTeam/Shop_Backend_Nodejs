import React, { useEffect, useRef, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { SCREEN_URL } from "../../../../constants/screen/PathScreen";
import { loginAPI } from "../../../../api/authAPI";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../../store/user/userSlice";

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoggedIn, current } = useSelector((state) => state.user);

    // State để lưu lỗi
    const [error, setError] = useState("");

    // Ref cho input
    const usernameRef = useRef("");
    const passwordRef = useRef("");

    // Kiểm tra trạng thái đăng nhập và vai trò khi trang tải
    useEffect(() => {
        if (isLoggedIn && current?.role === "admin") {
            navigate(SCREEN_URL.ADMIN_HOME); // Nếu đã đăng nhập và là admin, chuyển hướng
        }
    }, [isLoggedIn, current, navigate]);

    // Xử lý đăng nhập
    const onSubmit = async () => {
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        try {
            const loginRes = await loginAPI(username, password); // Gọi API đăng nhập
            const { token, userData } = loginRes; // Giả định API trả về token và userData

            if (userData.role === "admin") {
                // Dispatch action login với dữ liệu từ API
                dispatch(
                    login({
                        isLoggedIn: true,
                        token,
                        userData,
                    })
                );
                navigate(SCREEN_URL.ADMIN_HOME); // Chuyển hướng đến trang admin
            } else {
                setError("Bạn không phải admin.");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.error || "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.";
            setError(errorMessage);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Container bsPrefix="col-5" className="">
                <h2 className="mb-4 text-center">Đăng Nhập Admin</h2>
                <div className="mb-3">
                    <Form.Label htmlFor="exampleInputEmail1" className="form-label">
                        Tên đăng nhập ADMIN
                    </Form.Label>
                    <Form.Control
                        type="text"
                        className="form-control"
                        id="exampleInputEmail1"
                        aria-describedby="emailHelp"
                        ref={usernameRef}
                    />
                </div>
                <div className="mb-3">
                    <Form.Label htmlFor="exampleInputPassword1" className="form-label">
                        Mật khẩu ADMIN
                    </Form.Label>
                    <Form.Control
                        type="password"
                        className="form-control"
                        id="exampleInputPassword1"
                        ref={passwordRef}
                    />
                </div>
                {error && <div style={{ color: "red" }} className="mb-3">{error}</div>}
                <Button variant="primary" onClick={onSubmit} className="w-100">
                    Đăng nhập
                </Button>
            </Container>
        </div>
    );
};

export default AdminLoginPage;