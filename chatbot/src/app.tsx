import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './app.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div id="parent">
        <div id="mainContainer">
          <div id="innerContainer">
            <div id="chatContainer">
              {/* will contain inbox component */}
            </div>
            <div id="inputContainer">
              <div id="inputBox">
                {/* will contain input box */}
              </div>
              <div id="toolBox">
                <div id="leftCompartment">
                  <div id="llmDropContainer">
                    {/* will contain llm selection dropdown */}
                  </div>
                  <div id="modelDropContainer">
                    {/* will contain model slection dropdown options w.r.t. llm */}
                  </div>
                </div>
                <div id="rightCompartment">
                  <div id="fileContainer">
                    {/* to contain file attachment tool */}
                  </div>
                  <div id="sendContainer">
                    {/* will contain send button */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
