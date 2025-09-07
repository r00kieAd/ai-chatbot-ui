import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
import send from '../assets/send.png';
import attach from '../assets/document.png';
import LLMs from '../configs/available_llm_models.json';
import TextAreaHeight from '../utils/textarea_css_data';
import initiateAsk from '../services/ask_service';
import ClickSpark from './click_spark';
import ShinyText from './shiny_text';

const InputBox: React.FC = () => {

    const { setChatInitiated, currUser, authToken, setChatHistory } = useGlobal();
    const [inputVal, setInputVal] = useState<string | undefined>(undefined);
    const [asked, setAsked] = useState<boolean>(false);
    const [attachCount, setAttachCount] = useState<number>(0);
    const [llmID, setllmID] = useState<string>("1");
    const textareaEle = document.querySelector('textarea') as HTMLTextAreaElement | undefined;
    const [llms, setLlms] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const txtHeightStyle = new TextAreaHeight();
    const { textareaHeight, textareaMaxHeight } = txtHeightStyle.getHeightValues();
    const clientOption = useRef<HTMLSelectElement>(null);
    const modelOption = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const handleAsk = async () => {
            if (asked) {
                setChatInitiated(true);
                setAsked(false);
                setInputVal(undefined);
                const curr_client = clientOption.current ? clientOption.current.value : undefined;
                const curr_model = modelOption.current ? modelOption.current?.value : undefined;
                const currentTextarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
                let curr_prompt_value = undefined;
                if (currentTextarea) {
                    curr_prompt_value = currentTextarea.value;
                    currentTextarea.value = "";
                    currentTextarea.style.height = textareaHeight;
                };
                if (curr_prompt_value && curr_client && curr_model) {
                    // alert('sending request');
                    getAnswer(curr_prompt_value, curr_client, curr_model);
                } else {
                    // display error
                }
            }
        };

        handleAsk();
    }, [asked]);

    useEffect(() => {
        const allLLMs: string[] = LLMs.ALL.map(e => e.name);
        setLlms(allLLMs);
        fetchModels();
    }, [llmID]);

    const getAnswer = async (curr_prompt: string, curr_client: string, curr_model: string, curr_top_k = 3, curr_use_rag = false) => {
        // alert(`curr user: ${currUser}`);
        // alert(`curr prompt: ${curr_prompt}`);
        if (!currUser) return;
        
        // Generate a unique key for this chat exchange
        const chatKey = Date.now().toString();
        const userTime = new Date().toLocaleTimeString();
        
        // Store user message immediately with LLM model information
        setChatHistory(prev => ({
            ...prev,
            [chatKey]: {
                userMessage: curr_prompt,
                userTime: userTime,
                botMessage: '',
                botTime: '',
                llmModel: curr_client
            }
        }));

        const response = await initiateAsk({
            username: currUser,
            prompt: curr_prompt,
            client: curr_client.toLowerCase(),
            model: curr_model.toLowerCase(),
            top_k: curr_top_k,
            use_rag: curr_use_rag,
            token: authToken ? authToken : 'null'
        });

        const botTime = new Date().toLocaleTimeString();

        if (response && response.status) {
            setChatHistory(prev => ({
                ...prev,
                [chatKey]: {
                    ...prev[chatKey],
                    botMessage: response.resp.response,
                    botTime: botTime
                }
            }));
        } else if (response && response.statusCode < 500) {
            setChatHistory(prev => ({
                ...prev,
                [chatKey]: {
                    ...prev[chatKey],
                    botMessage: `Error ${response.statusCode}: ${response.resp}`,
                    botTime: botTime
                }
            }));
        } else {
            setChatHistory(prev => ({
                ...prev,
                [chatKey]: {
                    ...prev[chatKey],
                    botMessage: `Server Error ${response?.statusCode}: ${response?.resp || 'Unknown error'}`,
                    botTime: botTime
                }
            }));
        }
    }


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
                    <textarea name="inputArea" id="inputArea" placeholder='query here...' onInput={getInput} className='montserrat-msg'></textarea>
                </div>
            </div>
            <div id="toolBox">
                <div id="leftCompartment">
                    <div id="llmDropContainer" className='dropContainer'>
                        <select name="llmDrop" id="llmDrop" onChange={changeModel} className='pointer quicksand-light' ref={clientOption}>
                            {llms.map((e, i) => (
                                <option id={(i + 1).toString()} value={e} className='quicksand-msg'>{e}</option>
                            ))}
                        </select>
                    </div>
                    <div id="modelDropContainer" className='dropContainer'>
                        <select name="modelDrop" id="modelDrop" className='pointer quicksand-light' ref={modelOption}>
                            {models.map((e, i) => (
                                <option key={i} value={e} className='quicksand-msg'>{e}</option>
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
                        <ClickSpark sparkColor='#000' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                            <button className='button send-button pointer quicksand-light' onClick={triggerSend}>
                                <span className='button-text'><ShinyText text="Ask" disabled={false} speed={3} className='custom-class'/></span>
                                <span className='button-img'><img src={send} alt="Send Transfer" id="fileTransferGif" /></span>
                                </button>
                        </ClickSpark>

                    </div>
                </div>
            </div>
        </>
    )
}

export default InputBox;