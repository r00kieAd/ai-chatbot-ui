import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../utils/global_context';
// import attach from '../assets/paper-clip.png';
// import LLMs from '../configs/available_llm_models.json';
import INSTRUCTIONS from '../configs/bot_prompts.json'
import TextAreaHeight from '../utils/textarea_css_data';
import initiateAsk from '../services/ask_service';
import initiateChatReset from '../services/reset_chat';
import type { AskResponsePayload, AskSuccessPayload } from '../services/ask_service';
import stopStream from '../services/stop_service';
import setLLMChoice from '../services/llm_choice';
import ClickSpark from './click_spark';
import ShinyText from './shiny_text';
import uploadFile from '../services/file_service';
import clearAttachments from '../services/clear_attachments';
import Dropdown from './dropdown_d';
import generateImage from '../services/image_service';
import type { GeneratedImage } from '../services/image_service';
import { parseImageToolCall } from '../utils/parse_image_tool_call';
const LordIcon = 'lord-icon' as any;

const isAskSuccessPayload = (value: AskResponsePayload | undefined): value is AskSuccessPayload => typeof value === 'object' && value !== null;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const InputBox: React.FC = () => {

    const { setChatInitiated, currUser, authToken, chatHistory, setChatHistory, guestLogin, guestPromptCount, setGuestPromptCount, personality, availableModels, chatEmpty } = useGlobal();
    const { setTemperature, setTop_p, setTop_k, setMaxOutputToken, setFrequencyPenalty, setPresencePenalty, setUpdatingLLMConfig, setTypingComplete, setChatEmpty } = useGlobal();
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
    const [activeStreamId, setActiveStreamId] = useState<string | undefined>(undefined);
    const stopRequestedRef = useRef(false);
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
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
                if (curr_prompt_value && curr_client && curr_model) {
                    getAnswer(curr_prompt_value, curr_client, curr_model);
                    setChatEmpty(false);
                } else {
                    getAnswer(curr_prompt_value ? curr_prompt_value : "unparsable text", "Unknown", "Unknown", true);
                    setChatEmpty(false);
                }
            }
        };

        handleAsk();
    }, [asked]);

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
            const response = await initiateChatReset({
                username: currUser ? currUser : "NA"
            });
            setErasing("");
            const initiatedBotTime = new Date().toLocaleTimeString();
            if (response && response.status) {
                setChatHistory({});
                setChatEmpty(true);
            } else {
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
        } catch (error) {
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

    const getAnswer = async (curr_prompt: string, curr_client: string, curr_model: string, dispErrMsg = false, curr_use_rag = useRag) => {
        if (!currUser) return;
        stopRequestedRef.current = false;
        setEnableAskButton(false);
        setTypingComplete(false);
        const chatKey = Date.now().toString();
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
                setActiveStreamId(undefined);
                const response = await initiateAsk({
                    username: currUser,
                    prompt: curr_prompt,
                    instruction: personality_instruction,
                    model: curr_model.toLowerCase(),
                    use_rag: curr_use_rag,
                    token: authToken ? authToken : 'null'
                });

                const botTime = new Date().toLocaleTimeString();

                if (response && response.status) {
                    const reader = response.reader;
                    if (reader) {
                        readerRef.current = reader;
                        const decoder = new TextDecoder();
                        let accumulated = '';
                        let eventBuffer = '';
                        let chunkCount = 0;
                        const streamLog = (label: string, detail = '') => {
                            if (!import.meta.env.DEV) return;
                            const stamp = new Date().toISOString();
                            console.debug(`[sse ${stamp}] ${label}${detail ? ` ${detail}` : ''}`);
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
                                        isStreaming: true
                                    }
                                };
                            });
                            streamLog('append', `chunkLen=${text.length} totalLen=${accumulated.length}`);
                        };

                        const processBlock = (block: string) => {
                            if (!block.trim()) return;
                            const lines = block.split(/\r?\n/);
                            let currentEvent = 'message';
                            const dataLines: string[] = [];
                            for (const rawLine of lines) {
                                if (!rawLine) continue;
                                if (rawLine.startsWith('event:')) {
                                    currentEvent = rawLine.slice(6).trim();
                                    continue;
                                }
                                if (rawLine.startsWith('data:')) {
                                    let payload = rawLine.slice(5);
                                    if (payload.startsWith(' ') && payload.length > 1) {
                                        payload = payload.slice(1);
                                    }
                                    dataLines.push(payload);
                                }
                            }

                            const combinedData = dataLines.join('\n');
                            streamLog('event', `${currentEvent} dataLen=${combinedData.length}`);
                            if (currentEvent === 'stream_id') {
                                const streamId = combinedData.trim();
                                if (streamId) {
                                    setActiveStreamId(streamId);
                                    setChatHistory(prev => ({
                                        ...prev,
                                        [chatKey]: {
                                            ...prev[chatKey],
                                            streamId: streamId
                                        }
                                    }));
                                }
                            } else if (currentEvent === 'metadata') {
                                if (combinedData) {
                                    try {
                                        const metadata = JSON.parse(combinedData);
                                        const provider = typeof metadata.provider === 'string' ? metadata.provider : undefined;
                                        const modelUsed = typeof metadata.model_used === 'string' ? metadata.model_used : undefined;
                                        setChatHistory(prev => ({
                                            ...prev,
                                            [chatKey]: {
                                                ...prev[chatKey],
                                                llmprovider: provider || prev[chatKey]?.llmprovider || curr_client || 'Unknown',
                                                llmModel: modelUsed || prev[chatKey]?.llmModel || curr_model || 'Unknown'
                                            }
                                        }));
                                    } catch (error) {
                                        console.warn('Metadata parse error', error);
                                    }
                                }
                            } else if (currentEvent === 'image' || currentEvent === 'images') {
                                if (!combinedData) return;
                                try {
                                    const payload = JSON.parse(combinedData);
                                    const images = normalizeImagesFromUnknown(payload);
                                    if (images.length > 0) {
                                        setChatHistory(prev => ({
                                            ...prev,
                                            [chatKey]: {
                                                ...prev[chatKey],
                                                botImages: [...(prev[chatKey]?.botImages ?? []), ...images]
                                            }
                                        }));
                                    }
                                } catch (error) {
                                    console.warn('Image event parse error', error);
                                }
                            } else if (currentEvent === 'completion') {
                                return;
                            } else if (combinedData) {
                                pushMessageChunk(combinedData);
                            }
                        };

                        try {
                            while (true) {
                                if (stopRequestedRef.current) break;
                                const { value, done } = await reader.read();
                                if (stopRequestedRef.current || done) break;
                                if (!value) continue;
                                const chunkText = decoder.decode(value, { stream: true });
                                chunkCount += 1;
                                streamLog('chunk', `#${chunkCount} bytes=${value.byteLength} chars=${chunkText.length}`);
                                eventBuffer += chunkText;
                                const segments = eventBuffer.split(/\r?\n\r?\n/);
                                eventBuffer = segments.pop() ?? '';
                                segments.forEach(processBlock);
                            }
                            const finalChunk = decoder.decode();
                            if (finalChunk) {
                                chunkCount += 1;
                                streamLog('decoder-flush', `#${chunkCount} chars=${finalChunk.length}`);
                                eventBuffer += finalChunk;
                            }
                            if (eventBuffer) {
                                streamLog('tail-buffer', `len=${eventBuffer.length}`);
                                processBlock(eventBuffer);
                                eventBuffer = '';
                            }
                        } finally {
                            reader.releaseLock();
                            readerRef.current = null;
                        }

                        setChatHistory(prev => {
                            const existing = prev[chatKey];
                            if (!existing) return prev;
                            return {
                                ...prev,
                                [chatKey]: {
                                    ...existing,
                                    botMessage: accumulated,
                                    botTime: botTime,
                                    isStreaming: false
                                }
                            };
                        });

                        await maybeGenerateImageFromToolCall(chatKey, accumulated, botTime);
                    } else if (response.resp) {
                        const responsePayload = response.resp;
                        const payloadIsObject = isAskSuccessPayload(responsePayload);
                        const message = typeof responsePayload === 'string'
                            ? responsePayload
                            : payloadIsObject
                                ? responsePayload.response ?? ''
                                : '';
                        const provider = payloadIsObject ? responsePayload.provider : undefined;
                        const modelUsed = payloadIsObject ? responsePayload.model_used : undefined;
                        const imagesFromPayload = payloadIsObject ? normalizeImagesFromUnknown(responsePayload) : [];
                        setChatHistory(prev => ({
                            ...prev,
                            [chatKey]: {
                                ...prev[chatKey],
                                botMessage: message,
                                botImages: imagesFromPayload.length > 0 ? imagesFromPayload : (prev[chatKey]?.botImages ?? []),
                                botTime: botTime,
                                llmprovider: provider || prev[chatKey]?.llmprovider || curr_client || 'Unknown',
                                llmModel: modelUsed || prev[chatKey]?.llmModel || curr_model || 'Unknown',
                                isStreaming: false
                            }
                        }));

                        await maybeGenerateImageFromToolCall(chatKey, message, botTime);
                    } else {
                        setChatHistory(prev => ({
                            ...prev,
                            [chatKey]: {
                                ...prev[chatKey],
                                botMessage: '',
                                botTime: botTime,
                                isStreaming: false
                            }
                        }));
                    }
                } else if (response && response.statusCode && response.statusCode < 500) {
                    setChatHistory(prev => ({
                        ...prev,
                        [chatKey]: {
                            ...prev[chatKey],
                            botMessage: `Error ${response.statusCode}: ${response.resp}`,
                            botTime: botTime,
                            isStreaming: false
                        }
                    }));
                } else {
                    setChatHistory(prev => ({
                        ...prev,
                        [chatKey]: {
                            ...prev[chatKey],
                            botMessage: `Server Error ${response?.statusCode}: ${response?.resp || 'Unknown error'}`,
                            botTime: botTime,
                            isStreaming: false
                        }
                    }));
                }
            }
        } finally {
            setEnableAskButton(true);
            setTypingComplete(true);
            setStreamActive(false);
            stopRequestedRef.current = false;
            setActiveStreamId(undefined);
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
        if (!activeStreamId) return;
        stopRequestedRef.current = true;
        readerRef.current?.cancel();
        try {
            const resp = await stopStream(activeStreamId);
            if (!resp.status) {
                console.warn('Stop request failed', resp.resp);
            }
        } catch (error) {
            console.warn('Stop request error', error);
        } finally {
            setStreamActive(false);
            setActiveStreamId(undefined);
        }
    };

    const handleButtonClick = () => {
        if (streamActive && activeStreamId) {
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
                                                <span className='button-text'><ShinyText text="Ask" disabled={false} speed={3} className='custom-class' /></span>
                                                <i className="fa-regular fa-paper-plane"></i>
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
