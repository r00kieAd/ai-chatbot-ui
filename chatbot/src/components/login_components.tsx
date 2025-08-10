import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import hello from '../assets/hello.png';
import angry from '../assets/angry.png';
import no from '../assets/no.png';
import ok from '../assets/ok.png';
import eat from '../assets/eat.png';
import full from '../assets/full.png';

const LoginComp: React.FC = () => {
    const { authorized, setAuthorized } = useGlobal();
    const helloPoliceImage = useRef<HTMLSpanElement>(null);
    const eatPoliceImage = useRef<HTMLSpanElement>(null);
    const fullPoliceImage = useRef<HTMLSpanElement>(null);
    const angryPoliceImage = useRef<HTMLSpanElement>(null);
    const denyPoliceImage = useRef<HTMLSpanElement>(null);
    const okPoliceImage = useRef<HTMLSpanElement>(null);
    const loginParent = useRef<HTMLDivElement>(null);
    const calmPoliceDiv = useRef<HTMLDivElement>(null);
    const angryPoliceDiv = useRef<HTMLDivElement>(null);
    const happyPoliceDiv = useRef<HTMLDivElement>(null);
    const userinput = useRef<HTMLInputElement>(null);
    const passinput = useRef<HTMLInputElement>(null);
    const userSpan = useRef<HTMLSpanElement>(null);
    const passSpan = useRef<HTMLSpanElement>(null);
    const h2Header = useRef<HTMLHeadingElement>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [enableInput, setEnableInput] = useState<boolean>(false);
    const [imgNum, setImageNum] = useState<number>(5);
    const [error, setError] = useState<string | undefined>(undefined);
    const [nameError, setNameError] = useState<string | undefined>("What's your NAME!!??");
    const [passwordError, setPasswordError] = useState<string | undefined>("What's your PASS!!??");

    function fadeOut(el: HTMLElement | null) {
        if (!el) return;
        el.classList.remove("show");
    }

    function fadeIn(el: HTMLElement | null) {
        if (!el) return;
        el.classList.add("show");
    }

    useEffect(() => {
        setTimeout(() => {
            fadeIn(loginParent.current);
        }, 10);
    }, [])

    useEffect(() => {
        if (!loggedIn) {
            const timeout = setTimeout(() => {
                slider();
                if (imgNum == 5 && loginParent.current && window.screen.width > 500) loginParent.current.style.width = "504px";
            }, imgNum == 5 ? 1000 : 5000);
            if (!enableInput) setTimeout(() => setEnableInput(true), 1700);
            return () => clearTimeout(timeout);
        }
    }, [imgNum, loggedIn]);

    function slider() {
        fadeOut(calmPoliceDiv.current);
        setTimeout(() => {
            setImageNum(prev => {
                const nextNum = (prev + 1) % 3;
                switch (nextNum) {
                    case 0:
                        if (helloPoliceImage.current) helloPoliceImage.current.style.display = "block";
                        if (eatPoliceImage.current) eatPoliceImage.current.style.display = "none";
                        if (fullPoliceImage.current) fullPoliceImage.current.style.display = "none";
                        break;
                    case 1:
                        if (helloPoliceImage.current) helloPoliceImage.current.style.display = "none";
                        if (eatPoliceImage.current) eatPoliceImage.current.style.display = "block";
                        if (fullPoliceImage.current) fullPoliceImage.current.style.display = "none";
                        break;
                    case 2:
                        if (helloPoliceImage.current) helloPoliceImage.current.style.display = "none";
                        if (eatPoliceImage.current) eatPoliceImage.current.style.display = "none";
                        if (fullPoliceImage.current) fullPoliceImage.current.style.display = "block";
                        break;
                    default:
                        if (helloPoliceImage.current) helloPoliceImage.current.style.display = "block";
                        break;
                }
                fadeIn(calmPoliceDiv.current);
                return nextNum;
            });
        }, 1000);
    }

    function checkInput() {
        if (!error) return;
        setLoggedIn(false);
        if (calmPoliceDiv.current) {
            calmPoliceDiv.current.style.display = "block";
            setTimeout(() => {
                fadeIn(calmPoliceDiv.current);
            }, 200);
        }
        fadeIn(angryPoliceDiv.current);
        if (angryPoliceDiv.current) angryPoliceDiv.current.style.display = "none";
        if (userinput.current && passinput.current) {
            if (userinput.current.value.length > 0) {
                if (userSpan.current) userSpan.current.style.visibility = "hidden";
                setError(undefined);
            }
            if (passinput.current.value.length > 0) {
                if (passSpan.current) passSpan.current.style.visibility = "hidden";
                setError(undefined);
            }
        }
    }

    const checkCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoggedIn(true);
        fadeOut(calmPoliceDiv.current)
        if (calmPoliceDiv.current) calmPoliceDiv.current.style.display = "none";
        const username = userinput.current?.value;
        const password = passinput.current?.value;
        if (username && password && happyPoliceDiv.current && okPoliceImage.current) {
            happyPoliceDiv.current.style.display = "block";
            okPoliceImage.current.style.display = "block";
            setTimeout(() => {
                if (h2Header.current) h2Header.current.innerText = "Logging in...";
                fadeIn(happyPoliceDiv.current);
            }, 200);
            setTimeout(() => {
                setAuthorized(true);
                fadeOut(loginParent.current);
            }, 2000);
        } else {
            let policeState = 0;
            if (!username || !password) {
                if (!username && !password) {
                    setError("Identify yourself !!");
                } else if (!username) {
                    if (userSpan.current) userSpan.current.style.visibility = "visible";
                    policeState = 1;
                } else if (!password) {
                    if (passSpan.current) passSpan.current.style.visibility = "visible";
                    policeState = 1;
                }
                if (!error) setError("You shall not pass!");
            }
            if (angryPoliceDiv.current && denyPoliceImage.current && angryPoliceImage.current) {
                angryPoliceDiv.current.style.display = "block";
                if (policeState == 1) {
                    angryPoliceImage.current.style.display = "block";
                    denyPoliceImage.current.style.display = "none";
                } else {
                    angryPoliceImage.current.style.display = "none";
                    denyPoliceImage.current.style.display = "block";
                }
                setTimeout(() => {
                    fadeIn(angryPoliceDiv.current);
                }, 200);
            }
        }
    }

    return (
        <>
            <div id="loginParent" ref={loginParent}>
                <div id="containerOne">
                    <div className="compartment-1 compartment">
                        <div id="policeDiv">
                            <div className='intro-img-div intro-img-slides' ref={calmPoliceDiv}>
                                <span className="police police-hello" ref={helloPoliceImage}><img src={hello} alt="police" /></span>
                                <span className="police police-eat" ref={eatPoliceImage}><img src={eat} alt="police" /></span>
                                <span className="police police-full" ref={fullPoliceImage}><img src={full} alt="police" /></span>
                            </div>
                            <div className="intro-img-div error-img-div" ref={angryPoliceDiv}>
                                <span className="police police-angry" ref={angryPoliceImage}><img src={angry} alt="police" /></span>
                                <span className="police police-deny" ref={denyPoliceImage}><img src={no} alt="police" /></span>
                            </div>
                            <div className="intro-img-div ok-img-div" ref={happyPoliceDiv}>
                                <span className="police police-ok" ref={okPoliceImage}><img src={ok} alt="police" /></span>
                            </div>
                        </div>
                    </div>
                    <div className="compartment-2 compartment">
                        <div id="loginHeaders">
                            <h2 ref={h2Header}>{error ? error : "Confirm your identity"}</h2>
                            <br />
                            <span>&nbsp;&nbsp;Enter your account details below...</span>
                        </div>
                        <div id="loginForm">
                            <br />
                            <div id="formContainer">
                                <form onSubmit={checkCredentials}>
                                    <span className='err user-err' ref={userSpan}>invalid username...</span><br />
                                    <input className='keyinput' type="text" name="username" id="username" placeholder='username' onInput={checkInput} ref={userinput} disabled={!enableInput}/><br /><br />
                                    <span className='err pass-err' ref={passSpan}>invalid password...</span>
                                    <input className='keyinput' type="password" name="password" id="password" placeholder='password' onInput={checkInput} ref={passinput} disabled={!enableInput}/><br /><br />
                                    <input type="submit" value="Login" disabled={!enableInput}/>
                                </form>
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