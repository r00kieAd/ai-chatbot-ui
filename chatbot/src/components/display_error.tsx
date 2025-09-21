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
    
    const displayMessage = smallerScreen 
        ? "App is currently not ready for this screen, try tablet or larger screens. Works best on laptop screens."
        : (errorMessage || 'Unknown Error Occured');
    
    return (
        <>
            <div id="errDiv">
                <div className="errorContainer">
                    <div className='errContainerChild errContainerChild1'><img src={error} alt="" /></div>
                    <div className='errContainerChild errContainerChild1 poppins-regular'>
                        {displayMessage}
                    </div>
                </div>
            </div>
        </>
    )
};

export default DisplayError;