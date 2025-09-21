import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface ChatMessage {
    userMessage: string;
    userTime: string;
    botMessage: string;
    botTime: string;
    llmModel?: string;
}

interface GlobalState {
    serverOnline: boolean;
    setServerOnline: (value: boolean) => void;
    authorized: boolean;
    setAuthorized: (value: boolean) => void;
    loggedOut: boolean;
    setLoggedOut: (value: boolean) => void;
    chatInitiated: boolean;
    setChatInitiated: (value: boolean) => void;
    authToken: string | undefined;
    setAuthToken: (value: string | undefined) => void;
    currUser: string | undefined;
    setCurrUser: (value: string | undefined) => void;
    chatHistory: { [key: string]: ChatMessage };
    setChatHistory: (value: { [key: string]: ChatMessage } | ((prev: { [key: string]: ChatMessage }) => { [key: string]: ChatMessage })) => void;
    currllmModel: string | undefined;
    setCurrllmModel: (value: string) => void;
    currTemperature: number;
    setTemperature: (value: number) => void;
    currTop_p: number;
    setTop_p: (value: number) => void;
    currTop_k: number;
    setTop_k: (value: number) => void;
    currMaxOutputToken: number;
    setMaxOutputToken: (value: number) => void;
    currFrequencyPenalty: number;
    setFrequencyPenalty: (value: number) => void;
    currPresencePenalty: number;
    setPresencePenalty: (value: number) => void;
    guestLogin: boolean;
    setGuestLogin: (value: boolean) => void;
    guestPromptCount: number;
    setGuestPromptCount: (value: number) => void;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [serverOnline, setServerOnline] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [loggedOut, setLoggedOut] = useState(false);
    const [chatInitiated, setChatInitiated] = useState(false);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);
    const [currUser, setCurrUser] = useState<string | undefined>(undefined);
    const [chatHistory, setChatHistory] = useState<{ [key: string]: ChatMessage }>({});
    const [currllmModel, setCurrllmModel] = useState<string | undefined>('unknown');
    const [currTemperature, setTemperature] = useState<number>(0);
    const [currTop_p, setTop_p] = useState<number>(0);
    const [currTop_k, setTop_k] = useState<number>(0);
    const [currMaxOutputToken, setMaxOutputToken] = useState<number>(0);
    const [currFrequencyPenalty, setFrequencyPenalty] = useState<number>(0);
    const [currPresencePenalty, setPresencePenalty] = useState<number>(0);
    const [guestLogin, setGuestLogin] = useState<boolean>(false);
    const [guestPromptCount, setGuestPromptCount] = useState<number>(0);
    return <GlobalContext.Provider value={{ 
        serverOnline, setServerOnline,
        authorized, setAuthorized,
        loggedOut, setLoggedOut,
        chatInitiated, setChatInitiated, 
        authToken, setAuthToken, 
        currUser, setCurrUser,
        chatHistory, setChatHistory,
        currllmModel, setCurrllmModel,
        currTemperature, setTemperature,
        currTop_p, setTop_p,
        currTop_k, setTop_k,
        currMaxOutputToken, setMaxOutputToken,
        currFrequencyPenalty, setFrequencyPenalty,
        currPresencePenalty, setPresencePenalty,
        guestLogin, setGuestLogin,
        guestPromptCount, setGuestPromptCount
    }}>
        {children}
    </GlobalContext.Provider>
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (!context) throw new Error("useGlobal must be used inside GlobalProvider");
    return context;
}