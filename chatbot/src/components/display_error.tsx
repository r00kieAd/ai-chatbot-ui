import error from '../assets/error.png';

interface Params {
    errorMessage?: string | undefined;
    smallerScreen?: boolean;
};

function DisplayError({ errorMessage, smallerScreen = false }: Params) {
    // console.log('DisplayError - errorMessage:', errorMessage);
    // console.log('DisplayError - smallerScreen:', smallerScreen);
    // console.log('DisplayError - typeof errorMessage:', typeof errorMessage);
    // console.log('DisplayError - errorMessage length:', errorMessage?.length);

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
                    <div className='errContainerChild errContainerChild1'><img src={error} alt="" /></div>
                    <div className='errContainerChild errContainerChild2 poppins-regular'>
                        {displayMessage}
                    </div>
                    <div id="retryButton" className="errContainerChild">
                        <button onClick={reloadPage}>Retry</button>
                    </div>
                </div>
            </div>
        </>
    )
};

export default DisplayError;