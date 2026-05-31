import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
// import attach from '../assets/paper-clip.png';
// import LLMs from '../configs/available_llm_models.json';
import INSTRUCTIONS from '../configs/bot_prompts.json'
import TextAreaHeight from '../utils/textarea_css_data';
import initiateChatReset from '../services/reset_chat';
import setLLMChoice from '../services/llm_choice';
import ClickSpark from './click_spark';
import ShinyText from './shiny_text';
import uploadFile from '../services/file_service';
import clearAttachments from '../services/clear_attachments';
import Dropdown from './dropdown_d';
import generateImage from '../services/image_service';
import type { GeneratedImage } from '../services/image_service';
import { parseImageToolCall } from '../utils/parse_image_tool_call';
import { startLLMStream } from '../services/llm_stream_service';
import type { LLMStreamSubscription } from '../services/llm_stream_types';
const LordIcon = 'lord-icon' as any;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const InputBox: React.FC = () => {

    const { setChatInitiated, currUser, authToken, chatHistory, setChatHistory, guestLogin, guestPromptCount, setGuestPromptCount, personality, availableModels, chatEmpty, webSearch, setNotification } = useGlobal();
    const { setTemperature, setTop_p, setTop_k, setMaxOutputToken, setFrequencyPenalty, setPresencePenalty, setUpdatingLLMConfig, setTypingComplete, setChatEmpty, setWebSearch } = useGlobal();
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
    const [showModels, setShowModels] = useState<boolean>(false);
    const [streamActive, setStreamActive] = useState(false);
    const [activeChatKey, setActiveChatKey] = useState<string | undefined>(undefined);
    const stopRequestedRef = useRef(false);
    const streamSubscriptionRef = useRef<LLMStreamSubscription | null>(null);
    const streamFinishRef = useRef<((success: boolean) => void) | null>(null);
    const webSearchRef = useRef(webSearch);
    const txtHeightStyle = new TextAreaHeight();
    const { textareaHeight, textareaMaxHeight } = txtHeightStyle.getHeightValues();
    const attachmentIconSrc = 'https://cdn.lordicon.com/kydcudfv.json';
    const attachmentIconTrigger = uploading ? 'loop' : 'loop-on-hover';
    const [erasing, setErasing] = useState<string>("");

    useEffect(() => {
        const handleAsk = async () => {
            if (asked) {
                setChatInitiated(true);
                setAsked(false);
                setInputVal(undefined);
                const curr_client = selectedLLM ? selectedLLM : "Auto";
                const curr_model = selectedModel ? selectedModel : "Auto";
                const currentTextarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
                let curr_prompt_value = undefined;
                if (currentTextarea) {
                    curr_prompt_value = currentTextarea.value;
                    currentTextarea.value = "";
                    currentTextarea.style.height = textareaHeight;
                };
                const curr_use_web = webSearchRef.current;
                if (curr_prompt_value && curr_client && curr_model) {
                    getAnswer(curr_prompt_value, curr_client, curr_model, false, useRag, curr_use_web);
                    setChatEmpty(false);
                } else {
                    getAnswer(curr_prompt_value ? curr_prompt_value : "unparsable text", "Unknown", "Unknown", true, useRag, curr_use_web);
                    setChatEmpty(false);
                }
            }
        };

        handleAsk();
    }, [asked]);

    useEffect(() => {
        webSearchRef.current = webSearch;
    }, [webSearch]);

    useEffect(() => {
        return () => {
            streamFinishRef.current?.(false);
            streamFinishRef.current = null;
            streamSubscriptionRef.current?.cleanup();
            streamSubscriptionRef.current = null;
        };
    }, []);

    useEffect(() => {
        const allLLMs = availableModels?.ALL?.map(e => e.name) ?? [];
        // console.log(allLLMs);
        setLlms(allLLMs);
        fetchModels();
    }, [llmID, availableModels]);

    useEffect(() => {
        const allLLMs = availableModels?.ALL?.map(e => e.name) ?? [];
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

    const normalizeImagesFromUnknown = (data: unknown): GeneratedImage[] => {
        if (!data) return [];

        if (typeof data === 'string') {
            const url = data.trim();
            return url ? [{ url }] : [];
        }

        if (Array.isArray(data)) {
            return data
                .map(item => normalizeImagesFromUnknown(item))
                .flat()
                .filter(img => typeof img.url === 'string' && img.url.trim().length > 0);
        }

        if (!isRecord(data)) return [];

        if (typeof data.url === 'string' && data.url.trim()) return [{ url: data.url.trim() }];

        if (Array.isArray(data.urls)) {
            return (data.urls as unknown[])
                .filter(v => typeof v === 'string')
                .map(v => ({ url: (v as string).trim() }))
                .filter(img => img.url);
        }

        if (Array.isArray(data.images)) {
            return normalizeImagesFromUnknown(data.images);
        }

        if (Array.isArray(data.data)) {
            return normalizeImagesFromUnknown(data.data);
        }

        if (typeof data.b64_json === 'string' && data.b64_json.trim()) {
            return [{ url: `data:image/png;base64,${data.b64_json.trim()}` }];
        }

        return [];
    };

    const maybeGenerateImageFromToolCall = async (chatKey: string, message: string, botTime: string) => {
        if (!currUser) return;
        if ((chatHistory?.[chatKey]?.botImages?.length ?? 0) > 0) return;
        const parsed = parseImageToolCall(message);
        if (!parsed) return;

        setChatHistory(prev => ({
            ...prev,
            [chatKey]: {
                ...prev[chatKey],
                botMessage: 'Generating image...',
                botImages: [],
                botTime,
                isStreaming: false
            }
        }));

        const resp = await generateImage({
            username: currUser,
            token: authToken ? authToken : 'null',
            instruction: 'Generate the requested image and return image URLs (or base64) in JSON.',
            model: (selectedModel || 'auto').toLowerCase(),
            use_rag: false,
            action: parsed.action,
            prompt: parsed.prompt,
            action_input: parsed.params,
            tool_call_raw: message
        });

        if (resp.status && resp.images && resp.images.length > 0) {
            setChatHistory(prev => ({
                ...prev,
                [chatKey]: {
                    ...prev[chatKey],
                    botMessage: `*Prompt:* ${parsed.prompt}`,
                    botImages: resp.images,
                    botTime,
                    isStreaming: false
                }
            }));
            return;
        }

        setChatHistory(prev => ({
            ...prev,
            [chatKey]: {
                ...prev[chatKey],
                botMessage: resp.status
                    ? 'Image generation completed, but no images were returned.'
                    : `Image generation failed: ${resp.resp || resp.statusCode || 'Unknown error'}`,
                botImages: [],
                botTime,
                isStreaming: false
            }
        }));
    };

    const resetChat = async () => {
        try {
            setErasing("fa-beat-fade");
            const response = await initiateChatReset({
                username: currUser ? currUser : "NA"
            });
            setErasing("");
            const initiatedBotTime = new Date().toLocaleTimeString();
            if (response && response.status) {
                setChatHistory({});
                setChatEmpty(true);
            } else {
                const chatKey = Date.now().toString();
                const userTime = new Date().toLocaleTimeString();
                setChatHistory(prev => ({
                    ...prev,
                    [chatKey]: {
                        userMessage: "Clear memory",
                        userTime: userTime,
                        botMessage: '',
                        botImages: [],
                        botTime: '',
                        llmprovider: 'chatbot',
                        llmModel: 'chatbot',
                        personality: personality,
                        isStreaming: true,
                        streamId: undefined
                    }
                }));
                setChatHistory(prev => ({
                    ...prev,
                    [chatKey]: {
                        ...prev[chatKey],
                        botMessage: `Error clearing memory: ${response.resp}`,
                        botTime: initiatedBotTime,
                        llmprovider: 'chatbot',
                        isStreaming: false,
                        streamId: undefined
                    }
                }));
            }
        } catch {
            setErasing("");
            const chatKey = Date.now().toString();
            const initiatedBotTime = new Date().toLocaleTimeString();
            setChatHistory(prev => ({
                ...prev,
                [chatKey]: {
                    ...prev[chatKey],
                    botMessage: `Unknown error clearing memory.`,
                    botTime: initiatedBotTime,
                    llmprovider: 'chatbot',
                    isStreaming: false,
                    streamId: undefined
                }
            }));
        }

    }

    const getAnswer = async (curr_prompt: string, curr_client: string, curr_model: string, dispErrMsg = false, curr_use_rag = useRag, curr_use_web = webSearch) => {
        if (!currUser) return;
        stopRequestedRef.current = false;
        setEnableAskButton(false);
        setTypingComplete(false);
        const chatKey = Date.now().toString();
        setActiveChatKey(chatKey);
        const userTime = new Date().toLocaleTimeString();

        setChatHistory(prev => ({
            ...prev,
            [chatKey]: {
                userMessage: curr_prompt,
                userTime: userTime,
                botMessage: '',
                botImages: [],
                botTime: '',
                llmprovider: curr_client || 'Unknown',
                llmModel: curr_model || 'Unknown',
                personality: personality,
                isStreaming: true,
                isStopped: false,
                streamId: undefined
            }
        }));

        try {
            const initiatedBotTime = new Date().toLocaleTimeString();
            if (guestPromptCount >= 3 && guestLogin) {
                setChatHistory(prev => ({
                    ...prev,
                    [chatKey]: {
                        ...prev[chatKey],
                        botMessage: `Your guest prompt count has reached it's limit of ${guestPromptCount}`,
                        botTime: initiatedBotTime,
                        llmprovider: prev[chatKey]?.llmprovider || 'Unknown',
                        isStreaming: false,
                        streamId: undefined
                    }
                }));
            } else if (dispErrMsg) {
                setChatHistory(prev => ({
                    ...prev,
                    [chatKey]: {
                        ...prev[chatKey],
                        botMessage: "Unknown error occured",
                        botTime: initiatedBotTime,
                        llmprovider: prev[chatKey]?.llmprovider || 'Unknown',
                        isStreaming: false,
                        streamId: undefined
                    }
                }));
            } else {
                setGuestPromptCount(guestPromptCount + 1)
                let personality_instruction = "";
                switch (personality) {
                    case INSTRUCTIONS.PERSONALITY[0].NAME:
                        personality_instruction = INSTRUCTIONS.PERSONALITY[0].VALUE ? INSTRUCTIONS.PERSONALITY[0].VALUE : "Answer factually"
                        break;
                    case INSTRUCTIONS.PERSONALITY[1].NAME:
                        personality_instruction = INSTRUCTIONS.PERSONALITY[1].VALUE ? INSTRUCTIONS.PERSONALITY[1].VALUE : "Answer factually"
                        break;
                    case INSTRUCTIONS.PERSONALITY[2].NAME:
                        personality_instruction = INSTRUCTIONS.PERSONALITY[2].VALUE ? INSTRUCTIONS.PERSONALITY[2].VALUE : "Answer factually"
                        break;
                    case INSTRUCTIONS.PERSONALITY[3].NAME:
                        personality_instruction = INSTRUCTIONS.PERSONALITY[3].VALUE ? INSTRUCTIONS.PERSONALITY[3].VALUE : "Answer factually"
                        break;
                    default:
                        personality_instruction = "Answer factually"

                }
                setStreamActive(true);

                let accumulated = '';
                let terminalMessage = '';
                let terminalBotTime = new Date().toLocaleTimeString();
                let terminalStopped = false;
                let lastSequence = -1;
                const seenEventIds = new Set<string>();

                const isDuplicateEvent = (eventId?: string, sequence?: number) => {
                    if (eventId) {
                        if (seenEventIds.has(eventId)) return true;
                        seenEventIds.add(eventId);
                    }
                    if (typeof sequence === 'number') {
                        if (sequence <= lastSequence) return true;
                        lastSequence = sequence;
                    }
                    return false;
                };

                const pushMessageChunk = (text: string) => {
                    if (!text) return;
                    accumulated += text;
                    setChatHistory(prev => {
                        const existing = prev[chatKey];
                        if (!existing) return prev;
                        return {
                            ...prev,
                            [chatKey]: {
                                ...existing,
                                botMessage: accumulated,
                                isStreaming: !stopRequestedRef.current,
                                isStopped: existing.isStopped
                            }
                        };
                    });
                };

                const streamCompleted = await new Promise<boolean>(resolve => {
                    let resolved = false;
                    const finish = (success: boolean) => {
                        if (resolved) return;
                        resolved = true;
                        streamFinishRef.current = null;
                        terminalBotTime = new Date().toLocaleTimeString();
                        resolve(success);
                    };
                    streamFinishRef.current = finish;

                    streamSubscriptionRef.current = startLLMStream({
                        username: currUser,
                        prompt: curr_prompt,
                        instruction: personality_instruction,
                        model: curr_model.toLowerCase(),
                        use_rag: curr_use_rag,
                        use_web: curr_use_web,
                        token: authToken ? authToken : 'null',
                        handlers: {
                            onConnectionState: state => {
                                if (state === 'reconnecting') {
                                    setNotification({
                                        message: 'Connection dropped. Reconnecting to the response stream...',
                                        type: 'info'
                                    });
                                } else if (state === 'error') {
                                    setNotification({
                                        message: 'Response stream connection issue. Retrying automatically...',
                                        type: 'error'
                                    });
                                }
                            },
                            onReconnect: attempt => {
                                setNotification({
                                    message: `Reconnecting to the response stream. Attempt ${attempt}.`,
                                    type: 'info'
                                });
                                if (import.meta.env.DEV) {
                                    console.debug(`LLM stream reconnect attempt ${attempt}`);
                                }
                            },
                            onStart: event => {
                                if (event.stream_id) {
                                    setChatHistory(prev => ({
                                        ...prev,
                                        [chatKey]: {
                                            ...prev[chatKey],
                                            streamId: event.stream_id,
                                            llmprovider: event.provider || prev[chatKey]?.llmprovider || curr_client || 'Unknown',
                                            llmModel: event.model_used || prev[chatKey]?.llmModel || curr_model || 'Unknown'
                                        }
                                    }));
                                }
                            },
                            onToken: event => {
                                if (stopRequestedRef.current || isDuplicateEvent(event.event_id, event.sequence)) return;
                                pushMessageChunk(event.token ?? event.delta ?? event.text ?? '');
                            },
                            onToolCall: event => {
                                if (import.meta.env.DEV) {
                                    console.debug('LLM tool call', event.name, event.arguments ?? event.raw);
                                }
                            },
                            onToolResult: event => {
                                if (import.meta.env.DEV) {
                                    console.debug('LLM tool result', event.name, event.result ?? event.raw);
                                }
                            },
                            onProgress: event => {
                                if (!accumulated && event.message) {
                                    setChatHistory(prev => ({
                                        ...prev,
                                        [chatKey]: {
                                            ...prev[chatKey],
                                            botMessage: event.message ?? '',
                                            isStreaming: true
                                        }
                                    }));
                                }
                            },
                            onMetadata: event => {
                                setChatHistory(prev => ({
                                    ...prev,
                                    [chatKey]: {
                                        ...prev[chatKey],
                                        llmprovider: event.provider || prev[chatKey]?.llmprovider || curr_client || 'Unknown',
                                        llmModel: event.model_used || prev[chatKey]?.llmModel || curr_model || 'Unknown'
                                    }
                                }));
                            },
                            onImages: event => {
                                const images = normalizeImagesFromUnknown(event);
                                if (images.length === 0) return;
                                setChatHistory(prev => ({
                                    ...prev,
                                    [chatKey]: {
                                        ...prev[chatKey],
                                        botImages: [...(prev[chatKey]?.botImages ?? []), ...images]
                                    }
                                }));
                            },
                            onError: event => {
                                terminalMessage = event.message || 'Streaming failed';
                                setNotification({ 
                                    message: `Error: ${terminalMessage}`, 
                                    type: 'error' 
                                });
                                setChatHistory(prev => ({
                                    ...prev,
                                    [chatKey]: {
                                        ...prev[chatKey],
                                        botMessage: accumulated || `Error: ${terminalMessage}`,
                                        botTime: new Date().toLocaleTimeString(),
                                        isStreaming: false
                                    }
                                }));
                                finish(false);
                            },
                            onEnd: event => {
                                if (event.response && event.response !== accumulated) {
                                    accumulated = event.response;
                                }
                                const images = normalizeImagesFromUnknown(event.images);
                                setChatHistory(prev => ({
                                    ...prev,
                                    [chatKey]: {
                                        ...prev[chatKey],
                                        botMessage: accumulated,
                                        botImages: images.length > 0 ? images : (prev[chatKey]?.botImages ?? []),
                                        botTime: new Date().toLocaleTimeString(),
                                        llmprovider: event.provider || prev[chatKey]?.llmprovider || curr_client || 'Unknown',
                                        llmModel: event.model_used || prev[chatKey]?.llmModel || curr_model || 'Unknown',
                                        isStreaming: false,
                                        isStopped: false
                                    }
                                }));
                                finish(true);
                            },
                            onCancelled: event => {
                                terminalStopped = true;
                                terminalMessage = event.reason || '';
                                setChatHistory(prev => ({
                                    ...prev,
                                    [chatKey]: {
                                        ...prev[chatKey],
                                        botMessage: accumulated || prev[chatKey]?.botMessage || '',
                                        botTime: new Date().toLocaleTimeString(),
                                        isStreaming: false,
                                        isStopped: true
                                    }
                                }));
                                finish(false);
                            }
                        }
                    });
                });

                streamSubscriptionRef.current?.cleanup();
                streamSubscriptionRef.current = null;
                streamFinishRef.current = null;

                setChatHistory(prev => {
                    const existing = prev[chatKey];
                    if (!existing) return prev;
                    return {
                        ...prev,
                        [chatKey]: {
                            ...existing,
                            botMessage: accumulated || existing.botMessage || (terminalMessage ? `Error: ${terminalMessage}` : ''),
                            botTime: existing.botTime || terminalBotTime,
                            isStreaming: false,
                            isStopped: terminalStopped || Boolean(existing.isStopped) || stopRequestedRef.current
                        }
                    };
                });

                if (streamCompleted) {
                    await maybeGenerateImageFromToolCall(chatKey, accumulated, terminalBotTime);
                }
            }
        } finally {
            setEnableAskButton(true);
            setTypingComplete(true);
            setStreamActive(false);
            stopRequestedRef.current = false;
            setActiveChatKey(undefined);
            streamFinishRef.current = null;
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
        if (!availableModels || Object.keys(availableModels).length === 0) {
            setModels([]);
            return;
        }

        let allModels: string[] = [];
        switch (llmID) {
            case "1":
                allModels = availableModels.A?.LIST?.map(e => e.model) ?? [];
                break;
            case "2":
                allModels = availableModels.M1?.LIST?.map(e => e.model) ?? [];
                break;
            case "3":
                allModels = availableModels.M2?.LIST?.map(e => e.model) ?? [];
                break;
            case "4":
                allModels = availableModels.M3?.LIST?.map(e => e.model) ?? [];
                break;
            default:
                allModels = [];
                break;
        }
        setShowModels(allModels.length !== 0);
        setModels(allModels);
    }

    const handleLLMChange = async (value: string, index: number) => {
        setSelectedLLM(value);
        setUpdatingLLMConfig(true);
        const res = await setLLMChoice({ username: currUser ? currUser : "dummy", llm: value, token: authToken ? authToken : "" });
        if (res && res.status) {
            setTemperature(res.resp.config.temp);
            setTop_p(res.resp.config.top_p);
            setTop_k(res.resp.config.top_k);
            setMaxOutputToken(res.resp.config.output_tokens);
            setFrequencyPenalty(res.resp.config.freq_penalty);
            setPresencePenalty(res.resp.config.presence_penalty);
        } else {
            setTemperature(import.meta.env.VITE_DEFAULT_TEMP);
            setTop_p(import.meta.env.VITE_DEFAULT_TEMP);
            setTop_k(import.meta.env.VITE_DEFAULT_TEMP);
            setMaxOutputToken(import.meta.env.VITE_DEFAULT_TEMP);
            setFrequencyPenalty(import.meta.env.VITE_DEFAULT_TEMP);
            setPresencePenalty(import.meta.env.VITE_DEFAULT_TEMP);
        }
        setUpdatingLLMConfig(false);
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

    const handleStopClick = async () => {
        stopRequestedRef.current = true;
        streamSubscriptionRef.current?.cancel();
        streamFinishRef.current?.(false);
        if (activeChatKey) {
            const stoppedAt = new Date().toLocaleTimeString();
            setChatHistory(prev => {
                const existing = prev[activeChatKey];
                if (!existing) return prev;
                return {
                    ...prev,
                    [activeChatKey]: {
                        ...existing,
                        botTime: existing.botTime || stoppedAt,
                        isStreaming: false,
                        isStopped: true
                    }
                };
            });
        }
        streamSubscriptionRef.current?.cleanup();
        streamSubscriptionRef.current = null;
        streamFinishRef.current = null;
        setStreamActive(false);
        setActiveChatKey(undefined);
    };

    const handleButtonClick = () => {
        if (streamActive) {
            void handleStopClick();
        } else {
            triggerSend();
        }
    };

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

    const activateWebSearch = () => {
        setWebSearch(prev => {
            const next = !prev;
            webSearchRef.current = next;
            return next;
        });
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
                    <div id="modelDropContainer" className={showModels ? 'dropContainer show' : 'dropContainer'}>
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
                    <div id="resetChat" className={!chatEmpty ? "show" : ""}>
                        <button onClick={resetChat}><i className={"fa-solid fa-eraser " + erasing}></i></button>
                        <span className='reset_text poppins-regular'>clear&nbsp;</span>
                    </div>
                    <div id="webSearch" className={webSearch ? "active" : ""} onClick={activateWebSearch}>
                        <span className="web_search_flag"><i className="fa-solid fa-globe"></i></span>
                    </div>
                    <div id="fileContainer">
                        <label htmlFor="attachment" className='pointer'><span className={'attach-img' + (uploading ? ' bounceAnimation' : '')}>
                            <LordIcon
                                key={attachmentIconTrigger}
                                src={attachmentIconSrc}
                                trigger={attachmentIconTrigger}
                                target={uploading ? undefined : '#fileContainer'}
                                colors="primary:#F0F0D7"
                                delay="1000"
                                style={{ width: '21px', height: '21px' }}
                            />
                        </span></label>
                        <span className='attach-attr attach-count poppins-regular' >&nbsp;{attachCount > 0 ? attachCount : ''}</span>
                        <span className='attach-attr clear-link poppins-regular' >&nbsp;{attachCount > 0 ? (<><a onClick={clearFiles}>X</a></>) : ''}</span>
                        <input type="file" name="attachment" id="attachment" onChange={onFileSelected} />
                    </div>
                    <div id="sendContainer">
                        <ClickSpark sparkColor='#fff' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
                            {(() => {
                                const isButtonDisabled = !enableAskButton && !streamActive;
                                return (
                                    <button className='button send-button pointer quicksand-light' onClick={handleButtonClick} disabled={isButtonDisabled}>
                                        {streamActive ? (
                                            <>
                                                <span className='button-text'><ShinyText text="Stop" disabled={true} speed={3} className='custom-class' /></span>
                                                &nbsp;<i className="fa-solid fa-circle-stop"></i>
                                            </>
                                        ) : (
                                            <>
                                                <span className='button-text'><ShinyText text="ask" disabled={false} speed={3} className='custom-class' /></span>
                                                <i className="fa-solid fa-wave-square"></i>
                                            </>
                                        )}
                                    </button>
                                );
                            })()}
                        </ClickSpark>

                    </div>
                </div>
            </div>
        </>
    )
}

export default InputBox;
