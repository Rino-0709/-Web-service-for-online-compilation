import { useState } from 'react';
import './App.css';
import Editor from "@monaco-editor/react";
import Navbar from './Components/Navbar.js';
import Axios from 'axios';
import spinner from './spinner.svg';
import SplitPane from 'react-split-pane'




function App() {
    const [userCode, setUserCode] = useState(``);
    const [userLang, setUserLang] = useState("python");
    const [userTheme, setUserTheme] = useState("vs-dark");
    const [fontSize, setFontSize] = useState(20);
    const [userInput, setUserInput] = useState("");
    const [userOutput, setUserOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [codeHistory, setCodeHistory] = useState([]);
    const [showCodeHistory, setShowCodeHistory] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    
    const options = {
        fontSize: fontSize
    }

    const handleLogin = async (username, password) => {
        try {
            const res = await Axios.post(`http://localhost:8000/login`, { username, password });
            setToken(res.data.token);
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const handleRegister = async (username, password) => {
        try {
            await Axios.post(`http://localhost:8000/register`, { username, password });
            handleLogin(username, password);
        } catch (error) {
            console.error("Registration error:", error);
        }
    };

    const handleLogout = () => {
        setToken(null);
    };

    const handleShowHistory = async () => {
        if (!token) return;

        Axios.get('http://localhost:8000/code-history', {
            headers: { Authorization: token }
        }).then((res) => {
            setCodeHistory(res.data);
            setShowCodeHistory(true); // Показать модальное окно при успешном получении истории кода
        }).catch(err => {
            console.error(err);
        });
    };

    function compile() {
        setLoading(true);
        

        Axios.post(`http://localhost:8000/compile`, {
            code: userCode,
            language: userLang,
            input: userInput,
            private_token: "oXcLz6Fp4nth2JC4Shm1Ol0FSTk6zTy0cO47MISETKR54ZzPyO3MbHbUBeF8"
        }).then((res) => {
            setUserOutput(res.data);
            if (token) {
                saveCode(userCode,userLang);
            }
        }).then(() => {
            setLoading(false);
        })
    }

    const saveCode = async (code, language) => {
        try {
            await Axios.post(`http://localhost:8000/save-code`, { token, code, language });
        } catch (error) {
            console.error("Save code error:", error);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            alert('Code copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowCodeHistory(false);
            setIsClosing(false);
        }, 500); 
    };
    


    function clearOutput() {
        setUserOutput("");
    }

    return (
        <div className="App">       
            <Navbar
                userLang={userLang} setUserLang={setUserLang}
                userTheme={userTheme} setUserTheme={setUserTheme}
                fontSize={fontSize} setFontSize={setFontSize}
                token={token} handleLogin={handleLogin}
                handleRegister={handleRegister} handleLogout={handleLogout}
                handleShowHistory={handleShowHistory}
            />
            <div className="main">
            <SplitPane split="vertical" className="split" minSize={400} maxSize={1500} defaultSize='60%'  >
                
                    <div className="left-container" height = '0'> 
                        <Editor
                            options={options}
                            height="calc(100vh - 50px)"
                            width="100%"
                            theme={userTheme}
                            language={userLang}
                            defaultLanguage="python"
                            defaultValue="#Enter your code here"
                            onChange={(value) => { setUserCode(value) }}
                        />
                        <button className="run-btn" onClick={() => compile()}>
                            Run
                        </button>
                    </div>
                    
                    <div className="right-container" height = '0'>
                        <h4>Input:</h4>
                        <div className="input-box">
                            <textarea id="code-inp" onChange=
                                {(e) => setUserInput(e.target.value)}>
                            </textarea>
                        </div>
                        <h4>Output:</h4>
                        {loading ? (
                            <div className="spinner-box">
                            
                                <img src={spinner} alt="Loading..." />
                                
                            </div>
                        ) : (
                            <div className="output-box">
                                <pre>{userOutput}</pre>
                                
                            </div>
                        )}
                        <button onClick={() => { clearOutput() }}
                                    className="clear-btn">
                                    Clear
                                </button>
                    </div>
            </SplitPane>
            </div>
            {showCodeHistory && (
                <div className={`modal ${isClosing ? 'fade-out' : ''}`} onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={closeModal}>&times;</span>
                        <h3>Code History:</h3>
                        <ul>
                            {codeHistory.map((item, index) => (
                                <li key={index}>
                                <strong>Language:</strong> {item.language} <br />
                                <strong>Saved At:</strong> {item.timestamp} <br />
                                <button 
                                    onClick={() => copyToClipboard(item.code)} 
                                    className="copy-btn"
                                    style={{ 
                                        padding: '5px 10px',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                    }}
                                    >
                                        Copy full code
                                    </button> 
                                <pre>{item.code}</pre> <br />
                                                               
                            </li>))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
        
    );
    
}









export default App;
