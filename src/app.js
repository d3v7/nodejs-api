// TODO: make /questions endpoint to return all questions from the database
// TODO: add necessary filter options to the /questions endpoint

const express = require('express');
const app = express();


const questionsRoute = require('./routes/questions');

app.use(express.json());

app.use('/questions', questionsRoute);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});