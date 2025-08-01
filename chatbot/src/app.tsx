import { useState } from 'react';
import LoginComp from './components/login_components';
import ChatBox from './components/chat_component';
import InputBox from './components/input_component';
import './app.css'

function App() {

  return (
    <>
      <div id="parent">
        <div id='loginContainer'>
          <LoginComp />
        </div>
        <div id="mainContainer">
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
