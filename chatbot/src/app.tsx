import { useState, useRef, useEffect } from 'react';
import { useGlobal } from './utils/global_context';
import LoginComp from './components/login_components';
import ChatBox from './components/chat_component';
import InputBox from './components/input_component';
import './app.css'

function App() {

  const { authorized } = useGlobal();
  const loginContainer = useRef<HTMLDivElement>(null);
  const mainContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authorized) {
      if (loginContainer.current) loginContainer.current.style.display = "none";
      if (mainContainer.current) mainContainer.current.style.display = "block";
    }
  }, [authorized])

  return (
    <>
      <div id="parent">
        <div id='loginContainer' ref={loginContainer}>
          <LoginComp />
        </div>
        <div id="mainContainer" ref={mainContainer}>
          <div id="innerContainer">
            <div id="chatContainer">
              <ChatBox />
            </div>
            <div id="inputContainer">
              <InputBox />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
