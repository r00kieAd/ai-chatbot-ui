import React, { useEffect, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import initiateLogout from '../services/logout_service';

const NavbarComp: React.FC = () => {
    const tickTock = useRef<HTMLSpanElement>(null);
    const infoDiv = useRef<HTMLDivElement>(null);
    const {
        setAuthorized, authToken, currUser, setLoggedOut, setChatInitiated, setAuthToken, setCurrUser, setChatHistory
    } = useGlobal();

    useEffect(() => {
        const updateTime = () => {
            if (tickTock.current) {
                const currrTime = new Date().toLocaleTimeString();
                tickTock.current.innerText = currrTime;
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    async function killSession() {
        sessionStorage.removeItem(import.meta.env.VITE_SESSION_AUTH_VAR);
        let info = "not authorized";
        if (currUser && authToken) {
            const response = await initiateLogout({ username: currUser, token: authToken });
            if (response.status && response.resp.logged_out) {
                info = "session cleared";
            } else {
                info = "session cleared with error";
            }
        }
        if (infoDiv.current) {
            infoDiv.current.innerText = info;
        } else {
            alert(info);
        };

        setTimeout(() => {
            setAuthorized(false);
            setLoggedOut(true);
            setChatInitiated(false);
            setAuthToken(undefined);
            setCurrUser(undefined);
            setChatHistory({});
        }, 100);

        setTimeout(() => {
            window.location.reload();
        }, 600);
    }

    return (
        <>
            <div id="innerNavbarContainer">
                <div id="navbarclock" className="navbar-item poppins-regular">
                    <span className='clock-icon'><i className="fa-solid fa-circle-check"></i></span>&nbsp;<span  ref={tickTock}></span>
                </div>
                <div id="displayInfo" className='montserrat-msg' ref={infoDiv}>Chatbot UI</div>
                <div id="navbarLogout" className="navbar-item">
                    <button onClick={killSession} className='poppins-regular'><i className="fa-solid fa-skull"></i>&nbsp;session</button>
                </div>
            </div>
        </>
    );
};

export default NavbarComp;