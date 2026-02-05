import connectionPool from "../utils/db.mjs";
import {Router} from "express";

const questionRouter = Router();

    /**
     * @swagger
     * /questions:
     *   get:
     *     summary: Get all questions
     *     tags: [Questions]
     *     responses:
     *       200:
     *         description: List of all questions
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Question'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.get("/", async (req, res) => {
        try {
          const questions = await connectionPool.query("SELECT * FROM questions");
          return res.status(200).json(questions.rows);
        } catch (error) {
          return res.status(500).json({ message: "Unable to fetch questions." });
        }
      });
      
    /**
     * @swagger
     * /questions/search:
     *   get:
     *     summary: Search questions by title or category
     *     tags: [Questions]
     *     parameters:
     *       - in: query
     *         name: title
     *         schema:
     *           type: string
     *         description: Search term for question title (case-insensitive)
     *       - in: query
     *         name: category
     *         schema:
     *           type: string
     *         description: Search term for category (case-insensitive)
     *     responses:
     *       200:
     *         description: List of matching questions
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Question'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.get("/search", async (req, res) => {
        try {
            const { title, category } = req.query;

            let query = 'SELECT * FROM questions WHERE 1=1';
            const values = [];
            let conditions = [];

            if (title) {
                values.push(`%${title}%`);
                conditions.push(`title ILIKE $${values.length}`);
            }

            if (category) {
                values.push(`%${category}%`);
                conditions.push(`category ILIKE $${values.length}`);
            }

            if (conditions.length > 0) {
                query += ' AND (' + conditions.join(' OR ') + ')';
            }

            const questions = await connectionPool.query(query, values);
            return res.status(200).json(questions.rows);
        } catch (error) {
            return res.status(500).json({message: "Unable to fetch questions."});
        }
      });
      
    /**
     * @swagger
     * /questions/{questionId}:
     *   get:
     *     summary: Get a question by ID
     *     tags: [Questions]
     *     parameters:
     *       - in: path
     *         name: questionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Question ID
     *     responses:
     *       200:
     *         description: Question details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Question'
     *       404:
     *         description: Question not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.get("/:questionId", async (req, res) => {
        try {
          const { questionId } = req.params;
          const question = await connectionPool.query("SELECT * FROM questions WHERE id = $1", [questionId]);
          if (!question.rows.length) {
            return res.status(404).json({ message: "Question not found." });
          }
          return res.status(200).json(question.rows[0]);
        } catch (error) {
          return res.status(500).json({message: "Unable to fetch question."});
        }
      });  

    /**
     * @swagger
     * /questions:
     *   post:
     *     summary: Create a new question
     *     tags: [Questions]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *               - category
     *             properties:
     *               title:
     *                 type: string
     *                 example: "What is Express.js?"
     *               description:
     *                 type: string
     *                 example: "I want to learn about Express.js framework"
     *               category:
     *                 type: string
     *                 example: "programming"
     *     responses:
     *       201:
     *         description: Question created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Question created successfully."
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.post("/", async (req, res) => {
        try{
            const questionData = {...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                published_at: new Date().toISOString(),
            };
            await connectionPool.query(`INSERT INTO questions (title,description,category,created_at,updated_at,published_at) 
                VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
                [
                    questionData.title,
                    questionData.description,
                    questionData.category,
                    questionData.created_at,
                    questionData.updated_at,
                    questionData.published_at
                ]);
            return res.status(201).json({ message: "Question created successfully."});
        } catch (error) {
            return res.status(500).json({message: "Invalid request data."});
        }
      });
    
    /**
     * @swagger
     * /questions/{questionId}:
     *   put:
     *     summary: Update a question
     *     tags: [Questions]
     *     parameters:
     *       - in: path
     *         name: questionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Question ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *               - category
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               category:
     *                 type: string
     *     responses:
     *       200:
     *         description: Question updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Question updated successfully."
     *       404:
     *         description: Question not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.put("/:questionId", async (req, res) => {
        try{
            const { questionId } = req.params;
            const { title, description, category } = req.body;
            const updated_at = new Date().toISOString();
            const result = await connectionPool.query(
                `UPDATE questions SET title = $1, description = $2, category = $3, updated_at = $4 WHERE id = $5 RETURNING *`,
                [title, description, category, updated_at, questionId]
            );
            if (!result.rows.length) {
                return res.status(404).json({ message: "Question not found." });
            }
            return res.status(200).json({ message: "Question updated successfully."});
        } catch (error) {
            return res.status(500).json({"message": "Unable to fetch questions."});
        }
      });

    /**
     * @swagger
     * /questions/{questionId}:
     *   delete:
     *     summary: Delete a question
     *     tags: [Questions]
     *     parameters:
     *       - in: path
     *         name: questionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Question ID
     *     responses:
     *       200:
     *         description: Question deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Question deleted successfully."
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.delete("/:questionId", async (req, res) => {
        try{
            const { questionId } = req.params;
            await connectionPool.query(`DELETE FROM questions WHERE id = $1`, [questionId]);
            return res.status(200).json({ message: "Question deleted successfully."});
        } catch (error) {
            return res.status(500).json({"message": "Question not found."});
        }
      });

    /**
     * @swagger
     * /questions/{questionId}/answers:
     *   post:
     *     summary: Create an answer for a question
     *     tags: [Questions]
     *     parameters:
     *       - in: path
     *         name: questionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Question ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - answer
     *             properties:
     *               answer:
     *                 type: string
     *                 maxLength: 300
     *                 example: "Express.js is a web application framework for Node.js"
     *               content:
     *                 type: string
     *                 maxLength: 300
     *                 description: Alternative to 'answer' field
     *     responses:
     *       201:
     *         description: Answer created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Answer'
     *       400:
     *         description: Invalid request data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Question not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.post("/:questionId/answers", async (req, res) => {
        try {
            const { questionId } = req.params;
            const content = req.body.answer ?? req.body.content;
            
            if (!content) {
                return res.status(400).json({message: "Invalid request data."});
            }
            
            if (content.length >= 300) {
                return res.status(400).json({ message: "Answer must be at most 300 characters long." });
            }

            const questionResult = await connectionPool.query(
                "SELECT id FROM questions WHERE id = $1",
                [questionId]
            );
            if (!questionResult.rows.length) {
                return res.status(404).json({ message: "Question not found." });
            }

            const insertResult = await connectionPool.query(
                "INSERT INTO answers (question_id, content) VALUES ($1, $2) RETURNING id, content",
                [questionId, content]
            );
            return res.status(201).json({ data: insertResult.rows });
        } catch (error) {
            console.error("Error creating answer:", error.message);
            console.error("Full error:", error);
            return res.status(500).json({ message: "Unable to create answer." });
        }
    });

    /**
     * @swagger
     * /questions/{questionId}/answers:
     *   get:
     *     summary: Get all answers for a question
     *     tags: [Questions]
     *     parameters:
     *       - in: path
     *         name: questionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Question ID
     *     responses:
     *       200:
     *         description: List of answers for the question
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Answer'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.get("/:questionId/answers", async (req,res) =>{
        try{
            const { questionId } = req.params;
            const answers = await connectionPool.query(`SELECT * FROM answers WHERE question_id = $1`, [questionId]);
            return res.status(200).json(answers.rows);
        } catch (error) {
            return res.status(500).json({"message": "Unable to fetch answers."});
        }
    });
    
    /**
     * @swagger
     * /questions/{questionId}/answers/{answerId}:
     *   delete:
     *     summary: Delete an answer
     *     tags: [Questions]
     *     parameters:
     *       - in: path
     *         name: questionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Question ID
     *       - in: path
     *         name: answerId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Answer ID
     *     responses:
     *       200:
     *         description: Answer deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Answer deleted successfully."
     *       400:
     *         description: Invalid questionId or answerId
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Question or answer not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.delete("/:questionId/answers/:answerId", async (req, res) => {
        try {
            const { questionId, answerId } = req.params;

            if (!/^\d+$/.test(questionId) || !/^\d+$/.test(answerId)) {
                return res.status(400).json({ message: "Invalid questionId or answerId." });
            }

            const questionCheck = await connectionPool.query(
                "SELECT 1 FROM questions WHERE id = $1",
                [questionId]
            );
            if (!questionCheck.rows.length) {
                return res.status(404).json({ message: "Question not found." });
            }

            const answerCheck = await connectionPool.query(
                "SELECT 1 FROM answers WHERE question_id = $1 AND id = $2",
                [questionId, answerId]
            );
            if (!answerCheck.rows.length) {
                return res.status(404).json({ message: "Answer not found." });
            }

            await connectionPool.query(
                `DELETE FROM answers WHERE question_id = $1 AND id = $2`,
                [questionId, answerId]
            );
            return res.status(200).json({ message: "Answer deleted successfully." });
        } catch (error) {
            return res.status(500).json({ "message": "Unable to delete answers." });
        }
    });

    /**
     * @swagger
     * /questions/{questionId}/vote:
     *   post:
     *     summary: Vote on a question
     *     tags: [Questions]
     *     parameters:
     *       - in: path
     *         name: questionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Question ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Vote'
     *     responses:
     *       200:
     *         description: Vote recorded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Vote on the question has been recorded successfully."
     *       400:
     *         description: Invalid vote value or questionId
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Question not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    questionRouter.post("/:questionId/vote", async (req, res) => {
    try {
        const { questionId } = req.params;
        const { vote } = req.body;

        if (!/^\d+$/.test(questionId)) {
            return res.status(400).json({ message: "Invalid questionId." });
        }

        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({ message: "Invalid vote value." });
        }

       
        const questionResult = await connectionPool.query(
            "SELECT id FROM questions WHERE id = $1",
            [questionId]
        );
        if (!questionResult.rows.length) {
            return res.status(404).json({ message: "Question not found." });
        }

        const result = await connectionPool.query(
            "INSERT INTO question_votes (question_id, vote) VALUES ($1, $2) RETURNING *",
            [questionId, vote]
        );

        return res.status(200).json({ message: "Vote on the question has been recorded successfully." });
    } catch (error) {
        console.error("Vote error:", error.message);
        return res.status(500).json({ message: "Unable to vote question." });
    }
});

    

export default questionRouter;