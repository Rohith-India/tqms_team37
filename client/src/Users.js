import React, { useState, useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); // new state to keep track of selected users
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      const response = await axios.get('http://127.0.0.1:5000/users', { headers: { Authorization: `Bearer ${accessToken}` }});
      if (response.data.success) {
        console.log(response.data.users)
        setUsers(response.data.users);
      } else {
        console.log(response.data.message);
      }
    };

    fetchData();
  }, [location]);

  const handleNewUserClick = () => {
    const accessToken = new URLSearchParams(location.search).get('accessToken');
    window.open(`/createUser?accessToken=${accessToken}`, '_blank', 'width=800,height=1000');
  };

  const handleSelectUser = (e, user) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, user]); // add the selected user to the list of selected users
    } else {
      setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser._id !== user._id)); // remove the selected user from the list of selected users
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUsers.length === 1) { // only enable the button if one row is selected
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      const response = await axios.delete(`http://127.0.0.1:5000/users/${selectedUsers[0]._id}`, { headers: { Authorization: `Bearer ${accessToken}` }});
      if (response.data.success) {
        alert('User deleted successfully!');
        setUsers(users.filter((user) => user._id !== selectedUsers[0]._id));
        setSelectedUsers([]);
        window.location.reload()
      } else {
        console.log(response.data.message);
        alert('User is not deleted!');
      }
    }
  };

  const handleModifyUser = () => {
    if (selectedUsers.length === 1) { // only enable the button if one row is selected
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      console.log(selectedUsers[0])
      window.open(`/createUser?_id=${selectedUsers[0]._id}&accessToken=${accessToken}`, selectedUsers[0], 'width=800,height=1000');
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('token');
    // Perform logout logic here (e.g. clear session, redirect to login page)
    navigate('/');
    alert('Logged out from the system successfully.')
  };

  const isOneRowSelected = selectedUsers.length === 1; // check if one row is selected

  return (
    <div className='container'>
      <h1 className='title'>Users</h1>
      <table>
        <thead>
          <tr>
            <th><button className='button' onClick={handleNewUserClick}>Create a New User</button></th>
            <th><button className='button' onClick={handleModifyUser} disabled={!isOneRowSelected}>Modify User</button></th>
            <th><button className='button' onClick={handleDeleteUser} disabled={!isOneRowSelected}>Delete User</button></th>
          </tr>
        </thead>
      </table>
      <table className='table' border="2">
        <thead>
          <tr>
            <th></th>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Email</th>
            <th>Contact No.</th>
            <th>Address</th>
            <th>Organization</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <input type="checkbox" onChange={(e) => handleSelectUser(e, user)} />
              </td>
              <td>{user.username}</td>
              <td>{user.password}</td>
              <td>{user.role}</td>
              <td>{user.email}</td>
              <td>{user.contactNo}</td>
              <td>{user.address}</td>
              <td>{user.organization}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <th><button className='button' onClick={handleLogout}>Logout</button></th>
    </div>
  );
}

export default Users;
