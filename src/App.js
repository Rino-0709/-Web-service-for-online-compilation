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
    
    const options = {
        fontSize: fontSize
    }

    function compile() {
        setLoading(true);
        if (userCode === ``) {
            return 
        }

        Axios.post(`http://localhost:8000/compile`, {
            code: userCode,
            language: userLang,
            input: userInput
        }).then((res) => {
            setUserOutput(res.data);
        }).then(() => {
            setLoading(false);
        })
    }
    


    function clearOutput() {
        setUserOutput("");
    }

    return (
        <div className="App">       
            <Navbar
                userLang={userLang} setUserLang={setUserLang}
                userTheme={userTheme} setUserTheme={setUserTheme}
                fontSize={fontSize} setFontSize={setFontSize}
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
        </div>
        
    );
    
}









export default App;
