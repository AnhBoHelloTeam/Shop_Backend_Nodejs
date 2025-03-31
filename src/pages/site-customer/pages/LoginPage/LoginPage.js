import React, { useState, useEffect, useCallback } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { SCREEN_URL } from "../../../../constants/screen/PathScreen";
import { useDispatch, useSelector } from "react-redux"; // Thêm useSelector
import { login } from "../../../../store/user/userSlice";
import { getCurrent } from "../../../../store/user/asynsActions"; // Thêm getCurrent
import Swal from "sweetalert2";
import { validate } from "../../../../utils/helpers";
import { loginAPI, regisAPI } from "../../../../api/authAPI";

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoggedIn, current } = useSelector((state) => state.user);

    // State
    const [isRegister, setIsRegister] = useState(false);
    const [payload, setPayload] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });
    const [error, setError] = useState("");
    const [invalidFields, setInvalidFields] = useState([]);

    // Kiểm tra trạng thái isLoggedIn và chuyển hướng nếu đã đăng nhập
    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getCurrent());
            navigate(SCREEN_URL.HOME);
        }
    }, [isLoggedIn, dispatch, navigate]);

    // Đặt lại payload khi chuyển giữa đăng nhập và đăng ký
    useEffect(() => {
        setPayload({
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
        });
        setError("");
        setInvalidFields([]);
    }, [isRegister]);

    // Xử lý thay đổi input
    const handleInputChange = (e, key) => {
        setPayload((prev) => ({ ...prev, [key]: e.target.value }));
        setError("");
        setInvalidFields([]); // Xóa lỗi khi người dùng nhập lại
    };

    // Xử lý submit form
    const handleSubmit = useCallback(async () => {
        const { name, phone, address, ...loginData } = payload;
        const dataToValidate = isRegister ? payload : loginData;
        const inValids = validate(dataToValidate, setInvalidFields);
        console.log("Invalids:", inValids); // Log để kiểm tra

        if (inValids === 0) {
            try {
                if (isRegister) {
                    const response = await regisAPI(payload);
                    if (response.user) {
                        Swal.fire(
                            "Đăng ký thành công!",
                            "Vui lòng đăng nhập để tiếp tục.",
                            "success"
                        ).then(() => {
                            setIsRegister(false);
                        });
                    } else {
                        throw new Error(response.message || "Đăng ký thất bại!");
                    }
                } else {
                    const response = await loginAPI(payload.email, payload.password);
                    if (response.user) {
                        Swal.fire(
                            "Đăng nhập thành công!",
                            `Chào mừng ${response.user.name || "bạn"}!`,
                            "success"
                        ).then(() => {
                            dispatch(
                                login({
                                    isLoggedIn: true,
                                    token: response.token,
                                    userData: response.user, // Điều chỉnh theo cấu trúc response
                                })
                            );
                            navigate(SCREEN_URL.HOME);
                        });
                    } else {
                        throw new Error("Thông tin đăng nhập không đúng!");
                    }
                }
            } catch (error) {
                const errorMessage =
                    error.message ||
                    error.response?.data?.error ||
                    "Đã xảy ra lỗi. Vui lòng thử lại sau.";
                setError(errorMessage);
                Swal.fire("Lỗi!", errorMessage, "error");
            }
        } else {
            console.log("Validation failed. Payload:", dataToValidate);
        }
    }, [payload, isRegister, dispatch, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Container bsPrefix="col-5">
                <h2 className="text-center mb-4">{isRegister ? "Đăng ký" : "Đăng nhập"}</h2>
                <Form>
                    {isRegister && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ và tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={payload.name}
                                    onChange={(e) => handleInputChange(e, "name")}
                                    isInvalid={invalidFields.some((el) => el.name === "name")}
                                    placeholder="Nhập họ và tên"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {invalidFields.find((el) => el.name === "name")?.message}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={payload.phone}
                                    onChange={(e) => handleInputChange(e, "phone")}
                                    isInvalid={invalidFields.some((el) => el.name === "phone")}
                                    placeholder="Nhập số điện thoại"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {invalidFields.find((el) => el.name === "phone")?.message}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={payload.address}
                                    onChange={(e) => handleInputChange(e, "address")}
                                    isInvalid={invalidFields.some((el) => el.name === "address")}
                                    placeholder="Nhập địa chỉ"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {invalidFields.find((el) => el.name === "address")?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={payload.email}
                            onChange={(e) => handleInputChange(e, "email")}
                            isInvalid={invalidFields.some((el) => el.name === "email")}
                            placeholder="Nhập email"
                        />
                        <Form.Control.Feedback type="invalid">
                            {invalidFields.find((el) => el.name === "email")?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu</Form.Label>
                        <Form.Control
                            type="password"
                            value={payload.password}
                            onChange={(e) => handleInputChange(e, "password")}
                            isInvalid={invalidFields.some((el) => el.name === "password")}
                            placeholder="Nhập mật khẩu"
                        />
                        <Form.Control.Feedback type="invalid">
                            {invalidFields.find((el) => el.name === "password")?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-between mb-3">
                        {!isRegister && (
                            <Link to="#" className="text-primary">
                                Quên tài khoản?
                            </Link>
                        )}
                        <span
                            className="text-primary cursor-pointer"
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
                        </span>
                    </div>

                    {error && <div className="text-danger mb-3">{error}</div>}

                    <Button variant="primary" onClick={handleSubmit} className="w-100">
                        {isRegister ? "Đăng ký" : "Đăng nhập"}
                    </Button>

                    <div className="text-center mt-3">
                        <Link to={SCREEN_URL.HOME} className="text-primary">
                            Về trang chủ?
                        </Link>
                    </div>
                </Form>
            </Container>
        </div>
    );
};

export default LoginPage;