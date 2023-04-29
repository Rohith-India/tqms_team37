import React from 'react';

function LogoutButton() {
  function handleLogout() {
    localStorage.removeItem('token');
    // Perform logout logic here (e.g. clear session, redirect to login page)
    window.location.href = '/';
  }

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
