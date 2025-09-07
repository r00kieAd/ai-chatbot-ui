import { useRef, useEffect, useMemo, useState } from 'react';
import { useGlobal } from './utils/global_context';
import LoginComp from './components/login_components';
import ChatBox from './components/chat_component';
import InputBox from './components/input_component';
import NavbarComp from './components/navbar';
import SplitText from './components/split_text';
import ping from './services/ping_server';
import Silk from './components/silk_bg';
import Loading from './components/loading_screen';
import DisplayError from './components/display_error';
import initiateLogout from './services/logout_service';
import './app.css'

function App() {

  const { authorized, loggedOut, setAuthorized, setLoggedOut, chatInitiated, setChatInitiated, currUser, authToken, serverOnline, setServerOnline } = useGlobal();
  const [serverOffline, setServerOffline] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const loginContainer = useRef<HTMLDivElement>(null);
  const mainContainer = useRef<HTMLDivElement>(null);
  const innerContainer = useRef<HTMLDivElement>(null);
  const inputBoxDiv = useRef<HTMLDivElement>(null);
  const chatBoxDiv = useRef<HTMLDivElement>(null);
  const navbarDiv1 = useRef<HTMLDivElement>(null);
  const navbarDiv2 = useRef<HTMLDivElement>(null);
  const wlcmDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authorized) return;

    const INACTIVITY_MS = 60_000; // 60 seconds
    let timeoutId: number | null = null;
    let lastActivity = Date.now();
    let hiddenAt: number | null = null;
    let isLoggingOut = false;

    const doLogout = async () => {
      if (isLoggingOut) return;
      isLoggingOut = true;
      try {
        if (currUser && authToken) {
          await initiateLogout({ username: currUser, token: authToken });
        }
      } catch {
        // Ignore network/API errors; still log out client-side
      } finally {
        if (sessionStorage.getItem(import.meta.env.VITE_SESSION_AUTH_VAR) === "true") {
          sessionStorage.removeItem(import.meta.env.VITE_SESSION_AUTH_VAR);
        }
        setAuthorized(false);
        setChatInitiated(false);
        setLoggedOut(true);
        setTimeout(() => {
            window.location.reload();
        }, 600);
      }
    };

    const scheduleLogout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      const elapsed = Date.now() - lastActivity;
      const remaining = Math.max(0, INACTIVITY_MS - elapsed);
      timeoutId = window.setTimeout(() => {
        void doLogout();
      }, remaining);
    };

    const handleActivity = () => {
      lastActivity = Date.now();
      scheduleLogout();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        // Let existing timer elapse; background timers may be throttled
      } else {
        const since = Date.now();
        const lastRelevant = Math.max(lastActivity, hiddenAt ?? 0);
        const idleFor = since - lastRelevant;
        if (idleFor >= INACTIVITY_MS) {
          void doLogout();
          return;
        }
        // Still within window, resume timer from remaining idle budget
        scheduleLogout();
      }
    };

    document.addEventListener('pointerdown', handleActivity);
    document.addEventListener('pointermove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('wheel', handleActivity, { passive: true });
    document.addEventListener('touchstart', handleActivity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial arm
    lastActivity = Date.now();
    scheduleLogout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('pointerdown', handleActivity);
      document.removeEventListener('pointermove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('wheel', handleActivity as any);
      document.removeEventListener('touchstart', handleActivity as any);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authorized, setAuthorized, setChatInitiated]);

  useEffect(() => {
    if (!serverOnline) {
      setTimeout(() => {
        pingServer();
      }, 500);
    };
  }, []);

  const pingServer = async (): Promise<void> => {
    const response = await ping();
    console.log(response);
    setTimeout(() => {
      try {
        if (response && response.status) {
          setServerOffline(false);
          setServerOnline(true);
          setError(undefined);
        } else {
          setServerOffline(true);
          setServerOnline(false);
          setError("Server Offline, contact Admin");
          
        }
      } catch (Exception) {
        setServerOffline(true);
        setServerOnline(false);
        setError("Unknown error occured, please contact Admin.");
      }
    }, 500);

  }

  const welcomeMessage = useMemo(() => {
    return `こんにちは ${currUser || 'User'}! What brings you here today?`;
  }, [currUser]);

  useEffect(() => {
    setAuthorized(sessionStorage.getItem(import.meta.env.VITE_SESSION_AUTH_VAR) === "true")
    if (authorized) {
      setTimeout(() => {
        if (innerContainer.current) innerContainer.current.style.display = "block";
        if (loginContainer.current) loginContainer.current.style.display = "none";
        if (navbarDiv2.current) navbarDiv2.current.style.display = "block"
      }, 200);
      setTimeout(() => {
        if (mainContainer.current) mainContainer.current.classList.add("show");
        if (navbarDiv1.current) navbarDiv1.current.classList.add("show");
      }, 300);
    };
  }, [authorized]);

  useEffect(() => {
    if (loggedOut) {
      if (inputBoxDiv.current && chatBoxDiv.current && innerContainer.current && mainContainer.current) {
        inputBoxDiv.current.classList.remove('slideDownInputBox');
        inputBoxDiv.current.classList.remove('chat-initiated');
        innerContainer.current.classList.remove('chat-mode');
        chatBoxDiv.current.classList.remove('chat-visible');
        mainContainer.current.style.width = "40rem";
      }
      setTimeout(() => {
        if (innerContainer.current) innerContainer.current.style.display = "none";
        if (loginContainer.current) loginContainer.current.style.display = "block";
        if (navbarDiv2.current) navbarDiv2.current.style.display = "none"
      }, 200);

      setTimeout(() => {
        if (mainContainer.current) mainContainer.current.classList.remove("show");
        if (navbarDiv1.current) navbarDiv1.current.classList.remove("show");
      }, 300);
    }
  }, [loggedOut])

  useEffect(() => {
    if (chatInitiated) {
      // welcomeMessage = 
      if (mainContainer.current && inputBoxDiv.current && chatBoxDiv.current && innerContainer.current && wlcmDiv.current) {
        if (window.screen.availWidth <= 500) {
          mainContainer.current.style.width = "90%";
        } else {
          mainContainer.current.style.width = "80%";
        }
        inputBoxDiv.current.classList.add('slideDownInputBox');
        inputBoxDiv.current.classList.add('chat-initiated');
        innerContainer.current.classList.add('chat-mode');
        chatBoxDiv.current.classList.add('chat-visible');
        wlcmDiv.current.style.display = "none";
        setChatInitiated(false);
      }
    }
  }, [chatInitiated]);

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <>
      <div id="pageLiveBg">
        <Silk
          speed={5}
          scale={1}
          color="#171717"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {!serverOnline && !serverOffline && <Loading />}
      {!serverOnline && serverOffline && error && <DisplayError errorMessage={error} />}
      {serverOnline && !serverOffline && (
        <div id="parent">
          <div id='navbarContainer' ref={navbarDiv1}>
            <div id="navbarController" ref={navbarDiv2}>
              <NavbarComp />
            </div>
          </div>
          <div id='loginContainer' ref={loginContainer}>
            <LoginComp />
          </div>
          <div id="mainContainer" ref={mainContainer}>
            <div id="innerContainer" ref={innerContainer}>
              <div id="chatContainer" ref={chatBoxDiv}>
                <ChatBox />
              </div>
              <div id='welcomeMessage' className='poppins-regular' ref={wlcmDiv}>
                <SplitText
                  text={welcomeMessage}
                  className="text-2xl font-semibold text-center"
                  delay={100}
                  duration={0.6}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
                />
              </div>
              <div id="inputContainer" ref={inputBoxDiv}>
                <InputBox />
              </div>
            </div>
          </div>
        </div>)}
    </>
  )
}

export default App
