import React, { useEffect, useState } from 'react';
import police from '../assets/no-access.png';

const LoginComp: React.FC = () => {
    return (
        <>
            <div id="loginParent">
                <div id="containerOne">
                    <div id="policeDiv">
                        <span id="police"><img src={police} alt="" /></span>
                    </div>
                    <div id="loginHeaders">
                        <h2>Confirm you identity</h2>
                        <span>Enter your account details below...</span>
                    </div>
                    <div id="loginForm">
                        <br />
                        <div id="formContainer">
                            <span className='err user-err'>invalid username...</span><br />
                            <input className='keyinput' type="text" name="username" id="username" placeholder='username' /><br /><br />
                            <span className='err pass-err'>invalid password...</span>
                            <input className='keyinput' type="password" name="password" id="password" placeholder='password' /><br /><br />
                            <input type="submit" value="Login" />
                        </div>
                        <span className='or'>or</span>
                        <div id="guestOptions">
                            <button>Continue as Guest</button>
                        </div>
                    </div>
                </div>
            </div>
        </>)
};

export default LoginComp;