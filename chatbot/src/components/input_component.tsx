import { useEffect, useState } from 'react';
import send from '../assets/send.png';
import attach from '../assets/document.png';

const InputBox: React.FC = () => {

    const [inputVal, setInputVal] = useState<string | undefined>(undefined);
    const [asked, setAsked] = useState<boolean>(false);
    const [attachCount, setAttachCount] = useState<number>(0);
    const textareaEle = document.querySelector('textarea') as HTMLTextAreaElement | undefined;

    useEffect(() => {
        if (asked) {
            alert(inputVal);
            setAsked(false);
            setInputVal("");
            if (textareaEle) {
                textareaEle.value = "";
                textareaEle.style.height = '32px';
            }
        }
    }, [asked]);

    const getInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
        const textarea = event.currentTarget;
        textarea.style.height = '24px';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = Math.min(scrollHeight, 100) + 'px';
        const val = textarea.value;
        setInputVal(val);
    };

    const triggerSend = () => {
        if (!inputVal) return;
        setAsked(true);
    }

    return (
        <>

            <div id="inputBox">
                <div id="inputChild">
                    <textarea name="inputArea" id="inputArea" placeholder='query here...' onInput={getInput}></textarea>
                </div>
            </div>
            <div id="toolBox">
                <div id="leftCompartment">
                    <div id="llmDropContainer" className='dropContainer'>
                        <select name="llmDrop" id="llmDrop">
                            <option value="">Select LLM</option>
                            <option id="1" value="openai">OpenAI</option>
                            <option id="2" value="gemini">Gemini</option>
                        </select>
                    </div>
                    <div id="modelDropContainer" className='dropContainer'>
                        <select name="modelDrop" id="modelDrop" disabled>
                            <option value="">Select LLM</option>
                            <option value="openai">OpenAI</option>
                            <option value="gemini">Gemini</option>
                        </select>
                    </div>
                </div>
                <div id="rightCompartment">
                    <div id="fileContainer">
                        <label htmlFor="attachment"><span className='attach-img'><img src={attach} alt="File Attach" id="fileTransferGif" /></span></label>
                        <span className='attach-count'>&nbsp;{attachCount > 0 ? attachCount : ''}</span>
                        <input type="file" name="attachment" id="attachment" />
                    </div>
                    <div id="sendContainer">
                        <button className='button send-button' onClick={triggerSend}><span className='button-text'>Ask</span><span className='button-img'><img src={send} alt="Send Transfer" id="fileTransferGif" /></span></button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InputBox;