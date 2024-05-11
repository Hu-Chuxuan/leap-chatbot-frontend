import React, { useState, useEffect, useRef } from 'react';
import KeyModal from './KeyModal';
import hljs from 'highlight.js';
import './App.css';
import humanImg from './user.jpg';
import botImg from './bot.jpg';
import downloadImg from './download.png'
import sendImg from './send.svg'


import "react-chat-elements/dist/main.css"
import { Input } from "react-chat-elements";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';


function App() {
  const [messages, setMessages] = useState([]);
  const [backendOutputs, setBackendOutputs] = useState([]);
  const [verbose, setVerbose] = useState([]);
  // const [description, setDescription] = useState(''); 
  const [descriptions, setDescriptions] = useState({});

  const [extractedSentences, setExtractedSentences] = useState([]);
  const [query, setQuery] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [showImage, setShowImage] = useState(false);

  const [file, setFile] = useState(null);

  const [refreshFlag, setRefreshFlag] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [displayRHS, setDisplayRHS] = useState(false);
  const [warning, setWarning] = useState(false);
  const [leapwarning, setLeapwarning] = useState(false);

  const [isBusy, setIsbusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const [filePaths, setFilePaths] = useState({ result: '', augmentedTable: '' });
  const [timestamp, setTimestamp] = useState('');

  const [dataheader, setDataheader] = useState([]);

  const [code, setCode] = useState([]);

  const [isToggled, setIsToggled] = useState(false);

  const [copied, setCopied] = useState(false);

  const fixedDivRef = useRef(null);
  const [fixedDivHeight, setFixedDivHeight] = useState(0);

  // const codeRef = useRef(null);
  const [currentSection, setCurrentSection] = useState('code');  // Default to 'code'

  useEffect(() => {
    function deleteFiles() {
      navigator.sendBeacon('https://leap-chatbot-backend.onrender.com/delete-files', '');
    }
    
    const handleBeforeUnload = (event) => {
      const saved = sessionStorage.getItem('isModalOpen') !== null ? JSON.parse(sessionStorage.getItem('isModalOpen')) : true;
  
      if (!saved) {
        deleteFiles(); // Call deleteFiles initially
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (fixedDivRef.current) {
      // Recalculate the height when dependencies change
      setFixedDivHeight(fixedDivRef.current.clientHeight);
    }
  }, [displayRHS, file, dataheader, isLoading]);


  const toggle = () => {
    setIsToggled(!isToggled);
  };

  useEffect(() => {
    // Automatically open the modal when the page loads
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    function deleteFiles() {
      fetch('https://leap-chatbot-backend.onrender.com/delete-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch((error) => {
        console.error('Error:', error);
      });
    }

    const saved = sessionStorage.getItem('isModalOpen') !== null ? JSON.parse(sessionStorage.getItem('isModalOpen')) : true;
  
    if (!saved) {
      deleteFiles(); // Call deleteFiles initially
    }
  
    let idleTimer;
    let countdown;
    let countdownValue = 30;
    const countdownDisplay = document.createElement('div');
    countdownDisplay.style.position = 'fixed';
    countdownDisplay.style.top = '0%';
    countdownDisplay.style.right = '38%';
    countdownDisplay.style.padding = '10px';
    countdownDisplay.style.backgroundColor = 'lightgrey';
    countdownDisplay.style.borderRadius = '5px';
    countdownDisplay.style.display = 'none';
    countdownDisplay.style.zIndex = 10000000000000;
    document.body.appendChild(countdownDisplay);
  
    function startCountdown() {
      if (!isModalOpen) { // Check if modal is not open
        countdownDisplay.style.display = 'block'; // Show the countdown
        countdownDisplay.textContent = 'Idle detected ⚠️ Reload after ' + countdownValue + ' seconds';
        countdown = setInterval(function() {
          countdownValue--;
          if (countdownValue < 0) {
            window.location.reload();
          } else {
            countdownDisplay.textContent = 'Idle detected ⚠️ Reload after ' + countdownValue + ' seconds';
          }
        }, 1000);
      }
    }
  
    function resetTimer() {
      clearTimeout(idleTimer);
      clearInterval(countdown);
      countdownValue = 30;
      countdownDisplay.style.display = 'none';
  
      if (!isModalOpen) { // Check if modal is not open
        idleTimer = setTimeout(() => {
          startCountdown();
        }, 90000); // 90 seconds before the countdown starts
      }
    }
  
    function resetTimerIfModalClosed() {
      if (!isModalOpen) {
        resetTimer();
      }
    }
  
    // Reset the timer whenever user interacts with the document and the modal is not open
    document.addEventListener('mousemove', resetTimerIfModalClosed);
    document.addEventListener('keydown', resetTimerIfModalClosed);
    document.addEventListener('scroll', resetTimerIfModalClosed);
    document.addEventListener('click', resetTimerIfModalClosed);
  
    // Set the initial timer
    resetTimer();
  }, [isModalOpen]);


  useEffect(() => {
    // Highlight all code on the page
    hljs.highlightAll();
  });

  useEffect(() => {
    // Store the state when it changes
    sessionStorage.setItem('isModalOpen', JSON.stringify(isModalOpen));
  }, [isModalOpen]);

  // useEffect(() => {
  //   if (codeRef.current) {
  //     codeRef.current.innerHTML = ''; // Clear existing content

  //     code.forEach((line) => {
  //       const span = document.createElement('span');
  //       span.innerHTML = hljs.highlightAuto(line).value;
  //       codeRef.current.appendChild(span);
  //       codeRef.current.appendChild(document.createElement('br')); // Add line break
  //     });
  //   }
  // }, [code]);

  const handleKeySubmit = async (apikey, org) => {
    // setIsModalOpen(false); // Close the modal after submitting
    // Here you can call your backend API
    try {
      const response = await fetch('https://leap-chatbot-backend.onrender.com/process_key', { //DEMO: change back to process_key
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apikey, org }),
      });
      const data = await response.json();

      if (data.message != "FULL") {
        setIsbusy(false);
        setIsModalOpen(false); // Close the modal after submitting
        setMessages(prev => [...prev, { text: "Hi! Nice to meet you - I'm LEAP! 🤓\n\n 📢 I will first briefly walk you through some instructions 📢  \n⬇️ You can upload data and type query in the input section at the bottom. \n ➡️ While I'm working, you can check my executed code in my 'Codespace', and my current progress in my 'Workspace' on the right. You can also turn on the 'Verbose Mode' in my 'Workspace' to get more details, e.g., the costs. \n ⏺️ Our messages will be displayed here. \n\n You are all set! 🎉 \n Please start by uploading your data as a SINGLE csv file.", type: "desc", from: 'bot' }]);
      }
      else {
        setIsbusy(true);
      }

    } catch (error) {
      console.error('Error submitting password:', error);
    }
  };

  const handleCopyToClipboard = (sentence) => {
    navigator.clipboard.writeText(sentence)
      .then(() => {
        console.log('Sentence copied to clipboard:', sentence);
      })
      .catch((error) => {
        console.error('Error copying sentence to clipboard:', error);
      });
  };

  const handleCopy = () => {
    const formattedCode = code.join('\n');
    navigator.clipboard.writeText(formattedCode).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }, (err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleDescriptionChange = (header, value) => {
    setDescriptions(prev => ({
      ...prev,
      [header]: value
    }));
  };

  const handleFileChange = (event) => {
    const f = event.target.files[0];
    setFile(f);  // Update the state if needed elsewhere in your component
    handleUpload(f);  // Pass file directly
  };

  const handleUpload = (f) => {
    // alert('Please select a file first!');
    if (!f) {
      return;
    }

    const formData = new FormData();
    formData.append('file', f);

    fetch('https://leap-chatbot-backend.onrender.com/upload-csv', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        setDataheader(data.headers);  // Update the state with the headers
        // setMessages(prev => [...prev, { text: "We receive your data " + f.name + "! 🙌", type: "text", from: 'bot' }]);
        setMessages(prev => [...prev, { text: "We receive your data " + f.name + "! 🙌\n"+"Please fill in the data descriptions before submitting your query 😊 \n All you need to do is briefly describing the contents of each column of your provided data! For example, \n Post: Tweets to be analyzed \n Date: Tweet dates", type: "desc", from: 'bot' }]);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    const initialDescriptions = {};
    dataheader.forEach(header => {
      initialDescriptions[header] = '';  // Initialize each header's description as an empty string
    });
    setDescriptions(initialDescriptions);
  };

  // useEffect(() => {
  //   // Polling mechanism to periodically check for the image
  //   const interval = setInterval(() => {
  //     // Update the image URL with a new timestamp to avoid cache issues
  //     setImageUrl(`https://leap-chatbot-backend.onrender.com/static/dot_graph.png?timestamp=${new Date().getTime()}`);
  //     setShowImage(true);
  //   }, 5000); // Update every 5 seconds

  //   return () => clearInterval(interval); // Cleanup on component unmount
  // }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const newUrl = `https://leap-chatbot-backend.onrender.com/static/dot_graph.png?timestamp=${new Date().getTime()}`;
      
      fetch(newUrl)
        .then(response => {
          if (response.ok) {
            setImageUrl(newUrl);
            setShowImage(true);
          } else {
            throw new Error('Image not available');
          }
        })
        .catch(error => {
          console.error('Failed to fetch image:', error);
          setShowImage(false);
        });
    }, 5000);
  
    return () => clearInterval(interval);
  }, []);
  

  const handleHover = (event) => {
    event.target.style.color = 'black'; // Change text color on hover
    event.target.style.borderColor = 'black'; // Change border color on hover
    event.target.style.backgroundColor = 'white'; // Change border color on hover
  };

  const handleHoverOut = (event) => {
    event.target.style.color = 'white'; // Reset text color when hover ends
    event.target.style.borderColor = 'white'; // Reset border color when hover ends
    event.target.style.backgroundColor = '#282c34';
  };

  const handleSendMessage = (message) => {
    const payload = {
      message,  // the message text from the input
      descriptions  // the current state of the description input
    };
    // POST request to start the count
    fetch('https://leap-chatbot-backend.onrender.com/start_count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

      .then(() => {
        // Establish an EventSource connection to receive the count
        const eventSource = new EventSource('https://leap-chatbot-backend.onrender.com/test_stream');
        eventSource.onmessage = event => {
          const data = event.data.trim();
          if (data === "start") {
            setIsLoading(true);
          }
          else if (data === "complete") {
            setIsLoading(false);
          }
          else if (data.startsWith("VER NUMBER:")) {
            const ver = data.slice("VER NUMBER:".length).trim();
            setTimestamp(ver);
          }
          else if (data.startsWith("CODE:")) {
            const c = data.slice("CODE:".length).trim();
            setCode(prevCode => [...prevCode, c]);
            setRefreshFlag(false);
            setTimeout(() => {
              setRefreshFlag(true);
            }, 100);
          }
          else if (data.startsWith("CACHE:")) {
            const filename = data.slice("CACHE:".length).trim();
            const regex = /result(\d+)\.csv$/;
            const match = filename.match(regex);
            if (match && match[1]) {
              setTimestamp(match[1]);
            }
            setFilePaths({ result: "https://leap-chatbot-backend.onrender.com/static/result.csv" });
            setMessages(prev => [...prev, { text: "", displayDownload: true, filename: "result", type: "file", version: timestamp, from: 'bot' }]);
          }
          else if (data.startsWith("########## Warning: ")) {
            const warning_msg = data.slice("########## Warning: ".length).trim();
            setMessages(prev => [...prev, { text: warning_msg, type: "text", from: 'bot' }]);
            setWarning(true);
          }
          else if (data.startsWith("########## LEAPWARNING: ")) {
            const warning_msg = data.slice("########## LEAPWARNING: ".length).trim();
            setMessages(prev => [...prev, { text: warning_msg, type: "text", from: 'bot' }]);
            setLeapwarning(true);
          }
          else {
            if (data.startsWith("########## Feedback: ")) {
              const remainingMessage = data.slice("########## Feedback: ".length).trim();
              const pattern = /\*\*(.*?)\*\*/g;
              const matches = remainingMessage.match(pattern);
              if (matches) {
                const extractedSentences = matches.map(match => match.slice(2, -2));
                const replacedMessage = remainingMessage.replace(pattern, match => match.replace(/\*\*/g, "'"));
                setMessages(prev => [...prev, { text: replacedMessage, type: "text", from: 'bot' }]);
                setExtractedSentences(extractedSentences);
              } else {
                setMessages(prev => [...prev, { text: remainingMessage, type: "text", from: 'bot' }]);
              }
            }
            else if (data.startsWith("########## AT-HTML:")) {
              const html = data.slice("########## AT-HTML:".length).trim();
              setMessages(prev => [...prev, { text: "Data labeled 📑", display_html: true, htmlContent: html, filename: "labeled data", type: "text", from: 'bot' }]);
              setFilePaths({ augmentedTable: "https://leap-chatbot-backend.onrender.com/static/augmented_table.csv" });
            }
            else if (data.startsWith("########## R-HTML:")) {
              const html = data.slice("########## R-HTML:".length).trim();
              setMessages(prev => [...prev, { text: "Result generated 📊", display_html: true, htmlContent: html, filename: "result", type: "text", from: 'bot' }]);
              setFilePaths({ result: "https://leap-chatbot-backend.onrender.com/static/result.csv" });
            }
            else if (data.startsWith("VERBOSE:")) {
              const data_new = data.slice("VERBOSE:".length).trim();
              setVerbose(prev => [...prev, false]);
              setBackendOutputs(prev => [...prev, data_new]);
            }
            else {
              setBackendOutputs(prev => [...prev, data]);
              setVerbose(prev => [...prev, true]);
            }
          }
        };
        eventSource.onerror = error => {
          console.error('EventSource error:', error);
          eventSource.close();
        };
      })

      .catch(error => console.error('Error:', error));

    setMessages(prev => [...prev, { text: message, type: "text", from: 'user' }]);
    // setDescription('');
  };

  function handleDownload(text, timestamp) {
    const uri = text === "result" ? 'https://leap-chatbot-backend.onrender.com/static/result' + String(timestamp) + '.csv' : 'https://leap-chatbot-backend.onrender.com/static/augmented_table' + String(timestamp) + '.csv';
    fetch(uri)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = uri.split('/').pop(); // Assuming the filename is the last part of the URI
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(e => console.error('Download failed:', e));
  }

  const handleDeleteFiles = async () => {
    try {
      const response = await fetch('https://leap-chatbot-backend.onrender.com/delete-dot-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete files');
      }
      const result = await response.json();
      console.log(result.message); // Display the server response message
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  const handleWarning = (shouldWarn) => {
    console.log("handleWarning called with:", shouldWarn);
    // Create the data object to be sent to the backend
    const data = {
      warn: shouldWarn
    };

    fetch('https://leap-chatbot-backend.onrender.com/warning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => console.log("Response:", data))
    .catch(error => console.error("Error:", error));

    setWarning(false);
  };

  const handleLeapWarning = (shouldWarn) => {
    // Create the data object to be sent to the backend
    const data = {
      warn: shouldWarn
    };

    // POST request to start the count
    fetch('https://leap-chatbot-backend.onrender.com/leap-warning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    setLeapwarning(false);
  };

  const handleMessageInput = event => {
    if (event.key === 'Enter' && event.target.value.trim() !== '') {
      setCode([]);
      handleDeleteFiles();
      // handleUpload();
      handleSendMessage(event.target.value);
      event.target.value = '';
      setBackendOutputs([]);
      setVerbose([]);
      // setFilePaths({result: "", augmentedTable: ""});
      setExtractedSentences([]);
      setQuery('');
    }
  };

  const handleSubmit = () => {
    if (query.trim() !== '') {
      setCode([]);
      handleDeleteFiles();
      handleSendMessage(query);
      setBackendOutputs([]);
      setVerbose([]);
      setExtractedSentences([]);
      setQuery('');  // Clear the input after sending
    }
  };

  return (
    <div className="App">
      <KeyModal isOpen={isModalOpen} onSubmit={handleKeySubmit} isBusy={isBusy}/>
      <div className="grid-container" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="chat-section">
          {/* <header className="App-header"> */}
          <div style={{ backgroundColor: "#282c34", height: `calc(100vh - ${fixedDivHeight}px)`, overflowY: 'auto', width: '100%', color: 'white' }}>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  <div>
                    {msg.from === 'user' ? (
                      <>
                        <img
                          src={humanImg}
                          className="icon"
                        />
                        <span className="sender-name">You</span>
                      </>
                    ) : (
                      <div>
                        <img
                          src={botImg}
                          className="icon"
                        />
                        <span className="sender-name">LEAP</span>
                      </div>
                    )}
                  </div>
                  <div className="message-text">{msg.type === 'desc' ? msg.text.split('\n').map((item, index) => (
                    <React.Fragment key={index}>
                      {item}
                      <br />
                    </React.Fragment>
                  )) : msg.text}</div>
                  {(msg.display_html || msg.displayDownload) && (
                    <div className="html-content">
                      <div dangerouslySetInnerHTML={{ __html: msg.htmlContent }} />
                      <div style={{ marginLeft: "40px", marginTop: "10px" }}>
                        <a
                          onClick={() => handleDownload(msg.filename, timestamp)}
                          target="_blank"
                          style={{ cursor: "pointer" }} // Adds a pointer cursor to indicate it's clickable
                        >
                          <span style={{ color: "white" }}>Download full {msg.filename}</span>
                          <img src={downloadImg} className="download" />
                        </a>
                      </div>
                    </div>
                  )}

                </li>
              ))}
            </ul>
            {(isLoading && !warning && !leapwarning) && (
              <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>)}

            <div>
              {warning && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ marginTop: '-10px', width: '50%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ borderColor: 'white', color: 'white', width: '70%', fontSize: '15px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '10px', border: '1px solid #ccc', padding: '5px' }} onClick={() => handleWarning(true)} onMouseEnter={handleHover} onMouseLeave={handleHoverOut}>YES</div>
                    <div style={{ borderColor: 'white', color: 'white', width: '70%', fontSize: '15px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '10px', border: '1px solid #ccc', padding: '5px' }} onClick={() => handleWarning(false)} onMouseEnter={handleHover} onMouseLeave={handleHoverOut}>NO</div>
                  </div>
                </div>
              )}
            </div>


            <div>
              {leapwarning && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ marginTop: '-10px', width: '50%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ borderColor: 'white', color: 'white', width: '70%', fontSize: '15px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '10px', border: '1px solid #ccc', padding: '5px' }} onClick={() => handleLeapWarning(false)} onMouseEnter={handleHover} onMouseLeave={handleHoverOut}>YES</div>
                    <div style={{ borderColor: 'white', color: 'white', width: '70%', fontSize: '15px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '10px', border: '1px solid #ccc', padding: '5px' }} onClick={() => handleLeapWarning(true)} onMouseEnter={handleHover} onMouseLeave={handleHoverOut}>NO</div>
                  </div>
                </div>
              )}
            </div>

            <div className="extracted-section">
              {extractedSentences && extractedSentences.map((sentence, index) => (
                <div key={index}
                  style={{ width: '70%', fontSize: '15px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '10px', border: '1px solid #fff', color: 'white', padding: '5px' }}
                  onClick={() => {
                    handleCopyToClipboard(sentence);
                    setQuery(sentence);
                    setExtractedSentences([]);
                  }}
                  onMouseEnter={handleHover} // Change color on hover
                  onMouseLeave={handleHoverOut} // Reset color when hover ends
                >
                  {sentence}
                </div>
              ))}
            </div>
          </div>

          <div ref={fixedDivRef} style={{
            position: 'fixed', // This makes the element fixed relative to the viewport
            bottom: '0',        // Positions the element at the bottom of the viewport
            left: '0',          // Aligns the element to the left of the viewport
            right: '0',         // Aligns the element to the right of the viewport
            width: '50%',      // Ensures the element spans the full width of the viewport
            fontSize: '15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#282c34', // Optional: Change the background color if needed
            zIndex: '1000',
            borderTop: '1px solid #FFFFFF', // Adds a white top border with 3px thickness

          }}>
            <div style={{ color: 'white', marginTop: '10px', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
              <div>
                <label className="file-input-label">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv"
                    style={{ display: 'none' }}
                  />
                  <span className="file-input-button">
                    <FontAwesomeIcon icon={faUpload} /> Upload Data
                  </span>
                </label>
              </div>

              <div>
                {dataheader.length > 0 && (
                  <>
                    {/* <h3>Data Descriptions:</h3>
                    Please briefly describe the contents of each column of your provided data. For example, 
                    <br></br>
                    Post: <b>Tweets to be analyzed</b>
                    <br></br>
                    Date: <b>Tweet dates</b> */}
                    <ul>
                      {dataheader.map((header, index) => (
                        <div key={index} className="list-item">
                          <span className="header">{header}:</span>
                          <div className="input-container">
                            <Input
                              type="text"
                              value={descriptions[header] || ''}
                              onChange={(e) => handleDescriptionChange(header, e.target.value)}
                              placeholder="Column description"
                            />
                          </div>
                        </div>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {file && (
              <div style={{ fontSize: '15px', marginBottom: '10px', color: 'white' }}>
                Uploaded File: {file.name}
              </div>
            )}
            <div style={{ width: '50%', maxWidth: '800px', margin: '0 auto', marginBottom: '10px' }}>
              {isLoading ? (
                <div class="loader-container">
                  <div class="loader"></div>
                </div>
              ) : (
                <div className="form-container">
                <Input type="text" value={query} onKeyDown={handleMessageInput} onChange={(e) => setQuery(e.target.value)} placeholder="Message LEAP..." />
                <div className="tooltip-container">
                  <img src={sendImg} className="send-message" onClick={handleSubmit} />
                  <span className="tooltip-text">Send Message</span>
                </div>
                </div>
                )
              }
            </div>
          </div>
        </div>
          
        <div className="output-section" style={{ height: '100vh' }}>
          {/* <h2 style={{textAlign: "left", marginLeft:"2px", marginTop:"5px", fontSize: "15px"}}>LEAP's Workspace</h2> */}
          <button class="tablink" style={{ fontWeight: currentSection === 'code'?'bold': 'normal', backgroundColor: currentSection === 'code' ? 'white' : 'grey', color: currentSection === 'code' ? 'black' : 'white' }} onClick={() => setCurrentSection('code')}>LEAP's Codespace</button>
          <button class="tablink" style={{ fontWeight: currentSection === 'outputs'?'bold':"normal", backgroundColor: currentSection === 'outputs' ? 'white' : 'grey', color: currentSection === 'outputs' ? 'black' : 'white' }}onClick={() => setCurrentSection('outputs')}>LEAP's Workspace</button>
          {currentSection === 'code' && (<div style={{
            position: 'fixed',
            top: 0,
            width: '50%',
            backgroundColor: 'white',
            // color: 'white',
            // boxShadow: '0px -4px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
            padding: '20px',
            height: '100vh',
            overflowY: 'auto'
          }}>
            {code.length > 0 && (
              <div style={{
                backgroundColor: '#2b2b2b',
                color: 'white',
                fontFamily: 'monospace',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: "100%",
                borderBottom: '1px solid #ddd',
                marginBottom: '0px',
                marginTop: '50px',
              }}>
                <span style={{fontSize: "11px", marginLeft: "3px"}}>python</span>
                <button onClick={handleCopy} style={{
                  cursor: 'pointer',
                  background: '#2b2b2b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: "11px"
                }}>{copied ? 'Copied!' : 'Copy'}</button>
              </div>
            )
            }
            {refreshFlag && code.length > 0 && (
              <pre style={{
                textAlign: 'left',
                marginTop: '0px',
                width: '100%',
                height: '80vh',
                overflowY: 'auto',
              }}>
                <code className="language-python">
                  {code.map((line, index) => (
                    <React.Fragment key={index}>
                      {line + '\n'}
                    </React.Fragment>
                  ))}

                </code>
              </pre>
            )
            }
          </div>
          )}

          {currentSection === 'outputs' && (
          <div style={{ width: "50%", justifyContent: 'center', alignItems: 'center', position: "fixed", bottom: 0, height: "90%", textAlign: "center", flexGrow: 1, backgroundColor: "white"}}>
            {/* <h2>LEAP's Workspace
            </h2> */}
            { true &&
            (<div className="toggle-container">
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-checkbox"
                  checked={isToggled}
                  onChange={toggle}
                />
                <label className="toggle-label" htmlFor="toggle">
                  <span className="toggle-inner" />
                  <span className="toggle-switch" />
                </label>
              </div>
            <label htmlFor="toggle" className="toggle-text">Verbose Mode</label>
            </div>)}
            <div style={{ overflowY: 'auto', height: '85vh'}}>
              <div>
                {showImage && (
                  <div>
                    <img src={imageUrl} alt="Dynamic from backend" onError={(e) => {
                      console.error('Failed to load image:', imageUrl);
                      setShowImage(false); // Hide the image if there is an error loading it
                    }} />
                    <div className="subtitle">Column Mapping Relationship</div>
                  </div>
                )}
              </div>
              <pre>
                {backendOutputs.map((output, index) => {
                  // Check if output should be displayed based on isToggled and the verbose array
                  if (isToggled || verbose[index]) {
                    return <div key={index}>{output}</div>;
                  }
                  return null; // Do not render this output if conditions aren't met
                })}
              </pre>
              </div>
            </div>
                      )}
            </div>
            </div>
          </div>
  );
}

export default App;




