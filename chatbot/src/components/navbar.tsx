import React, { useRef, useState } from 'react';
import { useGlobal } from '../utils/global_context';
import initiateLogout from '../services/logout_service';
import clearAttachments from '../services/clear_attachments';
import SettingInfoCard from './settings_info_card';
import CustomCheckbox from './custom_checkbox';
import PROMPTS from '../configs/bot_prompts.json'

const NavbarComp: React.FC = () => {
    const navbarDiv = useRef<HTMLDivElement>(null);
    const infoDiv = useRef<HTMLDivElement>(null);
    const settingsDiv = useRef<HTMLDivElement>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [infoCardVisible, setInfoCardVisible] = useState<boolean>(false);
    const [owlActive, setOwlActive] = useState<boolean>(true);
    const [ghostActive, setghostActive] = useState<boolean>(false);
    const [megatronActive, setMegatronActive] = useState<boolean>(false);
    const [narutoActive, setNarutoActive] = useState<boolean>(false);
    const [trait, setTrait] = useState<string>(PROMPTS.PERSONALITY[0].TRAIT);
    const {
        setAuthorized, authToken, currUser, setLoggedOut, setChatInitiated, setAuthToken, setCurrUser, setChatHistory, personality, setPersonality
    } = useGlobal();
    const {
        currTemperature, setTemperature, currTop_p, setTop_p, currTop_k, setTop_k, currMaxOutputToken, setMaxOutputToken, currFrequencyPenalty, setFrequencyPenalty, currPresencePenalty, setPresencePenalty
    } = useGlobal();

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
                info = "Session Killed";
            } else {
                info = "Schrödinger's Owl";
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

    function changeTemperature(e: React.FocusEvent<HTMLInputElement>) {
        setTemperature(Number(e.currentTarget.value));
        e.currentTarget.value = "";
    };

    function changeTop_p(e: React.FocusEvent<HTMLInputElement>) {
        setTop_p(Number(e.currentTarget.value));
        e.currentTarget.value = "";
    };

    function changeTop_k(e: React.FocusEvent<HTMLInputElement>) {
        setTop_k(Number(e.currentTarget.value));
        e.currentTarget.value = "";
    };

    function changeMaxOutTokens(e: React.FocusEvent<HTMLInputElement>) {
        setMaxOutputToken(Number(e.currentTarget.value));
        e.currentTarget.value = "";
    };

    function changeFrequencyPenalty(e: React.FocusEvent<HTMLInputElement>) {
        setFrequencyPenalty(Number(e.currentTarget.value));
        e.currentTarget.value = "";
    };

    function changePresencePenalty(e: React.FocusEvent<HTMLInputElement>) {
        setPresencePenalty(Number(e.currentTarget.value));
        e.currentTarget.value = "";
    };

    function changeInfoCardVisibility() {
        setInfoCardVisible(!infoCardVisible);
    }

    // Exclusive checkbox handlers - only one can be true at a time
    const handleOwlChange = (checked: boolean) => {
        if (checked) {
            setPersonality(PROMPTS.PERSONALITY[0].NAME);
            setTrait(PROMPTS.PERSONALITY[0].TRAIT);
            setOwlActive(true);
            setghostActive(false);
            setMegatronActive(false);
            setNarutoActive(false);
        } else {
            setOwlActive(false);
        }
    };

    const handleGhostChange = (checked: boolean) => {
        if (checked) {
            setPersonality(PROMPTS.PERSONALITY[1].NAME);
            setTrait(PROMPTS.PERSONALITY[1].TRAIT);
            setOwlActive(false);
            setghostActive(true);
            setMegatronActive(false);
            setNarutoActive(false);
        } else {
            setghostActive(false);
        }
    };

    const handleMegatronChange = (checked: boolean) => {
        if (checked) {
            setPersonality(PROMPTS.PERSONALITY[2].NAME);
            setTrait(PROMPTS.PERSONALITY[2].TRAIT);
            setOwlActive(false);
            setghostActive(false);
            setMegatronActive(true);
            setNarutoActive(false);
        } else {
            setMegatronActive(false);
        }
    };

    const handleNarutoChange = (checked: boolean) => {
        if (checked) {
            setPersonality(PROMPTS.PERSONALITY[3].NAME);
            setTrait(PROMPTS.PERSONALITY[3].TRAIT);
            setOwlActive(false);
            setghostActive(false);
            setMegatronActive(false);
            setNarutoActive(true);
        } else {
            setNarutoActive(false);
        }
    };

    return (
        <>
            <div id="innerNavbarContainer" ref={navbarDiv}>
                <div id="mainNavbarMenu">
                    <div id="navbarSettingsButton" className="navbar-item poppins-regular">
                        <button onClick={openSettings} className='navbar-button poppins-regular'><i className={settingsOpen ? "fa-solid fa-gear fa-spin" : "fa-solid fa-gear"}></i>&nbsp;settings</button>
                    </div>
                    <div id="displayInfo" className='montserrat-msg' ref={infoDiv}>{trait} {personality.toUpperCase()}</div>
                    <div id="navbarLogout" className="navbar-item">
                        <button onClick={killSession} className='navbar-button poppins-regular'>
                            <i className="fa-solid fa-skull icon-show"></i>
                            <i className="fa-regular fa-hand-spock icon-hide"></i>
                            &nbsp;session
                        </button>
                    </div>
                </div>
                <div id="settingsMenu" ref={settingsDiv}>
                    <div id="settingsItemsFlexContainer">
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="temperature">temperature</label>
                            <input type="number" id="temperature" name="temperature" placeholder={currTemperature.toString()} onBlur={changeTemperature} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="top_p">top p</label>
                            <input type="number" id="top_p" name="top_p" placeholder={currTop_p.toString()} onBlur={changeTop_p} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="top_k">top k</label>
                            <input type="number" id="top_k" name="top_k" placeholder={currTop_k.toString()} onBlur={changeTop_k} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="max_output_tokens">max output tokens</label>
                            <input type="number" id="max_output_tokens" name="max_output_tokens" placeholder={currMaxOutputToken.toString()} onBlur={changeMaxOutTokens} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="frequency_penalty">frequency penalty</label>
                            <input type="number" id="frequency_penalty" name="frequency_penalty" placeholder={currFrequencyPenalty.toString()} onBlur={changeFrequencyPenalty} />
                        </div>
                        <div className="setting-item">
                            <label className='poppins-regular' htmlFor="presence_penalty">presence penalty</label>
                            <input type="number" id="presence_penalty" name="presence_penalty" placeholder={currPresencePenalty.toString()} onBlur={changePresencePenalty} />
                        </div>
                    </div>
                    <div id="promptSettings">
                        <div className="setting-prompt-div">
                            <div id="promptOpt1" className="prompt-opt">
                                <label className='poppins-regular' htmlFor="owl-checkbox">{PROMPTS.PERSONALITY[0].NAME}</label>
                                <CustomCheckbox 
                                    id="owl-checkbox"
                                    checked={owlActive}
                                    onChange={handleOwlChange}
                                    onLabel="ON"
                                    offLabel="OFF"
                                />
                            </div>
                            <div id="promptOpt2" className="prompt-opt">
                                <label className='poppins-regular' htmlFor="optimus-checkbox">{PROMPTS.PERSONALITY[1].NAME}</label>
                                <CustomCheckbox
                                    id="optimus-checkbox"
                                    checked={ghostActive}
                                    onChange={handleGhostChange}
                                    onLabel="ON"
                                    offLabel="OFF"
                                />
                            </div>
                            <div id="promptOpt3" className="prompt-opt">
                                <label className='poppins-regular' htmlFor="megatron-checkbox">{PROMPTS.PERSONALITY[2].NAME}</label>
                                <CustomCheckbox
                                    id="megatron-checkbox"
                                    checked={megatronActive}
                                    onChange={handleMegatronChange}
                                    onLabel="ON"
                                    offLabel="OFF"
                                />
                            </div>
                            <div id="promptOpt4" className="prompt-opt">
                                <label className='poppins-regular' htmlFor="naruto-checkbox">{PROMPTS.PERSONALITY[3].NAME}</label>
                                <CustomCheckbox
                                    id="naruto-checkbox"
                                    checked={narutoActive}
                                    onChange={handleNarutoChange}
                                    onLabel="ON"
                                    offLabel="OFF"
                                />
                            </div>
                        </div>
                    </div>
                    <div id="settingsInfo">
                        <div id="aiConfigSettings" className="setting-info-div">
                            <button className='poppins-regular' onClick={changeInfoCardVisibility}>Config Info<i className="fa-solid fa-circle-info"></i></button>
                        </div>
                    </div>
                </div>
                <div id="infoCard" style={{ display: infoCardVisible && settingsOpen ? "block" : "none" }}>
                    <button className="close-info-card" onClick={changeInfoCardVisibility}><i className="fa-solid fa-circle-xmark"></i></button>
                    <SettingInfoCard />
                </div>
            </div>
        </>
    );
};

export default NavbarComp;