import express from "express";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.mjs';
import connectionPool from "./utils/db.mjs";
import questionRouter from "./app/questionRouter.js";
import answerRouter from "./app/answerRouter.js";

const app = express();
const port = 4000;

app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test server connection
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Server API is working 🚀"
 */
app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.use("/questions", questionRouter);
app.use("/answers", answerRouter);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
