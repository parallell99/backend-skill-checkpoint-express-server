import connectionPool from "../utils/db.mjs";
import {Router} from "express";

const questionRouter = Router();

    questionRouter.get("/", async (req, res) => {
        try {
          const questions = await connectionPool.query("SELECT * FROM questions");
          return res.status(200).json(questions.rows);
        } catch (error) {
          return res.status(500).json({ message: "Unable to fetch questions." });
        }
      });
      
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

    questionRouter.post("/", async (req, res) => {
        try{
            const { title,description,category } = req.body;
            await connectionPool.query(`INSERT INTO questions (title,description,category) VALUES ($1,$2,$3) RETURNING *`, [title,description,category]);
            return res.status(201).json({ message: "Question created successfully."});
        } catch (error) {
            return res.status(500).json({message: "Invalid request data."});
        }
      });
    
    questionRouter.put("/:questionId", async (req, res) => {
        try{
            const { questionId } = req.params;
            const { title, description, category } = req.body;
            const result = await connectionPool.query(
                `UPDATE questions SET title = $1, description = $2, category = $3 WHERE id = $4 RETURNING *`,
                [title, description, category, questionId]
            );
            if (!result.rows.length) {
                return res.status(404).json({ message: "Question not found." });
            }
            return res.status(200).json({ message: "Question updated successfully."});
        } catch (error) {
            return res.status(500).json({"message": "Unable to fetch questions."});
        }
      });

    questionRouter.delete("/:questionId", async (req, res) => {
        try{
            const { questionId } = req.params;
            await connectionPool.query(`DELETE FROM questions WHERE id = $1`, [questionId]);
            return res.status(200).json({ message: "Question deleted successfully."});
        } catch (error) {
            return res.status(500).json({"message": "Question not found."});
        }
      });

    questionRouter.post("/:questionId/answers", async (req, res) => {
        try {
            const { questionId } = req.params;
            const content = req.body.answer ?? req.body.content;
            
            if (!content) {
                return res.status(400).json({"message": "Invalid request data."});
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
            return res.status(500).json({ message: "Unable to create answer." });
        }
    });

    questionRouter.get("/:questionId/answers", async (req,res) =>{
        try{
            const { questionId } = req.params;
            const answers = await connectionPool.query(`SELECT * FROM answers WHERE question_id = $1`, [questionId]);
            return res.status(200).json(answers.rows);
        } catch (error) {
            return res.status(500).json({"message": "Unable to fetch answers."});
        }
    });
    
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