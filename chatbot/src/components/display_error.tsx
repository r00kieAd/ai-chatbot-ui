const LordIcon = 'lord-icon' as any;

interface Params {
    errorMessage?: string | undefined;
    smallerScreen?: boolean;
};

function DisplayError({ errorMessage, smallerScreen = false }: Params) {
    const reloadPage = () => {
        window.location.reload()
    }

    const displayMessage = smallerScreen
        ? "App is currently not ready for this screen, only available for laptop or larger screens."
        : (errorMessage || 'Unknown Error Occured');
    console.log(displayMessage)
    return (
        <>
            <div id="errDiv">
                <div className="errorContainer">
                    <div className='errContainerChild errContainerChild1'>
                        <LordIcon
                            src="https://cdn.lordicon.com/azxkyjta.json"
                            trigger="in"
                            delay="100"
                            state="in-reveal"
                            style={{ width: '250px', height: '250px' }}>
                        </LordIcon>
                    </div>
                    <div className='errContainerChild errContainerChild2 poppins-regular'>
                        {displayMessage}
                    </div>
                    <br />
                    <span>OR, try reloading the page...</span>
                    <div id="retryButton" className="errContainerChild">
                        <button onClick={reloadPage}>Retry</button>
                    </div>
                </div>
            </div>
        </>
    )
};

export default DisplayError;
