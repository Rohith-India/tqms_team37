import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleRegisterClick = async () => {
    const url = 'http://127.0.0.1:5000/register';
    const data = { username, password, role };
    const response = await axios.post(url, data);

    if (response.data.success) {
      // handle successful registration
    } else {
      // handle failed registration
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const url = 'http://127.0.0.1:5000/login';
    const data = { username, password, role };
    const response = await axios.post(url, data);
    
    if (response.data.success) {
      alert('Login successful!');
      setAccessToken(response.data.access_token);
      setRole(response.data.role);
      // handle successful login
      if (response.data.role === 'tender_manager') {
        navigate(`/tenders?accessToken=${response.data.access_token}`);
      } else if (response.data.role === 'vendor') {
        console.log(response.data.access_token);
        navigate(`/vendorTenders/${response.data.username}?accessToken=${response.data.access_token}`);
      }
    } else {
      alert(response.data.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={handleUsernameChange} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={handlePasswordChange} />
        </label>
        <br />
        <label>
          Role:
          <select value={role} onChange={handleRoleChange}>
            <option value="admin">Admin</option>
            <option value="tender_manager">Tender Manager</option>
            <option value="vendor">Vendor</option>
          </select>
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <br />
      <button onClick={handleRegisterClick}>Register</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Login;
