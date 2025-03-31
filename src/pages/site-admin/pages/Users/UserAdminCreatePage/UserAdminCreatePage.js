import React, { useState } from "react";
import "./style.css";
import { createUserAPI } from "../../../../../api/usersAPI"
import { toast } from "react-toastify";

const UserAdminCreatePage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");


    const onCreateUser = async () => {
        try {
            const newUser = {
                name,
                email,
                username,
                password,
                address,
                phone,
            };
            await createUserAPI(newUser);
            toast.success("Đã tạo người dùng mới thành công!");
        } catch (error) {
            if (error.message === "Unauthorized") {
                toast.error("BẠN KHÔNG PHẢI LÀ ADMIN");
            }
            console.log("Error updating user:", error);
        }
    };

    return (
        <main className="content">
            <div id="form">
                <h3>Tạo người dùng mới</h3>

                <div className="input-group">
                    <label htmlFor="name">Tên người dùng:</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Tên người dùng"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="username">Tên đăng nhập:</label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Mật khẩu:</label>
                    <input
                        type="text"
                        id="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="address">Địa chỉ:</label>
                    <input
                        type="text"
                        id="address"
                        placeholder="Địa chỉ"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="phone">Số điện thoại:</label>
                    <input
                        type="text"
                        id="phone"
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div className="">
                    <input type="submit" value="Tạo" onClick={onCreateUser} />
                </div>
            </div>
        </main>
    );
};

export default UserAdminCreatePage;
