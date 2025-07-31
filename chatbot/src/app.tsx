import { useState } from 'react'
import InputBox from './components/input_component';
import './app.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div id="parent">
        {/* <img src={send} alt="File Transfer" id="fileTransferGif" /> */}
        <div id="mainContainer">
          <div id="innerContainer">
            <div id="chatContainer">
              {/* will contain chat component */}
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
