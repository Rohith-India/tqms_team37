import React, { useState, useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

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
    window.open(`/createUser?accessToken=${accessToken}`, '_blank', 'width=600,height=600');
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
        //window.location.reload()
      } else {
        console.log(response.data.message);
      }
    }
  };

  const handleModifyUser = () => {
    if (selectedUsers.length === 1) { // only enable the button if one row is selected
      const accessToken = new URLSearchParams(location.search).get('accessToken');
      console.log(selectedUsers[0])
      window.open(`/createUser?_id=${selectedUsers[0]._id}&accessToken=${accessToken}`, selectedUsers[0], 'width=600,height=600');
    }
  };

  const isOneRowSelected = selectedUsers.length === 1; // check if one row is selected

  return (
    <div>
      <h1>Users</h1>
      <button onClick={handleNewUserClick}>Create a New User</button>
      <button onClick={handleModifyUser} disabled={!isOneRowSelected}>Modify User</button>
      <button onClick={handleDeleteUser} disabled={!isOneRowSelected}>Delete User</button>
      <Table border="2">
        <thead>
          <tr>
            <th>
              <input type="checkbox" disabled={selectedUsers.length > 0} /> {/* disable the checkbox header if any row is selected */}
            </th>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Email</th>
            <th>Contact No.</th>
            <th>Address</th>
            <th>Organization</th>
            <th></th>
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
      </Table>
    </div>
  );
}

export default Users;
