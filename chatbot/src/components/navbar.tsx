import React, { useRef, useState } from 'react';
import { useGlobal } from '../utils/global_context';
import initiateLogout from '../services/logout_service';
import llmConfig from '../services/llm_config';
import clearAttachments from '../services/clear_attachments';
import SettingInfoCard from './settings_info_card';
import CustomCheckbox from './custom_checkbox';
import PROMPTS from '../configs/bot_prompts.json'
import Loading from './loading_screen';

const NavbarComp: React.FC = () => {
    const navbarDiv = useRef<HTMLDivElement>(null);
    const infoDiv = useRef<HTMLDivElement>(null);
    const settingsDiv = useRef<HTMLDivElement>(null);
    const settingsMenu = useRef<HTMLDivElement>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [infoCardVisible, setInfoCardVisible] = useState<boolean>(false);
    const [personalityA, setpersonalityA] = useState<boolean>(false);
    const [personalityB, setpersonalityB] = useState<boolean>(false);
    const [personalityC, setpersonalityC] = useState<boolean>(false);
    const [personalityD, setpersonalityD] = useState<boolean>(false);
    const configUnit = {
        A: "temperature",
        B: "top p",
        C: "top k",
        D: "max output tokens",
        E: "frequency penalty",
        F: "presence penalty"
    } as const;
    type UnitKey = keyof typeof configUnit;
    type UnitValue = typeof configUnit[UnitKey];
    const getConfigUnit = (unit: UnitKey): UnitValue => { return configUnit[unit]}
    const [trait, setTrait] = useState<string>('');
    const {
        setAuthorized, authToken, currUser, setLoggedOut, setChatInitiated, setAuthToken, setCurrUser, setChatHistory, personality, setPersonality, setUpdatingLLMConfig, updatingLLMConfig
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

    const updateConfig = async (user: string, temp: number, top_p: number, top_k: number, output_tokens: number, freq_penalty: number, presence_penalty: number, unit: UnitKey) => {
        setUpdatingLLMConfig(true);
        const res = await llmConfig({user, token: authToken ? authToken : "",  temp, top_p, top_k, output_tokens, freq_penalty, presence_penalty});
        console.log(`${getConfigUnit(unit)} ${(res && res.status)? "updated":"not updated"}`);
        setUpdatingLLMConfig(false);
        return res && res.status;
    }

    async function changeTemperature(e: React.FocusEvent<HTMLInputElement>) {
        const temp = Number(e.currentTarget.value);
        e.currentTarget.value = "";
        if (await updateConfig(currUser ? currUser : "dummy", temp, currTop_p, currTop_k, currMaxOutputToken, currFrequencyPenalty, currPresencePenalty, "A")) {
            setTemperature(temp);
        }
    };

    async function changeTop_p(e: React.FocusEvent<HTMLInputElement>) {
        const top_p = Number(e.currentTarget.value)
        e.currentTarget.value = "";
        if (await updateConfig(currUser ? currUser : "dummy", currTemperature, top_p, currTop_k, currMaxOutputToken, currFrequencyPenalty, currPresencePenalty, "B")) {
            setTop_p(top_p);
        }
    };

    async function changeTop_k(e: React.FocusEvent<HTMLInputElement>) {
        const top_k = Number(e.currentTarget.value);
        e.currentTarget.value = "";
        if (await updateConfig(currUser ? currUser : "dummy", currTemperature, currTop_p, top_k, currMaxOutputToken, currFrequencyPenalty, currPresencePenalty, "C")) {
            setTop_k(top_k);
        }
    };

    async function changeMaxOutTokens(e: React.FocusEvent<HTMLInputElement>) {
        const max_output_tokens = Number(e.currentTarget.value);
        e.currentTarget.value = "";
        if (await updateConfig(currUser ? currUser : "dummy", currTemperature, currTop_p, currTop_k, max_output_tokens, currFrequencyPenalty, currPresencePenalty, "D")) {
            setMaxOutputToken(max_output_tokens);
        }
    };

    async function changeFrequencyPenalty(e: React.FocusEvent<HTMLInputElement>) {
        const freq_penalty = Number(e.currentTarget.value);
        e.currentTarget.value = "";
        if (await updateConfig(currUser ? currUser : "dummy", currTemperature, currTop_p, currTop_k, currMaxOutputToken, freq_penalty, currPresencePenalty, "E")) {
            setFrequencyPenalty(freq_penalty);
        }
    };

    async function changePresencePenalty(e: React.FocusEvent<HTMLInputElement>) {
        const presence_penalty = Number(e.currentTarget.value);
        e.currentTarget.value = "";
        if (await updateConfig(currUser ? currUser : "dummy", currTemperature, currTop_p, currTop_k, currMaxOutputToken, currFrequencyPenalty, presence_penalty, "F")) {
            setPresencePenalty(presence_penalty);
        }
    };

    function changeInfoCardVisibility() {
        setInfoCardVisible(!infoCardVisible);
    }

    // Exclusive checkbox handlers - only one can be true at a time
    const handlePersonalityChangeA = (checked: boolean) => {
        if (checked) {
            setPersonality(PROMPTS.PERSONALITY[0].NAME);
            setTrait(PROMPTS.PERSONALITY[0].TRAIT);
            setpersonalityA(true);
            setpersonalityB(false);
            setpersonalityC(false);
            setpersonalityD(false);
        } else {
            setTrait('');
            setPersonality('');
            setpersonalityA(false);
        }
    };

    const handlePersonalityChangeB = (checked: boolean) => {
        if (checked) {
            setPersonality(PROMPTS.PERSONALITY[1].NAME);
            setTrait(PROMPTS.PERSONALITY[1].TRAIT);
            setpersonalityA(false);
            setpersonalityB(true);
            setpersonalityC(false);
            setpersonalityD(false);
        } else {
            setTrait('');
            setPersonality('');
            setpersonalityB(false);
        }
    };

    const handlePersonalityChangeC = (checked: boolean) => {
        if (checked) {
            setPersonality(PROMPTS.PERSONALITY[2].NAME);
            setTrait(PROMPTS.PERSONALITY[2].TRAIT);
            setpersonalityA(false);
            setpersonalityB(false);
            setpersonalityC(true);
            setpersonalityD(false);
        } else {
            setTrait('');
            setPersonality('');
            setpersonalityC(false);
        }
    };

    const handlePersonalityChangeD = (checked: boolean) => {
        if (checked) {
            setPersonality(PROMPTS.PERSONALITY[3].NAME);
            setTrait(PROMPTS.PERSONALITY[3].TRAIT);
            setpersonalityA(false);
            setpersonalityB(false);
            setpersonalityC(false);
            setpersonalityD(true);
        } else {
            setTrait('');
            setPersonality('');
            setpersonalityD(false);
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
                <div id="settingsContainer" ref={settingsDiv}>
                    <div className={updatingLLMConfig ? "show" : "" + "setting-loading-mask"} style={{"display": updatingLLMConfig ? "block":"none"}}>{<Loading />}</div>
                    <div id="settingsMenu" className={updatingLLMConfig ? "blur" : ""} ref={settingsMenu}>
                        <div id="settingsItemsFlexContainer">
                            <div className="setting-item">
                                <label className='poppins-regular' htmlFor="temperature">temperature</label>
                                <input type="number" id="temperature" name="temperature" placeholder={currTemperature ? currTemperature.toString() : ""} onBlur={changeTemperature} />
                            </div>
                            <div className="setting-item">
                                <label className='poppins-regular' htmlFor="top_p">top p</label>
                                <input type="number" id="top_p" name="top_p" placeholder={currTop_p ? currTop_p.toString() : ""} onBlur={changeTop_p} />
                            </div>
                            <div className="setting-item">
                                <label className='poppins-regular' htmlFor="top_k">top k</label>
                                <input type="number" id="top_k" name="top_k" placeholder={currTop_k ? currTop_k.toString() : ""} onBlur={changeTop_k} />
                            </div>
                            <div className="setting-item">
                                <label className='poppins-regular' htmlFor="max_output_tokens">max output tokens</label>
                                <input type="number" id="max_output_tokens" name="max_output_tokens" placeholder={currMaxOutputToken ? currMaxOutputToken.toString(): ""} onBlur={changeMaxOutTokens} />
                            </div>
                            <div className="setting-item">
                                <label className='poppins-regular' htmlFor="frequency_penalty">frequency penalty</label>
                                <input type="number" id="frequency_penalty" name="frequency_penalty" placeholder={currFrequencyPenalty ? currFrequencyPenalty.toString(): ""} onBlur={changeFrequencyPenalty} />
                            </div>
                            <div className="setting-item">
                                <label className='poppins-regular' htmlFor="presence_penalty">presence penalty</label>
                                <input type="number" id="presence_penalty" name="presence_penalty" placeholder={currPresencePenalty ? currPresencePenalty.toString(): ""} onBlur={changePresencePenalty} />
                            </div>
                        </div>
                        <div id="promptSettings">
                            <div className="setting-prompt-div">
                                <div id="promptOpt1" className="prompt-opt">
                                    <label className='poppins-regular' htmlFor="personality_checkA">{PROMPTS.PERSONALITY[0].NAME}</label>
                                    <CustomCheckbox
                                        id="personality_checkA"
                                        checked={personalityA}
                                        onChange={handlePersonalityChangeA}
                                        onLabel="ON"
                                        offLabel="OFF"
                                    />
                                </div>
                                <div id="promptOpt2" className="prompt-opt">
                                    <label className='poppins-regular' htmlFor="personality_checkB">{PROMPTS.PERSONALITY[1].NAME}</label>
                                    <CustomCheckbox
                                        id="personality_checkB"
                                        checked={personalityB}
                                        onChange={handlePersonalityChangeB}
                                        onLabel="ON"
                                        offLabel="OFF"
                                    />
                                </div>
                                <div id="promptOpt3" className="prompt-opt">
                                    <label className='poppins-regular' htmlFor="personality_checkC">{PROMPTS.PERSONALITY[2].NAME}</label>
                                    <CustomCheckbox
                                        id="personality_checkC"
                                        checked={personalityC}
                                        onChange={handlePersonalityChangeC}
                                        onLabel="ON"
                                        offLabel="OFF"
                                    />
                                </div>
                                <div id="promptOpt4" className="prompt-opt">
                                    <label className='poppins-regular' htmlFor="personality_checkD">{PROMPTS.PERSONALITY[3].NAME}</label>
                                    <CustomCheckbox
                                        id="personality_checkD"
                                        checked={personalityD}
                                        onChange={handlePersonalityChangeD}
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