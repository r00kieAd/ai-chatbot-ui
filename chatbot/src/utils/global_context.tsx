import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface ChatMessage {
    userMessage: string;
    userTime: string;
    botMessage: string;
    botTime: string;
}

interface GlobalState {
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
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [loggedOut, setLoggedOut] = useState(false);
    const [chatInitiated, setChatInitiated] = useState(false);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);
    const [currUser, setCurrUser] = useState<string | undefined>(undefined);
    const [chatHistory, setChatHistory] = useState<{ [key: string]: ChatMessage }>({});

    return <GlobalContext.Provider value={{ 
        authorized, setAuthorized,
        loggedOut, setLoggedOut,
        chatInitiated, setChatInitiated, 
        authToken, setAuthToken, 
        currUser, setCurrUser,
        chatHistory, setChatHistory
    }}>
        {children}
    </GlobalContext.Provider>
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (!context) throw new Error("useGlobal must be used inside GlobalProvider");
    return context;
}