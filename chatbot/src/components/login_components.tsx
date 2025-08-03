import React, { useEffect, useState } from 'react';
import hello from '../assets/hello.png';
import angry from '../assets/angry.png';
import no from '../assets/no.png';
import ok from '../assets/ok.png';
import eat from '../assets/eat.png';
import full from '../assets/full.png';

const LoginComp: React.FC = () => {
    return (
        <>
            <div id="loginParent">
                <div id="containerOne">
                    <div className="compartment-1 compartment">
                        <div id="policeDiv">
                            <div className='intro-img-div intro-img-slides'>
                                <span className="police"><img src={hello} alt="" /></span>
                            </div>
                            <div className="intro-img-div error-img-div">
                                <span className="police police-angry"><img src={hello} alt="" /></span>
                                <span className="police police-deny"><img src={hello} alt="" /></span>
                            </div>
                        </div>
                    </div>
                    <div className="compartment-2 compartment">
                        <div id="loginHeaders">
                            <h2>Confirm you identity</h2>
                            <span>&nbsp;&nbsp;Enter your account details below...</span>
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
            </div>
        </>)
};

export default LoginComp;