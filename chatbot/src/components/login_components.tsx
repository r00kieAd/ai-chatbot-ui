import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import authorizationProcess from '../services/authorization_service';
import hello from '../assets/hello.png';
import angry from '../assets/angry.png';
import no from '../assets/no.png';
import ok from '../assets/ok.png';
import eat from '../assets/eat.png';
import full from '../assets/full.png';
import shocked from '../assets/shocked.png';
import ClickSpark from './click_spark';

const LoginComp: React.FC = () => {
    const { setAuthorized, setAuthToken, setCurrUser, loggedOut, setLoggedOut } = useGlobal();
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
    const shockedPoliceDiv = useRef<HTMLDivElement>(null);
    const shockedPoliceImage = useRef<HTMLDivElement>(null);
    const userinput = useRef<HTMLInputElement>(null);
    const passinput = useRef<HTMLInputElement>(null);
    const userSpan = useRef<HTMLSpanElement>(null);
    const passSpan = useRef<HTMLSpanElement>(null);
    const h2Header = useRef<HTMLHeadingElement>(null);
    const loginHeaderDiv = useRef<HTMLDivElement>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [enableInput, setEnableInput] = useState<boolean>(false);
    const [imgNum, setImageNum] = useState<number>(5);
    const [error, setError] = useState<string | undefined>(undefined);
    const [nameError, setNameError] = useState<string | undefined>("What's your NAME!!??");
    const [passwordError, setPasswordError] = useState<string | undefined>("What's your PASS!!??");
    const [loginHeaderVisible, setLoginHeaderVisible] = useState<boolean>(false);

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
            if (sessionStorage.getItem(import.meta.env.VITE_SESSION_AUTH_VAR) !== "true") fadeIn(loginParent.current);
        }, 10);
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (!loginHeaderVisible) {
                if (loginHeaderDiv.current) loginHeaderDiv.current.classList.add("show");
                setLoginHeaderVisible(true);
            };
        }, 2000)
        if (!loggedIn) {
            const timeout = setTimeout(() => {
                slider();
                if (imgNum == 5 && loginParent.current) {
                    switch (true) {
                        case window.screen.width >= 900:
                            loginParent.current.style.width = "45rem";
                            break;
                        case window.screen.width >= 768 && window.screen.width <= 900:
                            loginParent.current.style.width = "auto";
                            break;
                        case window.screen.width < 768:
                            loginParent.current.style.width = "auto";
                            // loginParent.current.style.height = `${window.screen.height}px`;
                            break;
                    }
                }
            }, imgNum == 5 ? 1000 : 5000);
            if (!enableInput) setTimeout(() => setEnableInput(true), 1700);
            return () => clearTimeout(timeout);
        }
    }, [imgNum, loggedIn]);

    useEffect(() => {
        if (loggedOut) {
            setLoggedIn(false);
            setError(undefined);
            setEnableInput(false);
            setImageNum(5);

            if (userinput.current) userinput.current.value = "";
            if (passinput.current) passinput.current.value = "";
            if (h2Header.current) h2Header.current.innerText = "Confirm your identity";
            if (userSpan.current) userSpan.current.style.visibility = "hidden";
            if (passSpan.current) passSpan.current.style.visibility = "hidden";
            fadeOut(angryPoliceDiv.current);
            fadeOut(shockedPoliceDiv.current);
            fadeOut(happyPoliceDiv.current);

            setTimeout(() => {
                if (angryPoliceDiv.current) angryPoliceDiv.current.style.display = "none";
                if (shockedPoliceDiv.current) shockedPoliceDiv.current.style.display = "none";
                if (happyPoliceDiv.current) happyPoliceDiv.current.style.display = "none";
                if (angryPoliceImage.current) angryPoliceImage.current.style.display = "none";
                if (shockedPoliceImage.current) shockedPoliceImage.current.style.display = "none";
                if (okPoliceImage.current) okPoliceImage.current.style.display = "none";
                if (denyPoliceImage.current) denyPoliceImage.current.style.display = "none";

                if (calmPoliceDiv.current) {
                    calmPoliceDiv.current.style.display = "block";
                    setTimeout(() => {
                        fadeIn(calmPoliceDiv.current);
                        setTimeout(() => setEnableInput(true), 1700);
                    }, 100);
                }
            }, 500);
            setLoggedOut(false);
        }
    }, [loggedOut, setLoggedOut])

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
        if (userinput.current && userinput.current.value.length > 0) {
            if (userSpan.current) userSpan.current.style.visibility = "hidden";
        }
        if (passinput.current && passinput.current.value.length > 0) {
            if (passSpan.current) passSpan.current.style.visibility = "hidden";
        }

        if (!error) return;
        setError(undefined);
        if (h2Header.current) h2Header.current.innerText = "Confirm your identity";

        fadeOut(angryPoliceDiv.current);
        fadeOut(shockedPoliceDiv.current);
        fadeOut(happyPoliceDiv.current);

        setTimeout(() => {
            if (angryPoliceDiv.current) angryPoliceDiv.current.style.display = "none";
            if (shockedPoliceDiv.current) shockedPoliceDiv.current.style.display = "none";
            if (angryPoliceImage.current) angryPoliceImage.current.style.display = "none";
            if (shockedPoliceImage.current) shockedPoliceImage.current.style.display = "none";

            if (calmPoliceDiv.current) {
                calmPoliceDiv.current.style.display = "block";
                setTimeout(() => {
                    fadeIn(calmPoliceDiv.current);
                }, 100);
            }
        }, 500);
    }

    const showPoliceDiv = (div: HTMLDivElement | null, image: HTMLSpanElement | null | HTMLDivElement | null, message: string) => {
        if (div && image) {
            div.style.display = "block";
            (image as HTMLElement).style.display = "block";
            setTimeout(() => {
                fadeIn(div);
                setError(message);
            }, 200);
        } else {
            setTimeout(() => {
                fadeIn(div);
                setError(message);
            }, 200);
        }
    };

    const checkCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
        setError(undefined);
        event.preventDefault();
        if (h2Header.current) h2Header.current.innerText = "Validating...";

        const username = userinput.current?.value;
        const password = passinput.current?.value;

        if (!username || !password) {
            setError("You shall not pass!");
            fadeOut(calmPoliceDiv.current);
            if (calmPoliceDiv.current) calmPoliceDiv.current.style.display = "none";
            showPoliceDiv(angryPoliceDiv.current, angryPoliceImage.current, "You shall not pass!");

            if (!username && userSpan.current) userSpan.current.style.visibility = "visible";
            if (!password && passSpan.current) passSpan.current.style.visibility = "visible";
            return;
        }

        fadeIn(happyPoliceDiv.current);
        fadeOut(calmPoliceDiv.current);
        if (calmPoliceDiv.current) calmPoliceDiv.current.style.display = "none";

        const response = await authorizationProcess({
            username: username,
            password: password,
            is_user: true,
            ip_value: ""
        });
        if (response && response.status) {
            if (!response.resp.verification_passed) {
                displayErrResp();
                return;
            }
            if (happyPoliceDiv.current && okPoliceImage.current) {
                happyPoliceDiv.current.style.display = "block";
                okPoliceImage.current.style.display = "block";
                setTimeout(() => {
                    if (h2Header.current) h2Header.current.innerText = "Logging in...";
                    fadeIn(happyPoliceDiv.current);
                }, 200);
                setTimeout(() => {
                    setAuthorized(true);
                    sessionStorage.setItem(import.meta.env.VITE_SESSION_AUTH_VAR, "true");
                    setAuthToken(response.resp.token);
                    setCurrUser(username);
                    fadeOut(loginParent.current);
                }, 2000);
                setLoggedIn(true);
            }
        } else {
            displayErrResp();
        }

        function displayErrResp() {
            const statusCode = response?.statusCode ?? 0;
            let errorMessage = "";
            if (statusCode >= 200 && statusCode < 300) {
                errorMessage = response?.resp.msg || "Authentication failed";
            } else {
                errorMessage = response?.resp.msg || response?.resp || "Authentication failed";
            }
            if (statusCode >= 500) {
                showPoliceDiv(shockedPoliceDiv.current, shockedPoliceImage.current, errorMessage);
            } else {
                showPoliceDiv(angryPoliceDiv.current, denyPoliceImage.current, errorMessage);
            }

            if (errorMessage.includes("user") && userSpan.current) {
                userSpan.current.style.visibility = "visible"
            };

            if (errorMessage.includes("password") && passSpan.current) {
                passSpan.current.style.visibility = "visible"
            };
        }
    };

    const checkGuestUser = async () => {
        setError("Not Allowed!")
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
                            <div className="intro-img-div shocked-img-div" ref={shockedPoliceDiv}>
                                <span className="police police-shocked" ref={shockedPoliceImage}><img src={shocked} alt="police" /></span>
                            </div>
                        </div>
                    </div>
                    <div className="compartment-2 compartment">
                        <div id="loginHeaders" className='poppins-regular' ref={loginHeaderDiv}>
                            <h2 ref={h2Header}>{error ? error : "Confirm your identity"}</h2>
                            <br />
                            <i className="fa-solid fa-user-ninja"></i><span>&nbsp;&nbsp;Enter your account details below...</span>
                        </div>
                        <div id="loginForm">
                            <br />
                            <div id="formContainer">
                                <form onSubmit={checkCredentials}>
                                    <span className='err user-err poppins-regular' ref={userSpan}>invalid username...</span><br />
                                    <input className='keyinput poppins-regular' type="text" name="username" id="username" placeholder='username' onInput={checkInput} ref={userinput} disabled={!enableInput} /><br /><br />
                                    <span className='err pass-err poppins-regular' ref={passSpan}>invalid password...</span>
                                    <input className='keyinput poppins-regular' type="password" name="password" id="password" placeholder='password' onInput={checkInput} ref={passinput} disabled={!enableInput} /><br /><br />
                                    <ClickSpark sparkColor='#000' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                                        <button type="submit" disabled={!enableInput} className='poppins-regular'>
                                            <i className="fa-solid fa-arrow-right-to-bracket"></i> Login
                                        </button>
                                    </ClickSpark>

                                </form>
                            </div>
                            {/* <span className='or poppins-regular'>or</span> */}
                            <div id="guestOptions">
                                <ClickSpark sparkColor='#000' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                                    <button onClick={checkGuestUser} disabled={!enableInput} className='poppins-regular'>Continue as Guest&nbsp;&nbsp;<i className="fa-solid fa-feather"></i></button>
                                </ClickSpark>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>)
};

export default LoginComp;