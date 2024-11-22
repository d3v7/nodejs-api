## nodejs-api


## Documentation

Loads Question From API to DB

```bash
  POST 20.117.181.125:3005/questions/load
```

Returns all available questions in the DB with filtering and sorting
```bash
  GET 20.117.181.125:3005/questions
  
  Params : is_answered, tags, min_answers, max_answers, sortby, page

  Example: 20.117.181.125:3005/questions?is_answered=1,tags=python,min_answers=2,max_answers=10,sortby=score,page=1

```

Fetches the details of the particular question
```bash
  GET 20.117.181.125:3005/questions/:id

  Example: 20.117.181.125:3005/questions/75418841
```

Deletes a particular questions
```bash
  DELETE 20.117.181.125:3005/questions/:id

  Example: 20.117.181.125:3005/questions/75418841
```

Creates a new question
```bash
  POST 20.117.181.125:3005/questions

  Body: {
          "title":"how to .....",
          "question_link":"https://stackoverflow/questions/xxxxx",
          "tags":"python,java"
        }

```
Updates a particular question
```bash
  PUT 20.117.181.125:3005/questions/:id

  Body: {
          "title":"how to do this...",
          "question_link":"https://stackoverflow/questions/1234",
          "tags":"python,django"
        }

  Example: 20.117.181.125:3005/questions/75418841
```
