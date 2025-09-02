import React, { useEffect, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import initiateLogout from '../services/logout_service';

const NavbarComp: React.FC = () => {
    const tickTock = useRef<HTMLParagraphElement>(null);
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
        if (currUser && authToken) {
            const response = await initiateLogout({username:currUser, token: authToken});
            if (response.status && response.resp.logged_out) {
                alert("you have been logged out and session has been cleared");
            } else {
                alert("there was an issue logging out but your session has been cleared")
            }
        }
        setAuthorized(false);
        setLoggedOut(true);
        setChatInitiated(false);
        setAuthToken(undefined);
        setCurrUser(undefined);
        setChatHistory({});

        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    return (
        <>
            <div id="innerNavbarContainer">
                <div id="navbarclock" className="navbar-item" ref={tickTock}>
                    NA:NA:NA
                </div>
                <div id="navbarLogout" className="navbar-item">
                    <button onClick={killSession}>kill session</button>
                </div>
            </div>
        </>
    );
};

export default NavbarComp;