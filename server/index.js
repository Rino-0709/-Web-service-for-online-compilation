const express = require("express");
const cors = require("cors");
const Axios = require("axios");
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.post("/compile", async (req, res) =>{
  let code = req.body.code;
  ;
  let language = req.body.language;
  if (language === "python") {
    language = "python3";
    code+=";";
  }
  else if (language === "cpp") {
    language = "cpp17";
 }
  let input = req.body.input;
  const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://online-code-compiler.p.rapidapi.com/v1/',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': 'a2cf9bf77emshc4c4d72110b8415p133a09jsndef018c4be3f',
    'X-RapidAPI-Host': 'online-code-compiler.p.rapidapi.com'
  },
  data: {
    language: language,
    version: 'latest',
    code: code,
    input: input
  }
};

try {
	const response = await axios.request(options);
  res.send(response.data);
	console.log(response.data);
} catch (error) {
	console.error(error);
}
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
