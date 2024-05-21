import React, {useState} from 'react';
import Select from 'react-select';
import '../Styles/Navbar.css';
import '../App.css';

const Navbar = ({ userLang, setUserLang, userTheme, setUserTheme, fontSize, setFontSize, token, handleLogin, handleRegister, handleLogout, handleShowHistory }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const languages = [
        { value: "c", label: "C" },
        { value: "cpp", label: "C++" },
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
        { value: "javascript", label: "Javascript" },
        { value: "csharp", label: "C#" },
        { value: "php", label: "PHP" },
    ];
    const themes = [
        { value: "vs-dark", label: "Dark" },
        { value: "light", label: "Light" },
    ]
    const getLabelByValue = (options, value) => {
        const option = options.find(option => option.value === value);
        return option ? option.label : "";
    };

    const handleLoginClick = () => {
        handleLogin(username, password);
    };

    const handleRegisterClick = () => {
        handleRegister(username, password);
    };

    return (
        <div className="navbar">
            <h1>Online Code Compiler</h1>
            <Select options={languages} value={userLang}
                onChange={(e) => setUserLang(e.value)}
                placeholder={getLabelByValue(languages, userLang)}
                />
            <Select options={themes} value={userTheme}
                onChange={(e) => setUserTheme(e.value)}
                placeholder={getLabelByValue(themes, userTheme)} />
            <label>Font Size</label>
            <input type="range" min="10" max="50"
                value={fontSize} step="2"
                onChange={(e) => { setFontSize(e.target.value) }} />
            {token ? (
                <>
                    <button className="button-logout" onClick={handleLogout}>Logout</button>
                    <button className="button-history" onClick={handleShowHistory}>Code History</button>
                </>
            ) : (
                <div className="auth-buttons">
                    <input type="text" className="input-field" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="button-login" onClick={handleLoginClick}>Login</button>
                    <button className="button-register" onClick={handleRegisterClick}>Register</button>
                </div>
            )}
        </div>
    )
}

export default Navbar
