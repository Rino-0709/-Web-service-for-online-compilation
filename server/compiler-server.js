const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

const COMPILER_ENDPOINTS = {
  python: 'http://python_compiler:4000',
  java: 'http://java_compiler:4000',
  cpp: 'http://cpp_compiler:4000',
  javascript: 'http://javascript_compiler:4000'
};

app.post('/compile', async (req, res) => {
  const { language, code, input } = req.body;

  const compilerUrl = COMPILER_ENDPOINTS[language];

  if (!compilerUrl) {
    return res.status(400).send({ error: 'Unsupported language' });
  }

  try {
    const response = await axios.post(compilerUrl, { code, input });
    res.send(response.data);
  } catch (error) {
    console.error('Compilation error:', error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send({ error: 'An error occurred while compiling the code.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Compilation server running on port ${PORT}`);
});
