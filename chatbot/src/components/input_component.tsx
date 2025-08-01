import React, { useEffect, useState } from 'react';
import send from '../assets/send.png';
import attach from '../assets/document.png';
import LLMs from '../configs/available_llm_models.json';
import TextAreaHeight from '../utils/textarea_css_data';

const InputBox: React.FC = () => {

    const [inputVal, setInputVal] = useState<string | undefined>(undefined);
    const [asked, setAsked] = useState<boolean>(false);
    const [attachCount, setAttachCount] = useState<number>(0);
    const [llmID, setllmID] = useState<string>("1");
    const textareaEle = document.querySelector('textarea') as HTMLTextAreaElement | undefined;
    const [llms, setLlms] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const txtHeightStyle = new TextAreaHeight();
    const { textareaHeight, textareaMaxHeight } = txtHeightStyle.getHeightValues();

    useEffect(() => {
        if (asked) {
            setAsked(false);
            setInputVal(undefined);
            if (textareaEle) {
                textareaEle.value = "";
                textareaEle.style.height = textareaHeight;
            }
        }
    }, [asked]);

    useEffect(() => {
        const allLLMs: string[] = LLMs.ALL.map(e => e.name);
        setLlms(allLLMs);
        fetchModels();
    }, [llmID]);

    const getInput = (event: React.FormEvent<HTMLTextAreaElement>) => {

        const textarea = event.currentTarget;
        textarea.style.height = textareaHeight;
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = Number(textareaMaxHeight.split('px')[0]);
        textarea.style.height = Math.min(scrollHeight + 1, maxHeight) + 'px';
        const val = textarea.value;
        setInputVal(val);

    };

    const fetchModels = () => {

        let allModels: string[] = [];
        switch (llmID) {
            case "1":
                allModels = LLMs.M1.MODELS.map(e => e.model);
                break;
            case "2":
                allModels = LLMs.M2.MODELS.map(e => e.model);
                break;
            default:
                allModels = ["none"];
                break;
        }

        setModels(allModels);
    }

    const changeModel = (event: React.FormEvent<HTMLSelectElement>) => {
        const select = event.currentTarget;
        const selectedOption = select.options[select.selectedIndex];
        const selectedId = selectedOption.id;
        setllmID(selectedId);
    }

    const triggerSend = () => {
        if (!inputVal) {
            return;
        };

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
                        <select name="llmDrop" id="llmDrop" onChange={changeModel} className='pointer'>
                            {llms.map((e, i) => (
                                <option id={(i + 1).toString()} value={e}>{e}</option>
                            ))}
                        </select>
                    </div>
                    <div id="modelDropContainer" className='dropContainer'>
                        <select name="modelDrop" id="modelDrop" className='pointer'>
                            {models.map((e) => (
                                <option value={e}>{e}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div id="rightCompartment">
                    <div id="fileContainer">
                        <label htmlFor="attachment" className='pointer'><span className='attach-img'><img src={attach} alt="File Attach" id="fileTransferGif" /></span></label>
                        <span className='attach-count'>&nbsp;{attachCount > 0 ? attachCount : ''}</span>
                        <input type="file" name="attachment" id="attachment" />
                    </div>
                    <div id="sendContainer">
                        <button className='button send-button pointer' onClick={triggerSend}><span className='button-text'>Ask</span><span className='button-img'><img src={send} alt="Send Transfer" id="fileTransferGif" /></span></button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InputBox;