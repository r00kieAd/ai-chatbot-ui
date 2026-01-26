import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import authorizationProcess from '../services/authorization_service';
import getAllModels from '../services/get_models';
import setLLMChoice from '../services/llm_choice';
import hello from '../assets/hello.png';
import angry from '../assets/angry.png';
import no from '../assets/no.png';
import ok from '../assets/ok.png';
import sing from '../assets/sing.png';
import welcome from '../assets/welcome.png';
import sorry from '../assets/sorry.png';
import ClickSpark from './click_spark';
import ShinyText from './shiny_text';

const LoginComp: React.FC = () => {
    const { setAuthorized, setAuthToken, setCurrUser, loggedOut, setLoggedOut, setUpdatingLLMConfig } = useGlobal();
    const { setTemperature, setTop_p, setTop_k, setMaxOutputToken, setFrequencyPenalty, setPresencePenalty, setAvailableModels } = useGlobal();
    const { guestLogin, setGuestLogin } = useGlobal();
    const helloPoliceImage = useRef<HTMLSpanElement>(null);
    const singPoliceImage = useRef<HTMLSpanElement>(null);
    const welcomePoliceImage = useRef<HTMLSpanElement>(null);
    const angryPoliceImage = useRef<HTMLSpanElement>(null);
    const denyPoliceImage = useRef<HTMLSpanElement>(null);
    const okPoliceImage = useRef<HTMLSpanElement>(null);
    const loginParent = useRef<HTMLDivElement>(null);
    const calmPoliceDiv = useRef<HTMLDivElement>(null);
    const angryPoliceDiv = useRef<HTMLDivElement>(null);
    const happyPoliceDiv = useRef<HTMLDivElement>(null);
    const sorryPoliceDiv = useRef<HTMLDivElement>(null);
    const sorryPoliceImage = useRef<HTMLDivElement>(null);
    const userinput = useRef<HTMLInputElement>(null);
    const passinput = useRef<HTMLInputElement>(null);
    const userSpan = useRef<HTMLSpanElement>(null);
    const passSpan = useRef<HTMLSpanElement>(null);
    const h2Header = useRef<HTMLHeadingElement>(null);
    const ninjaIcon = useRef<HTMLSpanElement>(null);
    const loginHeaderDiv = useRef<HTMLDivElement>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [enableInput, setEnableInput] = useState<boolean>(false);
    const [imgNum, setImageNum] = useState<number>(5);
    const [error, setError] = useState<string | undefined>(undefined);
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
            fadeOut(sorryPoliceDiv.current);
            fadeOut(happyPoliceDiv.current);

            setTimeout(() => {
                if (angryPoliceDiv.current) angryPoliceDiv.current.style.display = "none";
                if (sorryPoliceDiv.current) sorryPoliceDiv.current.style.display = "none";
                if (happyPoliceDiv.current) happyPoliceDiv.current.style.display = "none";
                if (angryPoliceImage.current) angryPoliceImage.current.style.display = "none";
                if (sorryPoliceImage.current) sorryPoliceImage.current.style.display = "none";
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
                        if (singPoliceImage.current) singPoliceImage.current.style.display = "none";
                        if (welcomePoliceImage.current) welcomePoliceImage.current.style.display = "none";
                        break;
                    case 1:
                        if (helloPoliceImage.current) helloPoliceImage.current.style.display = "none";
                        if (singPoliceImage.current) singPoliceImage.current.style.display = "block";
                        if (welcomePoliceImage.current) welcomePoliceImage.current.style.display = "none";
                        break;
                    case 2:
                        if (helloPoliceImage.current) helloPoliceImage.current.style.display = "none";
                        if (singPoliceImage.current) singPoliceImage.current.style.display = "none";
                        if (welcomePoliceImage.current) welcomePoliceImage.current.style.display = "block";
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
        if (ninjaIcon.current) ninjaIcon.current.classList.remove('err-color');
        if (h2Header.current) h2Header.current.innerText = "Confirm your identity";

        // alert("I am here");
        hideAllPoliceDivs();

        setTimeout(() => {
            if (calmPoliceDiv.current) {
                calmPoliceDiv.current.style.display = "block";
                setTimeout(() => {
                    fadeIn(calmPoliceDiv.current);
                }, 100);
            }
        }, 100);
    }

    const hideAllPoliceDivs = () => {
        const allPoliceDivs = [
            calmPoliceDiv.current,
            angryPoliceDiv.current,
            happyPoliceDiv.current,
            sorryPoliceDiv.current
        ];

        const allPoliceImages = [
            helloPoliceImage.current,
            singPoliceImage.current,
            welcomePoliceImage.current,
            angryPoliceImage.current,
            denyPoliceImage.current,
            okPoliceImage.current,
            sorryPoliceImage.current
        ];

        allPoliceDivs.forEach(div => {
            if (div) {
                fadeOut(div);
                setTimeout(() => {
                    div.style.display = "none";
                }, 1);
            }
        });

        allPoliceImages.forEach(image => {
            if (image) {
                (image as HTMLElement).style.display = "none";
            }
        });
    };

    const showPoliceDiv = (div: HTMLDivElement | null, image: HTMLSpanElement | null | HTMLDivElement | null, message: string) => {
        hideAllPoliceDivs();

        setTimeout(() => {
            if (div && image) {
                div.style.display = "block";
                (image as HTMLElement).style.display = "block";
                setTimeout(() => {
                    fadeIn(div);
                    setError(message);
                    if (h2Header.current) h2Header.current.innerText = message;
                }, 2);
            } else {
                setTimeout(() => {
                    fadeIn(div);
                    setError(message);
                    if (h2Header.current) h2Header.current.innerText = message;
                }, 2);
            }
        }, 2);
    };

    const setupAuthenticationUI = () => {
        setEnableInput(false);
        if (h2Header.current) h2Header.current.innerText = "Validating...";
        // setError(undefined);
        hideAllPoliceDivs();
        if (happyPoliceDiv.current) {
            happyPoliceDiv.current.style.display = "block";
            fadeIn(happyPoliceDiv.current);
        }
    };

    const displayErrResp = (response: any) => {
        setGuestLogin(false);
        const statusCode = response?.statusCode ?? 0;
        let errorMessage = "";
        if (statusCode >= 200 && statusCode < 300) {
            errorMessage = response?.resp.msg || "Authentication failed";
        } else {
            errorMessage = response?.resp.msg || response?.resp || "Authentication failed";
        }
        if (statusCode >= 500) {
            showPoliceDiv(sorryPoliceDiv.current, sorryPoliceImage.current, errorMessage);
        } else {
            showPoliceDiv(angryPoliceDiv.current, denyPoliceImage.current, errorMessage);
            if (ninjaIcon.current) ninjaIcon.current.classList.add('err-color');
        }

        if (!guestLogin) {
            if (errorMessage.includes("user") && userSpan.current) {
                userSpan.current.style.visibility = "visible"
                if (ninjaIcon.current) ninjaIcon.current.classList.add('err-color');
            };

            if (errorMessage.includes("password") && passSpan.current) {
                passSpan.current.style.visibility = "visible"
                if (ninjaIcon.current) ninjaIcon.current.classList.add('err-color');
            };
        }
    };

    const defaultLLMChoice = async (username: string, llm: string, token: string) => {
        setUpdatingLLMConfig(true);
        const res = await setLLMChoice({ username: username, llm: llm, token: token });
        if (res && res.status) {
            setTemperature(res.resp.config.temp);
            setTop_p(res.resp.config.top_p);
            setTop_k(res.resp.config.top_k);
            setMaxOutputToken(res.resp.config.output_tokens);
            setFrequencyPenalty(res.resp.config.freq_penalty);
            setPresencePenalty(res.resp.config.presence_penalty);
        } else {
            setTemperature(import.meta.env.VITE_DEFAULT_TEMP);
            setTop_p(import.meta.env.VITE_DEFAULT_TEMP);
            setTop_k(import.meta.env.VITE_DEFAULT_TEMP);
            setMaxOutputToken(import.meta.env.VITE_DEFAULT_TEMP);
            setFrequencyPenalty(import.meta.env.VITE_DEFAULT_TEMP);
            setPresencePenalty(import.meta.env.VITE_DEFAULT_TEMP);
        }
        setUpdatingLLMConfig(false);
    }

    const getAllAvailableModels = async (username: string, token: string) => {
        const res = await getAllModels({user: username, token: token});
        setAvailableModels(res.resp.models)
    }

    const handleAuthSuccess = async (response: any, username: string) => {
        if (happyPoliceDiv.current && okPoliceImage.current) {
            setCurrUser(username);
            happyPoliceDiv.current.style.display = "block";
            okPoliceImage.current.style.display = "block";
            setTimeout(async () => {
                if (h2Header.current) h2Header.current.innerText = "Logging in...";
                fadeIn(happyPoliceDiv.current);
                await defaultLLMChoice(username, "OpenAI", response.resp.token);
                await getAllAvailableModels(username, response.resp.token);
            }, 500);
            setTimeout(() => {
                setAuthorized(true);
                sessionStorage.setItem(import.meta.env.VITE_SESSION_AUTH_VAR, "true");
                setAuthToken(response.resp.token);
                fadeOut(loginParent.current);
            }, 500);
            setLoggedIn(true);
        }
    };

    const performAuthentication = async (authParams: any) => {
        setupAuthenticationUI();

        const response = await authorizationProcess(authParams);

        if (response && response.status) {
            if (!response.resp.verification_passed) {
                setEnableInput(true);
                displayErrResp(response);
                return;
            }
            handleAuthSuccess(response, authParams.username);
        } else {
            setEnableInput(true);
            displayErrResp(response);
        }
    };



    const checkCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const username = userinput.current?.value;
        const password = passinput.current?.value;

        // console.log('checkCredentials - username:', username, 'password:', password, 'guestLogin:', guestLogin);

        if ((!username || !password) && !guestLogin) {
            const errorMsg = "You shall not pass!";
            showPoliceDiv(angryPoliceDiv.current, angryPoliceImage.current, errorMsg);

            if (!username && userSpan.current) userSpan.current.style.visibility = "visible";
            if (!password && passSpan.current) passSpan.current.style.visibility = "visible";
            if (ninjaIcon.current) ninjaIcon.current.classList.add('err-color');
            setEnableInput(true);
            return;
        }

        await performAuthentication({
            username: username,
            password: password,
            is_user: !guestLogin,
            ip_value: ""
        });
    };

    const getClientIP = async (): Promise<string | undefined> => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (err) {
            console.error(err);
            setError('Failed to get IP address');
            return undefined;
        }
    };

    const checkGuestUser = async () => {
        setGuestLogin(true);

        if (h2Header.current) h2Header.current.innerText = "Getting your ip...";
        const ip = await getClientIP();
        if (!ip) return;
        await performAuthentication({
            username: ip,
            password: "",
            is_user: false,
            ip_value: ip
        });
    }

    return (
        <>
            <div id="loginParent" ref={loginParent}>
                <div id="containerOne">
                    <div className="compartment-1 compartment">
                        <div id="policeDiv">
                            <div className='intro-img-div intro-img-slides' ref={calmPoliceDiv}>
                                <span className="police police-hello" ref={helloPoliceImage}><img src={hello} alt="police" /></span>
                                <span className="police police-sing" ref={singPoliceImage}><img src={sing} alt="police" /></span>
                                <span className="police police-welcome" ref={welcomePoliceImage}><img src={welcome} alt="police" /></span>
                            </div>
                            <div className="intro-img-div error-img-div" ref={angryPoliceDiv}>
                                <span className="police police-angry" ref={angryPoliceImage}><img src={angry} alt="police" /></span>
                                <span className="police police-deny" ref={denyPoliceImage}><img src={no} alt="police" /></span>
                            </div>
                            <div className="intro-img-div ok-img-div" ref={happyPoliceDiv}>
                                <span className="police police-ok" ref={okPoliceImage}><img src={ok} alt="police" /></span>
                            </div>
                            <div className="intro-img-div sorry-img-div" ref={sorryPoliceDiv}>
                                <span className="police police-sorry" ref={sorryPoliceImage}><img src={sorry} alt="police" /></span>
                            </div>
                        </div>
                    </div>
                    <div className="compartment-2 compartment">
                        <div id="loginHeaders" className='poppins-regular' ref={loginHeaderDiv}>
                            <h2 ref={h2Header}>{error ? error : "Confirm your identity"}</h2>
                            <br />
                            <span ref={ninjaIcon}><i className="fa-solid fa-user-ninja"></i></span><span className='sec-head'>&nbsp;&nbsp;Enter your account details below...</span>
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
                                            <i className="fa-solid fa-arrow-right-to-bracket"></i> <ShinyText text="Login" disabled={false} speed={3} className='custom-class' />
                                        </button>
                                    </ClickSpark>

                                </form>
                            </div>
                            {/* <span className='or poppins-regular'>or</span> */}
                            <div id="guestOptions">
                                <ClickSpark sparkColor='#000' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                                    <button onClick={checkGuestUser} disabled={!enableInput} className='poppins-regular'>Continue as Guest&nbsp;&nbsp;<i className="fa-solid fa-fsingher"></i></button>
                                </ClickSpark>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>)
};

export default LoginComp;