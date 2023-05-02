import React from "react";
import logo from "./logo.png";
import "./App.css";

function header(){
    return(
    <header className='App-header'>
        <img src={logo} alt = "logo" height={120} width={160}/><h1 className="title-blank">!!</h1>
        <h1 className="title-popup">TENDER & QUOTATION MANAGEMENT SYSTEM</h1>
    </header>
    );
}

export default header;