import React from "react";
import "./App.css";
import UserMenu from "./UserMenu";
import logo from "./logo.png";

function Header() {
    let menu = document.getElementById('dropdown-menu');
    let avatar = document.getElementsByClassName('user-avatar')
    avatar.onmouseover= function (e){
         menu.style.visibility='visible'  
    }
    return (
        <header className="App-header">
            <img src={logo} alt='logo' />
            <text>TENDERS AND QUOTATIONS MANAGEMENT SYSTEM</text>
            <UserMenu />
        </header>
    );
}
export default Header;