import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface GlobalState {
    authorized: boolean;
    setAuthorized: (value: boolean) => void;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export function GlobalProvider({children}: {children: ReactNode}) {
    const [authorized, setAuthorized] = useState(false);

    return <GlobalContext.Provider value={{authorized, setAuthorized}}>
        {children}
    </GlobalContext.Provider>
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (!context) throw new Error("useGlobal must be used inside GlobalProvider");
    return context;
}