import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface GlobalState {
    authorized: boolean;
    setAuthorized: (value: boolean) => void;
    chatInitiated: boolean;
    setChatInitiated: (value: boolean) => void;
    authToken: string | undefined;
    setAuthToken: (value: string | undefined) => void;
    currUser: string | undefined;
    setCurrUser: (value: string | undefined) => void;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [chatInitiated, setChatInitiated] = useState(false);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);
    const [currUser, setCurrUser] = useState<string | undefined>(undefined);

    return <GlobalContext.Provider value={{ authorized, setAuthorized, chatInitiated, setChatInitiated, authToken, setAuthToken, currUser, setCurrUser }}>
        {children}
    </GlobalContext.Provider>
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (!context) throw new Error("useGlobal must be used inside GlobalProvider");
    return context;
}