import React ,{useState} from 'react';
// import './UserMenu.css';
import LogoutButton from './LogoutButton';
import logo from './avatar.png';

function UserMenu(props) {
    const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="user-menu">
      <div className="user-avatar">
        <img src={logo} alt="User Avatar" />
      </div>
      {/* {isOpen && (
        <ul className="dropdown-menu">
          <li>Username</li>
          <li onClick={LogoutButton}>Logout</li>
        </ul>
      )} */}
      <ul id="dropdown-menu">
        <li>My Profile</li>
        <li><LogoutButton /></li>
      </ul>
    </div>
  );
}

export default UserMenu;
