const express = require('express');
const router = express.Router();

const questions = require('../controllers/questions');

router.post('/load', questions.loadQuestions);
router.get('/', questions.getQuestions);
router.get('/:id', questions.getQuestionByID);
router.delete('/:id', questions.deleteQuestionByID);
router.post('/', questions.addQuestion);
router.put('/:id', questions.updateQuestion);


module.exports = router;

