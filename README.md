# Express Server - Question & Answer API

A RESTful API server built with Express.js and PostgreSQL for managing questions, answers, and voting system.

## Features

- ✅ CRUD operations for questions
- ✅ Create and manage answers for questions
- ✅ Search questions by title or category
- ✅ Voting system for questions and answers
- ✅ PostgreSQL database integration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend-skill-checkpoint-express-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL database:
   - Create a database named `backend-checkpoint`
   - Update database connection string in `utils/db.mjs` if needed:
   ```javascript
   connectionString: "postgresql://postgres:password@localhost:5432/backend-checkpoint"
   ```

4. Create database tables:
   ```sql
   -- Questions table
   CREATE TABLE questions (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     category VARCHAR(255)
   );

   -- Answers table
   CREATE TABLE answers (
     id SERIAL PRIMARY KEY,
     question_id INTEGER NOT NULL REFERENCES questions(id),
     content TEXT NOT NULL
   );

   -- Question votes table
   CREATE TABLE question_votes (
     id SERIAL PRIMARY KEY,
     question_id INTEGER NOT NULL REFERENCES questions(id),
     vote INTEGER NOT NULL CHECK (vote IN (1, -1))
   );

   -- Answer votes table
   CREATE TABLE answer_votes (
     id SERIAL PRIMARY KEY,
     answer_id INTEGER NOT NULL REFERENCES answers(id),
     vote INTEGER NOT NULL CHECK (vote IN (1, -1))
   );
   ```

## Running the Application

Start the development server:
```bash
npm start
```

The server will run on `http://localhost:4000`

## API Endpoints

### Test Endpoint

- **GET** `/test`
  - Test if the server is running
  - Response: `"Server API is working 🚀"`

### Questions

- **GET** `/questions`
  - Get all questions
  - Response: Array of question objects

- **GET** `/questions/search?title={title}&category={category}`
  - Search questions by title or category (case-insensitive)
  - Query Parameters:
    - `title` (optional): Search term for question title
    - `category` (optional): Search term for category
  - Response: Array of matching question objects

- **GET** `/questions/:questionId`
  - Get a specific question by ID
  - Response: Question object or 404 if not found

- **POST** `/questions`
  - Create a new question
  - Request Body:
    ```json
    {
      "title": "Question title",
      "description": "Question description",
      "category": "Category name"
    }
    ```
  - Response: `{ "message": "Question created successfully." }`

- **PUT** `/questions/:questionId`
  - Update an existing question
  - Request Body:
    ```json
    {
      "title": "Updated title",
      "description": "Updated description",
      "category": "Updated category"
    }
    ```
  - Response: `{ "message": "Question updated successfully." }` or 404 if not found

- **DELETE** `/questions/:questionId`
  - Delete a question
  - Response: `{ "message": "Question deleted successfully." }` or 404 if not found

- **POST** `/questions/:questionId/vote`
  - Vote on a question
  - Request Body:
    ```json
    {
      "vote": 1  // 1 for upvote, -1 for downvote
    }
    ```
  - Response: `{ "message": "Vote on the question has been recorded successfully." }`

### Answers

- **POST** `/questions/:questionId/answers`
  - Create an answer for a question
  - Request Body:
    ```json
    {
      "answer": "Answer content"
    }
    ```
    or
    ```json
    {
      "content": "Answer content"
    }
    ```
  - Response: `{ "message": "Answer created successfully." }`

- **GET** `/questions/:questionId/answers`
  - Get all answers for a specific question
  - Response: Array of answer objects

- **DELETE** `/questions/:questionId/answers/:answerId`
  - Delete an answer
  - Response: `{ "message": "Answer deleted successfully." }` or 404 if not found

- **POST** `/answers/:answerId/vote`
  - Vote on an answer
  - Request Body:
    ```json
    {
      "vote": 1  // 1 for upvote, -1 for downvote
    }
    ```
  - Response: `{ "message": "Vote on the answer has been recorded successfully." }`

## Example Usage

### Create a Question
```bash
curl -X POST http://localhost:4000/questions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What is Express.js?",
    "description": "I want to learn about Express.js framework",
    "category": "programming"
  }'
```

### Search Questions
```bash
curl "http://localhost:4000/questions/search?category=programming"
```

### Create an Answer
```bash
curl -X POST http://localhost:4000/questions/1/answers \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "Express.js is a web application framework for Node.js"
  }'
```

### Vote on a Question
```bash
curl -X POST http://localhost:4000/questions/1/vote \
  -H "Content-Type: application/json" \
  -d '{
    "vote": 1
  }'
```

## Project Structure

```
backend-skill-checkpoint-express-server/
├── app/
│   ├── questionRouter.js    # Question routes
│   └── answerRouter.js      # Answer routes
├── utils/
│   └── db.mjs               # PostgreSQL connection pool
├── app.mjs                  # Main application file
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "message": "Error message here"
}
```

## Technologies Used

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client for Node.js
- **nodemon** - Development server with auto-reload

## License

ISC
