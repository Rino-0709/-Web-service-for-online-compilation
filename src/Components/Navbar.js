import React from 'react';
import Select from 'react-select';
import '../Styles/Navbar.css';
import '../App.css';

const Navbar = ({ userLang, setUserLang, userTheme,
    setUserTheme, fontSize, setFontSize, Size, setSize }) => {
    const languages = [
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
        { value: "cpp", label: "C++" },
        { value: "javascript", label: "Javascript" },
        { value: "c", label: "C" },
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
            
        </div>
    )
}

export default Navbar
