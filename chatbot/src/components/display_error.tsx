import error from '../assets/error.png';

interface Params {
    errorMessage: string | undefined;
};

function DisplayError({ errorMessage }: Params) {
    return (
        <>
            <div id="errDiv">
                <div className="errorContainer">
                    <div className='errContainerChild errContainerChild1'><img src={error} alt="" /></div>
                    <div className='errContainerChild errContainerChild1 poppins-regular'>{errorMessage ? errorMessage : 'Unknown Error Occured'}</div>
                </div>
            </div>
        </>
    )
};

export default DisplayError;