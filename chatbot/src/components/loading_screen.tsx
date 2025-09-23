import Shuffle from "./shuffle_text";

function Loading() {
    const loadingText = "Smart Owl";

    return (
        <><div id="loadingScreen">

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
        </div>
        </>
    )
};

export default Loading;