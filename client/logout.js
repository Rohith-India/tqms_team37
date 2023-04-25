import React from "react";
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
    const navigate = useNavigate();
  
    function handleLogout() {
      localStorage.removeItem('token');
      // Perform logout logic here (e.g. clear session, redirect to login page)
      navigate('/');
    }
  
    return(<button onClick={handleLogout}>Logout</button>);
}
export default LogoutButton;