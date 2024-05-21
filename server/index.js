const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const database = require("./database");
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const crypto = require('crypto');
const JWT_SECRET = crypto.randomBytes(32).toString('hex');

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  database.registerUser(username, password, (err) => {
      if (err) {
          return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ message: "User registered successfully!" });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  database.loginUser(username, password, (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
  });
});

app.post("/save-code", (req, res) => {
  const { token, code, language } = req.body;
  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(401).json({ error: "Unauthorized" });
      database.saveCode(user.id, code, language, (err) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }           
          res.json({succes:true});
      });
  });
});

app.get("/code-history", (req, res) => {
  const token = req.headers['authorization']; 
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, JWT_SECRET, [], (err, user) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });

        database.getCodeHistory(user.id, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            return res.status(200).json(rows);
        });
    });
  } catch (err) {
    console.err(err);
  }
  
});

app.post("/compile", async (req, res) => {
  const { code, language, input } = req.body;

  const apiUrl = 'http://localhost:5000/compile';
  const requestData = {
      language: language,
      code: code,
      input: input
  };

  try {
    const response = await axios.post(apiUrl, requestData);
    const { output, error, exit_code } = response.data;
    console.log('Response:', response.data);
    const result = `${output}\n...Program finished with exit code ${exit_code}\n\n${error}`;
    res.send(result);

  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send({ error: 'An error occurred while compiling the code.' });
    }
  }
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

