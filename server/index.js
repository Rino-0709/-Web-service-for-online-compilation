const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const database = require("./database");
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = 8000;
const logger = require('./logger');

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const crypto = require('crypto');
const JWT_SECRET = crypto.randomBytes(32).toString('hex');

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  database.registerUser(username, password, (err) => {
      if (err) {
          logger.error(`Registration error for user ${username}: ${err.message}`);
          return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ message: "User registered successfully!" });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  database.loginUser(username, password, (err, user) => {
      if (err) {
          logger.error(`Login error for user ${username}: ${err.message}`);
          return res.status(500).json({ error: err.message });
      }
      if (!user) {
          logger.warn(`Invalid credentials for user: ${username}`);
          return res.status(400).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
  });
});

app.post("/save-code", (req, res) => {
  const { token, code, language } = req.body;
  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
          logger.error(`Unauthorized access attempt`);
          return res.status(401).json({ error: "Unauthorized" });
      }
      database.saveCode(user.id, code, language, (err) => {
          if (err) {
              logger.error(`Error saving code for user ID ${user.id}: ${err.message}`);
              return res.status(500).json({ error: err.message });
          }           
          res.json({ success: true });
      });
  });
});

app.get("/code-history", (req, res) => {
  const token = req.headers['authorization']; 
  if (!token) {
      logger.error(`Unauthorized access attempt`);
      return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    jwt.verify(token, JWT_SECRET, [], (err, user) => {
        if (err) {
            logger.error(`Unauthorized access attempt`);
            return res.status(401).json({ error: "Unauthorized" });
        }

        database.getCodeHistory(user.id, (err, rows) => {
            if (err) {
                logger.error(`Error retrieving code history for user ID ${user.id}: ${err.message}`);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json(rows);
        });
    });
  } catch (err) {
    logger.error(`Unexpected error: ${err.message}`);
  }
});

app.post("/compile", async (req, res) => {
  let ip_addr;

  if (req.headers['X_FORWARDED_FOR']) {
    ip_addr = req.headers['X_FORWARDED_FOR'].split(',')[0].trim();
  } else if (req.headers['X_REAL_IP']) {
    ip_addr = req.headers['X_REAL_IP'];
  } else if (req.headers['REMOTE_ADDR']) {
    ip_addr = req.headers['REMOTE_ADDR'];
  } else if (req.headers['HTTP_CLIENT_IP']) {
    ip_addr = req.headers['HTTP_CLIENT_IP'];
  } else if (req.connection && req.connection.remoteAddress) {
    ip_addr = req.connection.remoteAddress;
  } else if (req.socket && req.socket.remoteAddress) {
    ip_addr = req.socket.remoteAddress;
  } else {
    ip_addr = 'IP отсутствует';
  }
  const { code, language, input, private_token } = req.body;

  const flag = await database.checkToken(private_token, ip_addr);
  if (flag) {
    logger.info(`Compiling code in language: ${language}; IP: ${ip_addr}`);
  
    const apiUrl = 'http://localhost:5000/compile';
    const requestData = {
        language: language,
        code: code,
        input: input,
    };

    try {
      const response = await axios.post(apiUrl, requestData);
      const { output, error, exit_code } = response.data;
      logger.info(`Compilation response received`);
      let result;
      if (error) {
        result = `${output}\n${error}`;
      } else {
        result = `${output}\n...Program finished with exit code ${exit_code}`;
      }
      res.send(result);

    } catch (error) {
      logger.error(`Error during code compilation: ${error.message}`);
      if (error.response) {
        res.status(error.response.status).send(error.response.data);
      } else {
        res.status(500).send({ error: 'An error occurred while compiling the code.' });
      }
    }
  } else {
    logger.info('Access denied.')
    res.status(401).send({ error: 'Undefined token.' });
  }
});

app.listen(process.env.PORT || PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  console.log(`Server listening on port ${PORT}`);
});