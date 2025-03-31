import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap';
import { fetchUsersApi } from '../../../../../api/usersAPI';
import { SCREEN_URL } from '../../../../../constants/screen/PathScreen';
import { Link } from 'react-router-dom';

const UsersAdminPage = () => {
    const [users, setUsers] = useState([]);
    const fetchData = async () => {
        try {
            const fetchedUsers = await fetchUsersApi();
            setUsers(fetchedUsers.users);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <div className="control d-flex justify-content-between ">
                <Button variant="primary" >
                    <Link style={{ color: 'white' }} to={SCREEN_URL.ADMIN_CREATE_USER}>Tạo người dùng mới</Link>
                </Button>
            </div>
            <Table striped bordered hover style={{ width: "1200px" }}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, i) => (
                        <tr>
                            <th>{i + 1}</th>
                            <th>{user.id}</th>

                            <th>
                                <Link to={`${SCREEN_URL.ADMIN_EDIT_USER.replace(':userId', user.id)}`}>{user.name}</Link>
                            </th>
                            <th>
                                {user.username}
                            </th>
                            <th>{user.password}</th>
                            <th>{user.email}</th>
                            <th>{user.address}</th>
                            <th>{user.role}</th>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}

export default UsersAdminPage
