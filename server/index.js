const express = require("express");
const cors = require("cors");
const axios = require('axios');
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

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
