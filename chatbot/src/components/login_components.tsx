import React, { useEffect, useState, useRef } from 'react';
import hello from '../assets/hello.png';
import angry from '../assets/angry.png';
import no from '../assets/no.png';
import ok from '../assets/ok.png';
import eat from '../assets/eat.png';
import full from '../assets/full.png';

const LoginComp: React.FC = () => {
    const helloPoliceImage = useRef<HTMLSpanElement>(null);
    const eatPoliceImage = useRef<HTMLSpanElement>(null);
    const fullPoliceImage = useRef<HTMLSpanElement>(null);
    const angryPoliceImage = useRef<HTMLSpanElement>(null);
    const denyPoliceImage = useRef<HTMLSpanElement>(null);
    const okPoliceImage = useRef<HTMLSpanElement>(null);
    const loginContainer = useRef<HTMLDivElement>(null);
    const calmPoliceDiv = useRef<HTMLDivElement>(null);
    const angryPoliceDiv = useRef<HTMLDivElement>(null);
    const happyPoliceDiv = useRef<HTMLDivElement>(null);
    const userinput = useRef<HTMLInputElement>(null);
    const passinput = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState<string | undefined>(undefined);
    const [password, setPassword] = useState<string | undefined>(undefined);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [imgNum, setImageNum] = useState<number>(5);

    function fadeOut(el: HTMLElement | null) {
        if (!el) return;
        el.classList.remove("show");
    }

    function fadeIn(el: HTMLElement | null) {
        if (!el) return;
        el.classList.add("show");
    }

    useEffect(() => {
        if (!loggedIn) {
            const timeout = setTimeout(() => {
                slider();
                if (imgNum == 5 && loginContainer.current && window.screen.width > 500) loginContainer.current.style.width = "504px";
            }, imgNum == 5 ? 300 : 5000);

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

    const checkCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (userinput.current) setUsername(userinput.current.value);
        if (passinput.current) setPassword(passinput.current.value);
        if (username && password) alert(`${username}, ${password}`);
    }

    return (
        <>
            <div id="loginParent" ref={loginContainer}>
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
                            <h2>Confirm you identity</h2>
                            <span>&nbsp;&nbsp;Enter your account details below...</span>
                        </div>
                        <div id="loginForm">
                            <br />
                            <div id="formContainer">
                                <form onSubmit={checkCredentials}>
                                    <span className='err user-err'>invalid username...</span><br />
                                    <input className='keyinput' type="text" name="username" id="username" placeholder='username' ref={userinput}/><br /><br />
                                    <span className='err pass-err'>invalid password...</span>
                                    <input className='keyinput' type="password" name="password" id="password" placeholder='password' ref={passinput}/><br /><br />
                                    <input type="submit" value="Login" />
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