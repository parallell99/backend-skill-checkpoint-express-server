import { Router } from "express";
import connectionPool from "../utils/db.mjs";


const answerRouter = Router();

/**
 * @swagger
 * /answers/{answerId}/vote:
 *   post:
 *     summary: Vote on an answer
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Answer ID
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
 *                   example: "Vote on the answer has been recorded successfully."
 *       400:
 *         description: Invalid vote value or answerId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Answer not found
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
answerRouter.post("/:answerId/vote", async (req, res) => {
    try {
        const { answerId } = req.params;
        const { vote } = req.body;

        if (!/^\d+$/.test(answerId)) {
            return res.status(400).json({ message: "Invalid answerId." });
        }

        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({ message: "Invalid vote value." });
        }

        const answerResult = await connectionPool.query(
            "SELECT id FROM answers WHERE id = $1",
            [answerId]
        );
        if (!answerResult.rows.length) {
            return res.status(404).json({ message: "Answer not found." });
        }

        const result = await connectionPool.query(
            "INSERT INTO answer_votes (answer_id, vote) VALUES ($1, $2) RETURNING *",
            [answerId, vote]
        );
        return res.status(200).json({ message: "Vote on the answer has been recorded successfully." });
    } catch (error) {
        console.error("Vote error:", error.message);
        return res.status(500).json({ message: "Unable to vote answer." });
    }
});



export default answerRouter;