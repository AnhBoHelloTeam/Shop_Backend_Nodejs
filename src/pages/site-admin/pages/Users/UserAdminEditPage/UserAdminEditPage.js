import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style.css";
import { fetchUserAPIByID, updateUserAPI } from "../../../../../api/usersAPI";
import { toast } from "react-toastify";

const UserAdminEditPage = () => {
    const params = useParams();

    // ==========State=============
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");


    const fetchData = async () => {
        try {
            const currentUser = await fetchUserAPIByID(params.userId);
            setUser(currentUser);
            setName(currentUser.name);
            setUsername(currentUser.username);
            setPassword(currentUser.password);
            setAddress(currentUser.address);
            setEmail(currentUser.email);
            setPhone(currentUser.phone);
            setRole(currentUser.role);
        } catch (error) {
            toast.error("Error fetching user data:", error)
            console.error("Error fetching user data:", error);
        }
    };

    const onUpdateUser = async () => {
        try {
            const updatedUser = {
                id: user.id,
                name,
                username,
                password,
                address,
                email,
                role,
                phone
            };
            await updateUserAPI(updatedUser);
            toast.success(`Đã cập nhật người dùng ID ${user.id}`);
        } catch (error) {
            if (error.message === "Unauthorized") {
                toast.error("BẠN KHÔNG PHẢI LÀ ADMIN");
            }
            console.log("Error updating user:", error);
        }
    };

    useEffect(() => {
        fetchData()
    }, [params.userId]);

    return (
        <main className="content">
            <div id="form">
                <h3>Chỉnh sửa thông tin người dùng</h3>
                <div className="input-group">
                    <label htmlFor="name">Tên người dùng:</label>
                    <input type="text" id="name" placeholder="Tên người dùng" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                    <label htmlFor="role">Vai trò:</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="admin">Quản trị viên</option>
                        <option value="user">Người dùng</option>
                    </select>
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
                    <input type="submit" value="Cập nhật" onClick={onUpdateUser} />
                </div>
            </div>
        </main>
    );
};

export default UserAdminEditPage;
