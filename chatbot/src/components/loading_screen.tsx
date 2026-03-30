import { useEffect, useRef } from "react";
import Shuffle from "./shuffle_text";

function Loading() {
    const loadingText = "loading_";
    const waitText = "please wait, this may take up to 60s";
    const wait_span = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (wait_span.current) {
                wait_span.current.classList.add("show");
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <><div id="loadingScreen">


            <div className="loading-block">
                <Shuffle
                    text={loadingText}
                    shuffleDirection="right"
                    duration={0.35}
                    animationMode="evenodd"
                    shuffleTimes={1}
                    ease="power3.out"
                    stagger={0.03}
                    threshold={0.1}
                    triggerOnce={true}
                    triggerOnHover={true}
                    respectReducedMotion={true}
                />
                <span className="wait-text poppins-regular" ref={wait_span}>
                    {waitText}
                </span>
            </div>


        </div>
        </>
    )
};

export default Loading;