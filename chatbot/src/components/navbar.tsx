import React, { useRef, useState } from 'react';
import { useGlobal } from '../utils/global_context';
import initiateLogout from '../services/logout_service';
import clearAttachments from '../services/clear_attachments';

const NavbarComp: React.FC = () => {
    const navbarDiv = useRef<HTMLDivElement>(null);
    const infoDiv = useRef<HTMLDivElement>(null);
    const settingsDiv = useRef<HTMLDivElement>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const {
        setAuthorized, authToken, currUser, setLoggedOut, setChatInitiated, setAuthToken, setCurrUser, setChatHistory
    } = useGlobal();

    const temperature = -0;

    function openSettings() {
        if (!settingsOpen && settingsDiv.current) {
            settingsDiv.current.classList.add("show");
        } else if (settingsOpen && settingsDiv.current) {
            settingsDiv.current.classList.remove("show");
        }
        setSettingsOpen(!settingsOpen);
    };

    async function killSession() {
        sessionStorage.removeItem(import.meta.env.VITE_SESSION_AUTH_VAR);
        let info = "not authorized";
        if (currUser && authToken) {

            try {
                const response = await clearAttachments({ username: currUser, token: authToken });
                if (response.status) {
                    info = "session cleared";
                } else {
                    info = "session cleared with error";
                }
                console.warn(info);
            } catch (error) {
                console.warn("files weren't cleared");
            }

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
            console.warn(info);
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
            <div id="innerNavbarContainer" ref={navbarDiv}>
                <div id="mainNavbarMenu">
                    <div id="navbarSettingsButton" className="navbar-item poppins-regular">
                        <button onClick={openSettings} className='navbar-button poppins-regular'><i className={settingsOpen ? "fa-solid fa-gear fa-spin": "fa-solid fa-gear"}></i>&nbsp;settings</button>
                    </div>
                    <div id="displayInfo" className='montserrat-msg' ref={infoDiv}>Smart Owl</div>
                    <div id="navbarLogout" className="navbar-item">
                        <button onClick={killSession} className='navbar-button poppins-regular'>
                            <i className="fa-solid fa-skull icon-show"></i>
                            <i className="fa-regular fa-hand-spock icon-hide"></i>
                            &nbsp;session
                            </button>
                    </div>
                </div>
                <div id="settingsMenu" ref={settingsDiv}>
                    <div className="settings-flex-container">
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="temperature">temperature</label>
                            <input type="number" id="temperature" name="temperature" placeholder={temperature.toString()} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="top_p">top p</label>
                            <input type="number" id="top_p" name="top_p" placeholder={temperature.toString()} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="top_k">top k</label>
                            <input type="number" id="top_k" name="top_k" placeholder={temperature.toString()} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="max_output_tokens">max output tokens</label>
                            <input type="number" id="max_output_tokens" name="max_output_tokens" placeholder={temperature.toString()} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="frequency_penalty">frequency penalty</label>
                            <input type="number" id="frequency_penalty" name="frequency_penalty" placeholder={temperature.toString()} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="presence_penalty">presence penalty</label>
                            <input type="number" id="presence_penalty" name="presence_penalty" placeholder={temperature.toString()} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavbarComp;