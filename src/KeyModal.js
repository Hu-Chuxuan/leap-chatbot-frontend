import React from 'react';
import './App.css';

function KeyModal({ isOpen, onSubmit, isBusy, isMobile }) {
    const [apikey, setApikey] = React.useState('');
    const [org, setOrg] = React.useState('');

    const handleKeyChange = (event) => {
        setApikey(event.target.value);
    };

    const handleOrgChange = (event) => {
        setOrg(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page
        onSubmit(apikey, org); // Pass the key and org to the parent component
        setApikey('');
        setOrg('');
    };

    if (!isOpen) {
        return null;
    }

    return (
        // <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', zIndex: '10000', justifyContent: 'center' }}>
        //     <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
        //         <form onSubmit={handleSubmit}>
        //             <label>
        //                 OpenAI API-Key:
        //                 <input type="password" value={apikey} onChange={handleKeyChange} autoFocus />
        //             </label>
        //             <label>
        //                 OpenAI ORG ID:
        //                 <input type="password" value={org} onChange={handleOrgChange} placeholder='optional'/>
        //             </label>
        //             <button type="submit">Enter</button>
        //         </form>
        //     </div>
        // </div>
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#282c34', // Change this to whatever color you want
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999 // Ensures it stays at the background level, adjust as necessary
          }}>
        <div class="form-style-6" style={{ position: 'fixed', height: '45%', width: '90%', top: '30vh', left: 0, right: 0, bottom: 0, alignItems: 'center', zIndex: '10000', justifyContent: 'center' }}>
        <h1>LEAP needs something from you...</h1>
        {isBusy && (<div style={{ marginBottom: "5px", color: "grey"}}>LEAP is busy...😴 Please try again later!</div>)}
        {isMobile && (<div style={{ marginBottom: "5px", color: "grey"}}>LEAP can only work with laptop 💻</div>)}
        <form onSubmit={handleSubmit}>
        <label class="label-style" style={{textAlign:"left", width: "100%"}}>OpenAI API-Key <span class="required">*</span>
        <input class="input-style" type="password" name="field1" value={apikey} onChange={handleKeyChange} autoFocus/>
        </label>
        <label class="label-style" style={{textAlign:"left", width: "100%"}}>OpenAI ORG ID
        <input class="input-style" type="password" name="field2" value={org} onChange={handleOrgChange}/>
        </label>
        <input type="submit" value="Take me to LEAP! 🚀" />
        </form>
        </div>
        </div>
    );
}

export default KeyModal;
