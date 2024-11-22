const axios = require("axios");
const connection = require("../database/connection");

// function to insert data into mysql
async function insertDataToDB(questions) {
  const query = `
      INSERT INTO api_data (
        question_id, title, question_link, is_answered, view_count, answer_count, score, 
        last_activity_date, creation_date, content_license, 
        user_id, user_account_id, user_reputation, user_type, 
        user_accept_rate, user_profile_image, user_display_name, user_link, tags
      ) 
      VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  for (const question of questions) {
    const questionValues = [
      question.question_id || null,
      question.title || null,
      question.link || null,
      question.is_answered || 0,
      question.view_count,
      question.answer_count || 0,
      question.score,
      question.last_activity_date || null,
      question.creation_date || null,
      question.content_license || null,
      question.owner?.user_id || null,
      question.owner?.account_id || null,
      question.owner?.reputation || null,
      question.owner?.user_type || null,
      question.owner?.accept_rate || 0,
      question.owner?.profile_image || null,
      question.owner?.display_name || null,
      question.owner?.link || null,
      question.tags ? question.tags.join(", ") : null,
    ];

    try {
      await new Promise((resolve, reject) => {
        connection.execute(query, questionValues, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    } catch (err) {
      console.error("Error:", err);
    }
  }
}


// function to delete old data from mysql
async function deleteOldData() {
  const query = "DELETE FROM api_data";

  return new Promise((resolve, reject) => {
    connection.execute(query, (err, results) => {
      if (err) {
        reject("Error deleting data:", err);
      } else {
        resolve("Old data deleted");
      }
    });
  });
}


// function to fetch data from api and load it to mysql
async function fetchAndLoadToDB() {
  try {
    await deleteOldData();
    const result = await axios.get(
      "https://api.stackexchange.com/2.3/questions?site=stackoverflow"
    );
    const data = result.data.items;
    console.log(data);
    await insertDataToDB(data);
    console.log("Connection sucessful");
  } catch (err) {
    console.error(err);
  } finally {
    console.log("Connection closed");
  }
}

exports.loadQuestions = async (req, res) => {
  fetchAndLoadToDB();
  res.status(200).json("Data fetched and loaded from api");
};

exports.getQuestions = async (req, res) => {
  const { is_answered, tags, min_answers, max_answers, sortby, page = 1, perPageItems = 10 } = req.query;

  // Initialize the query and params array
  let query = `SELECT * FROM api_data WHERE 1=1`;
  let params = [];

  // Sorting setup
  let sorting = 'score'; 
  if (sortby === 'created_at') {
    sorting = 'creation_date';
  }

  // Add conditions to the query dynamically based on the provided filters
  if (is_answered == 1) {
    query += ` AND is_answered = 1`;
  } else if (is_answered == 0) {
    query += ` AND is_answered = 0`;
  }


  if (tags) {
    query += ` AND tags LIKE ?`;
    params.push(`%${tags}%`); 
  }

  if (min_answers !== undefined) {
    query += ` AND answer_count >= ?`;
    params.push(min_answers);  
  }

  if (max_answers !== undefined) {
    query += ` AND answer_count <= ?`;
    params.push(max_answers);  
  }

  // Sorting
  query += ` ORDER BY ${sorting} DESC`;

  // Pagination logic
  const offset = (page - 1) * perPageItems; 
  query += ` LIMIT ? OFFSET ?`;
  params.push(perPageItems, offset); 

  // console.log(query);
  // console.log(params);
  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (is_answered === 1) {
      countQuery += ` AND is_answered = 1`;
    } else if (is_answered === 0) {
      countQuery += ` AND is_answered = 0`;
    }

    if (tags) {
      countQuery += ` AND tags LIKE ?`;
      countParams.push(`%${tags}%`);
    }

    if (min_answers !== undefined) {
      countQuery += ` AND answer_count >= ?`;
      countParams.push(min_answers);
    }

    if (max_answers !== undefined) {
      countQuery += ` AND answer_count <= ?`;
      countParams.push(max_answers);
    }

      res.json({
        results: results,
      });
    });
};



exports.getQuestionByID = async (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM api_data WHERE question_id = ?';
    try {
        
        connection.execute(query, [id], (err, results) => {
          if (err) {
            console.error('Error fetching question data:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
    
         
          if (results.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
          }
    
          res.status(200).json(results[0]);
        });
      } catch (err) {
        console.error('Error fetching question:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
  };

  exports.deleteQuestionByID = async (req, res) => {
    const id = req.params.id;
    const query1 = 'SELECT * FROM api_data WHERE question_id = ?';
    const query2 = 'DELETE FROM api_data WHERE question_id = ?';
    try {
        
        connection.execute(query1, [id], (err, results) => {
            if (err) {
              console.error('Error checking question existence:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }
        
            if (results.length === 0) {
              return res.status(404).json({ message: 'Question not found' });
            }

        connection.execute(query2, [id], (err, results) => {
          if (err) {
            console.error('Error deleting question data:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
    
         
          if (results.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
          }
    
          res.status(200).json({ message: 'Question deleted successfully' });
        });
    });
      } catch (err) {
        console.error('Error deleting question:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
  };

exports.addQuestion = (req, res) => {

  const random_question_id = Math.floor(Math.random() * 90000000) + 10000000;

  const {
      question_id = random_question_id,
      title,
      question_link,
      is_answered = false,
      view_count = 0,
      answer_count = 0,
      score = 0,
      last_activity_date = 0,
      creation_date = 0,
      content_license = 'N/A',
      user_id = 12345678,
      user_account_id = '123456',
      user_reputation = 0,
      user_type = 'registered',
      user_accept_rate = 0,
      user_profile_image = 'N/A',
      user_display_name = 'N/A',
      user_link = 'N/A',
      tags
  } = req.body;

  console.log(req.body);

  if (!title || !question_link || !tags) {
      return res.status(400).json({ error: 'Title, question link, and tags are required.' });
  }

  const query = `
  INSERT INTO api_data 
  (question_id, title, question_link, is_answered, view_count, answer_count, score, 
  last_activity_date, creation_date, content_license, user_id, user_account_id, 
  user_reputation, user_type, user_accept_rate, user_profile_image, user_display_name, 
  user_link, tags)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
`;

  connection.execute(query, [
      question_id,
      title,
      question_link,
      is_answered,
      view_count,
      answer_count,
      score,
      last_activity_date,
      creation_date,
      content_license,
      user_id,
      user_account_id,
      user_reputation,
      user_type,
      user_accept_rate,
      user_profile_image,
      user_display_name,
      user_link,
      tags
  ], (err, results) => {

      if (err) {
          console.error('Error inserting question:', err);
          return res.status(500).json({ error: 'Failed to insert question' });
      }

      res.status(201).json({
          message: 'Question created successfully',
          id: results.insertId,
          question_id: question_id
      });
  });
};

exports.updateQuestion = (req, res) => {
  const questionId = req.params.id; 
  const {
      title,
      question_link,
      is_answered,
      view_count,
      answer_count,
      score,
      last_activity_date,
      creation_date,
      content_license,
      user_id,
      user_account_id,
      user_reputation,
      user_type,
      user_accept_rate,
      user_profile_image,
      user_display_name,
      user_link,
      tags
  } = req.body;

  console.log(req.body);

  if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required.' });
  }


  const updates = [];
  const values = [];

  if (title) {
      updates.push('title = ?');
      values.push(title);
  }
  if (question_link) {
      updates.push('question_link = ?');
      values.push(question_link);
  }
  if (is_answered !== undefined) {
      updates.push('is_answered = ?');
      values.push(is_answered);
  }
  if (view_count !== undefined) {
      updates.push('view_count = ?');
      values.push(view_count);
  }
  if (answer_count !== undefined) {
      updates.push('answer_count = ?');
      values.push(answer_count);
  }
  if (score !== undefined) {
      updates.push('score = ?');
      values.push(score);
  }
  if (last_activity_date !== undefined) {
      updates.push('last_activity_date = ?');
      values.push(last_activity_date);
  }
  if (creation_date !== undefined) {
      updates.push('creation_date = ?');
      values.push(creation_date);
  }
  if (content_license) {
      updates.push('content_license = ?');
      values.push(content_license);
  }
  if (user_id) {
      updates.push('user_id = ?');
      values.push(user_id);
  }
  if (user_account_id) {
      updates.push('user_account_id = ?');
      values.push(user_account_id);
  }
  if (user_reputation !== undefined) {
      updates.push('user_reputation = ?');
      values.push(user_reputation);
  }
  if (user_type) {
      updates.push('user_type = ?');
      values.push(user_type);
  }
  if (user_accept_rate !== undefined) {
      updates.push('user_accept_rate = ?');
      values.push(user_accept_rate);
  }
  if (user_profile_image) {
      updates.push('user_profile_image = ?');
      values.push(user_profile_image);
  }
  if (user_display_name) {
      updates.push('user_display_name = ?');
      values.push(user_display_name);
  }
  if (user_link) {
      updates.push('user_link = ?');
      values.push(user_link);
  }
  if (tags) {
      updates.push('tags = ?');
      values.push(tags);
  }


  if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
  }

  const query = `
  UPDATE api_data
  SET ${updates.join(', ')}
  WHERE question_id = ?
`;

  values.push(questionId);
  connection.execute(query, values, (err, results) => {
      if (err) {
          console.error('Error updating question:', err);
          return res.status(500).json({ error: 'Failed to update question' });
      }


      if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Question not found' });
      }

      res.status(200).json({
          message: 'Question updated successfully',
          question_id: questionId
      });
  });
};