require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const nlpParserHandler = require('./nlp-parser.js');
const generateFinalHandler = require('./generate-final.js');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/api/nlp-parser', nlpParserHandler);
app.post('/api/generate-final', generateFinalHandler);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
