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

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
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
      if (response.data.role === 'admin') {
        navigate(`/users?accessToken=${response.data.access_token}`);
      } else if (response.data.role === 'tender_manager') {
        navigate(`/tenders/${response.data.userid}?accessToken=${response.data.access_token}`);
      } else if (response.data.role === 'vendor') {
        console.log(response.data.access_token);
        navigate(`/vendorTenders/${response.data.userid}?accessToken=${response.data.access_token}`);
      }
    } else {
      alert(response.data.message);
    }
  };

  return (
    <div>
      <h1>Tender and Quotation Management System</h1>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
