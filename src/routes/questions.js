const express = require('express');
const router = express.Router();

const questions = require('../controllers/questions');

router.post('/load', questions.LoadQuestions);

module.exports = router;

