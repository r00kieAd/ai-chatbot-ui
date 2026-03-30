import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import authorizationProcess from '../services/authorization_service';
import getAllModels from '../services/get_models';
import setLLMChoice from '../services/llm_choice';
import ClickSpark from './click_spark';
import ShinyText from './shiny_text';

type AuthParams = {
    username: string;
    password: string;
    is_user: boolean;
    ip_value: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const LoginComp: React.FC = () => {
    const { setAuthorized, setAuthToken, setCurrUser, loggedOut, setLoggedOut, setUpdatingLLMConfig } = useGlobal();
    const { setTemperature, setTop_p, setTop_k, setMaxOutputToken, setFrequencyPenalty, setPresencePenalty, setAvailableModels } = useGlobal();
    const { guestLogin, setGuestLogin } = useGlobal();
    const loginParent = useRef<HTMLDivElement>(null);
    const userinput = useRef<HTMLInputElement>(null);
    const passinput = useRef<HTMLInputElement>(null);
    const userSpan = useRef<HTMLSpanElement>(null);
    const passSpan = useRef<HTMLSpanElement>(null);
    const ninjaIcon = useRef<HTMLSpanElement>(null);
    const loginHeaderDiv = useRef<HTMLDivElement>(null);
    const [enableInput, setEnableInput] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    function fadeOut(el: HTMLElement | null) {
        if (!el) return;
        el.classList.remove("show");
    }

    function fadeIn(el: HTMLElement | null) {
        if (!el) return;
        el.classList.add("show");
    }

    useEffect(() => {
        const showTimer = window.setTimeout(() => {
            if (sessionStorage.getItem(import.meta.env.VITE_SESSION_AUTH_VAR) !== "true") fadeIn(loginParent.current);
        }, 10);
        const enableTimer = window.setTimeout(() => setEnableInput(true), 250);
        const headerTimer = window.setTimeout(() => {
            if (loginHeaderDiv.current) loginHeaderDiv.current.classList.add("show");
        }, 200);
        return () => {
            window.clearTimeout(showTimer);
            window.clearTimeout(enableTimer);
            window.clearTimeout(headerTimer);
        };
    }, [])

    useEffect(() => {
        if (loggedOut) {
            setErrorMessage(undefined);
            setStatusMessage(undefined);
            setEnableInput(true);
            setGuestLogin(false);

            if (userinput.current) userinput.current.value = "";
            if (passinput.current) passinput.current.value = "";
            fadeOut(userSpan.current);
            fadeOut(passSpan.current);
            if (ninjaIcon.current) ninjaIcon.current.classList.remove('err-color');
            setLoggedOut(false);
        }
    }, [loggedOut, setLoggedOut, setGuestLogin])

    function checkInput() {
        if (guestLogin) setGuestLogin(false);
        if (userinput.current && userinput.current.value.length > 0) {
            fadeOut(userSpan.current);
        }
        if (passinput.current && passinput.current.value.length > 0) {
            fadeOut(passSpan.current);
        }

        if (!errorMessage) return;
        setErrorMessage(undefined);
        setStatusMessage(undefined);
        if (ninjaIcon.current) ninjaIcon.current.classList.remove('err-color');
    }

    const setupAuthenticationUI = () => {
        setEnableInput(false);
        setErrorMessage(undefined);
        setStatusMessage("Validating...");
        if (ninjaIcon.current) ninjaIcon.current.classList.remove('err-color');
    };

    const displayErrResp = (response: unknown) => {
        setGuestLogin(false);
        const respRecord = isRecord(response) ? response : undefined;
        const statusCode = typeof respRecord?.statusCode === 'number' ? respRecord.statusCode : 0;
        const resp = respRecord?.resp;
        const respMsg =
            isRecord(resp) && typeof resp.msg === 'string'
                ? resp.msg
                : typeof resp === 'string'
                    ? resp
                    : undefined;
        const extractedMessage =
            (statusCode >= 200 && statusCode < 300 ? respMsg : respMsg) || "Authentication failed";
        setStatusMessage(undefined);
        setErrorMessage(extractedMessage);
        if (ninjaIcon.current) ninjaIcon.current.classList.add('err-color');

        if (!guestLogin) {
            if (extractedMessage.includes("user") && userSpan.current) {
                fadeIn(userSpan.current);
                if (ninjaIcon.current) ninjaIcon.current.classList.add('err-color');
            };

            if (extractedMessage.includes("password") && passSpan.current) {
                fadeIn(passSpan.current);
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

    const handleAuthSuccess = async (token: string, username: string) => {
        setCurrUser(username);
        setErrorMessage(undefined);
        setStatusMessage("Logging in...");
        await defaultLLMChoice(username, "OpenAI", token);
        await getAllAvailableModels(username, token);
        setAuthorized(true);
        sessionStorage.setItem(import.meta.env.VITE_SESSION_AUTH_VAR, "true");
        setAuthToken(token);
        fadeOut(loginParent.current);
    };

    const performAuthentication = async (authParams: AuthParams) => {
        setupAuthenticationUI();

        const response: unknown = await authorizationProcess(authParams);

        if (isRecord(response) && response.status === true) {
            const resp = response.resp;
            const verificationPassed =
                isRecord(resp) && typeof resp.verification_passed === 'boolean'
                    ? resp.verification_passed
                    : true;
            if (!verificationPassed) {
                setEnableInput(true);
                displayErrResp(response);
                return;
            }
            const token = isRecord(resp) && typeof resp.token === 'string' ? resp.token : undefined;
            if (!token) {
                setEnableInput(true);
                displayErrResp(response);
                return;
            }
            handleAuthSuccess(token, authParams.username);
        } else {
            setEnableInput(true);
            displayErrResp(response);
        }
    };



    const checkCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const username = userinput.current?.value?.trim() ?? "";
        const password = passinput.current?.value ?? "";

        // console.log('checkCredentials - username:', username, 'password:', password, 'guestLogin:', guestLogin);

        if ((!username || !password) && !guestLogin) {
            const errorMsg = "You shall not pass!";
            setStatusMessage(undefined);
            setErrorMessage(errorMsg);

            if (!username) fadeIn(userSpan.current);
            if (!password) fadeIn(passSpan.current);
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
            setErrorMessage('Failed to get IP address');
            return undefined;
        }
    };

    const checkGuestUser = async () => {
        setEnableInput(false);
        setGuestLogin(true);
        setErrorMessage(undefined);
        setStatusMessage("Getting your ip...");
        const ip = await getClientIP();
        if (!ip) {
            setEnableInput(true);
            setStatusMessage(undefined);
            setErrorMessage(prev => prev ?? "Failed to get IP address");
            return;
        }
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
                        <div className="guestPanel poppins-regular">
                            <h3>Don&apos;t have an account?</h3>
                            <p>Try the app with guest access — no signup required.</p>
                            <ClickSpark sparkColor='#000' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                                <button type="button" onClick={checkGuestUser} disabled={!enableInput} className='poppins-regular guestButton'>
                                    CONTINUE AS GUEST
                                </button>
                            </ClickSpark>
                        </div>
                    </div>
                    <div className="compartment-2 compartment">
                        <div id="loginHeaders" className='poppins-regular' ref={loginHeaderDiv}>
                            <h2>LOGIN</h2>
                            <span ref={ninjaIcon}><i className="fa-solid fa-user-ninja"></i></span><span className='sec-head'>&nbsp;&nbsp;Enter your account details below...</span>
                        </div>
                        <div id="loginForm">
                            <div id="formContainer">
                                <form onSubmit={checkCredentials}>
                                    <div
                                        className={`login-status poppins-regular${statusMessage ? ' show' : ''}`}
                                        aria-hidden={!statusMessage}
                                    >
                                        {statusMessage ?? '\u00A0'}
                                    </div>
                                    <div
                                        className={`login-error poppins-regular${errorMessage ? ' show' : ''}`}
                                        aria-hidden={!errorMessage}
                                    >
                                        {errorMessage ?? '\u00A0'}
                                    </div>
                                    <span className='err user-err poppins-regular' ref={userSpan}>invalid username...</span>
                                    <input className='keyinput poppins-regular' type="text" name="username" id="username" placeholder='Username' onInput={checkInput} ref={userinput} disabled={!enableInput} />
                                    <span className='err pass-err poppins-regular' ref={passSpan}>invalid password...</span>
                                    <input className='keyinput poppins-regular' type="password" name="password" id="password" placeholder='Password' onInput={checkInput} ref={passinput} disabled={!enableInput} />
                                    <ClickSpark sparkColor='#000' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                                        <button type="submit" disabled={!enableInput} className='poppins-regular'>
                                            <i className="fa-solid fa-arrow-right-to-bracket"></i> <ShinyText text="Login" disabled={false} speed={3} className='custom-class' />
                                        </button>
                                    </ClickSpark>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>)
};

export default LoginComp;
