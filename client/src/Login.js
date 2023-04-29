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
    <div className="container">
      <h1 className="title">TENDER & QUOTATION MANAGEMENT SYSTEM</h1>
      <form className="form" onSubmit={handleSubmit}>
        <h1 className="title-popup">LOGIN</h1>
        <br></br>
        <label className="label">
          USERNAME
          <input type="text" className="input" value={username} onChange={handleUsernameChange} />
        </label>
        <label className="label">
          PASSWORD
          <input type="password" className="input" value={password} onChange={handlePasswordChange} />
        </label>
        <button type="submit" className="button">LOGIN</button>
      </form>
  </div>
  );
}

export default Login;
