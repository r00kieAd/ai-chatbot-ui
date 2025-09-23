import React, { useEffect, useState } from 'react';
import { useGlobal } from '../utils/global_context';
import send from '../assets/send.png';
import attach from '../assets/document.png';
import LLMs from '../configs/available_llm_models.json';
import PROMPTS from '../configs/bot_prompts.json'
import TextAreaHeight from '../utils/textarea_css_data';
import initiateAsk from '../services/ask_service';
import ClickSpark from './click_spark';
import ShinyText from './shiny_text';
import uploadFile from '../services/file_service';
import clearAttachments from '../services/clear_attachments';
import Dropdown from './Dropdown';

const InputBox: React.FC = () => {

    const { setChatInitiated, currUser, authToken, setChatHistory, guestLogin, guestPromptCount, setGuestPromptCount, personality } = useGlobal();
    const [inputVal, setInputVal] = useState<string | undefined>(undefined);
    const [asked, setAsked] = useState<boolean>(false);
    const [useRag, setUseRag] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [enableAskButton, setEnableAskButton] = useState(true);
    const [attachCount, setAttachCount] = useState<number>(0);
    const [llmID, setllmID] = useState<string>("1");
    const [llms, setLlms] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [selectedLLM, setSelectedLLM] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const txtHeightStyle = new TextAreaHeight();
    const { textareaHeight, textareaMaxHeight } = txtHeightStyle.getHeightValues();

    useEffect(() => {
        const handleAsk = async () => {
            if (asked) {
                setChatInitiated(true);
                setAsked(false);
                setInputVal(undefined);
                const curr_client = selectedLLM;
                const curr_model = selectedModel;
                const currentTextarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
                let curr_prompt_value = undefined;
                if (currentTextarea) {
                    curr_prompt_value = currentTextarea.value;
                    currentTextarea.value = "";
                    currentTextarea.style.height = textareaHeight;
                };
                if (curr_prompt_value && curr_client && curr_model) {
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

    useEffect(() => {
        const allLLMs: string[] = LLMs.ALL.map(e => e.name);
        if (allLLMs.length > 0 && !selectedLLM) {
            setSelectedLLM(allLLMs[0]);
            setllmID("1");
        }
    }, [selectedLLM]);

    useEffect(() => {
        if (models.length > 0) {
            setSelectedModel(models[0]);
        }
    }, [models]);

    const getAnswer = async (curr_prompt: string, curr_client: string, curr_model: string, curr_top_k = 3, curr_use_rag = useRag) => {
        // alert(`curr user: ${currUser}`);
        // alert(`curr prompt: ${curr_prompt}`);
        if (!currUser) return;
        setEnableAskButton(false);
        const chatKey = Date.now().toString();
        const userTime = new Date().toLocaleTimeString();

        setChatHistory(prev => ({
            ...prev,
            [chatKey]: {
                userMessage: curr_prompt,
                userTime: userTime,
                botMessage: '',
                botTime: '',
                llmModel: curr_client,
                personality: personality
            }
        }));

        const initiatedBotTime = new Date().toLocaleTimeString();
        if (guestPromptCount >= 2 && guestLogin) {
            setChatHistory(prev => ({
                ...prev,
                [chatKey]: {
                    ...prev[chatKey],
                    botMessage: `Your guest prompt count has reached it's limit of ${guestPromptCount}`,
                    botTime: initiatedBotTime
                }
            }));
        } else {
            setGuestPromptCount(guestPromptCount + 1)
            let promptPrefix = "Owl";
            switch (personality) {
                case PROMPTS.PERSONALITY[0].NAME:
                    promptPrefix = PROMPTS.PERSONALITY[0].VALUE ? PROMPTS.PERSONALITY[0].VALUE : "Owl"
                    break;
                case PROMPTS.PERSONALITY[1].NAME:
                    promptPrefix = PROMPTS.PERSONALITY[1].VALUE ? PROMPTS.PERSONALITY[1].VALUE : "Owl"
                    break;
                case PROMPTS.PERSONALITY[2].NAME:
                    promptPrefix = PROMPTS.PERSONALITY[2].VALUE ? PROMPTS.PERSONALITY[2].VALUE : "Owl"
                    break;
                case PROMPTS.PERSONALITY[3].NAME:
                    promptPrefix = PROMPTS.PERSONALITY[3].VALUE ? PROMPTS.PERSONALITY[3].VALUE : "Owl"
                    break;
                default:
                    promptPrefix = "Owl"

            }
            const response = await initiateAsk({
                username: currUser,
                prompt: `${promptPrefix} ${curr_prompt}`,
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
        setEnableAskButton(true);
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

    const handleLLMChange = (value: string, index: number) => {
        setSelectedLLM(value);
        setllmID((index + 1).toString());
        setSelectedModel("");
    };

    const handleModelChange = (value: string) => {
        setSelectedModel(value);
    };

    const triggerSend = () => {
        if (!inputVal) {
            return;
        };
        setAsked(true);
    }

    const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploading(true);
        const file = e.target.files?.[0];
        if (!file) return;
        if (!currUser || !authToken) {
            return;
        }

        const resp = await uploadFile({ token: authToken, username: currUser, blob: file });
        if (resp && resp.status) {
            setUseRag(true);
            setAttachCount(prev => prev + 1);
        } else {
            console.warn('Upload failed:', resp?.statusCode, resp?.resp);
        }
        setTimeout(() => {
            setUploading(false);
        }, 500);
        e.target.value = '';
    };

    const clearFiles = async () => {
        if (!currUser || !authToken) {
            return;
        }
        const resp = await clearAttachments({ username: currUser, token: authToken });
        if (resp && resp.status) {
            setUseRag(false);
            setAttachCount(0);
        } else {
            console.warn('Delete failed:', resp?.statusCode, resp?.resp);
        }
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
                        <Dropdown
                            options={llms}
                            value={selectedLLM}
                            onChange={handleLLMChange}
                            placeholder="Select LLM"
                            className="llm-dropdown"
                        />
                    </div>
                    <div id="modelDropContainer" className='dropContainer'>
                        <Dropdown
                            options={models}
                            value={selectedModel}
                            onChange={handleModelChange}
                            placeholder="Select Model"
                            className="model-dropdown"
                        />
                    </div>
                </div>
                <div id="rightCompartment">
                    <div id="fileContainer">
                        <label htmlFor="attachment" className='pointer'><span className={'attach-img' + (uploading ? ' bounceAnimation' : '')}><img src={attach} alt="File Attach" id="fileTransferGif" /></span></label>
                        <span className='attach-attr attach-count poppins-regular' >&nbsp;{attachCount > 0 ? attachCount : ''}</span>
                        <span className='attach-attr clear-link poppins-regular' >&nbsp;{attachCount > 0 ? (<><a onClick={clearFiles}>X</a></>) : ''}</span>
                        <input type="file" name="attachment" id="attachment" onChange={onFileSelected} />
                    </div>
                    <div id="sendContainer">
                        <ClickSpark sparkColor='#000' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                            <button className='button send-button pointer quicksand-light' onClick={triggerSend} disabled={!enableAskButton}>
                                <span className='button-text'><ShinyText text="Ask" disabled={false} speed={3} className='custom-class' /></span>
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