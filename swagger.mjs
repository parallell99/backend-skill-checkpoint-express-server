import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Question & Answer API',
      version: '1.0.0',
      description: 'RESTful API for managing questions, answers, and voting system',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Test',
        description: 'Test endpoints',
      },
      {
        name: 'Questions',
        description: 'Question management endpoints',
      },
      {
        name: 'Answers',
        description: 'Answer management endpoints',
      },
    ],
    components: {
      schemas: {
        Question: {
          type: 'object',
          required: ['title', 'description', 'category'],
          properties: {
            id: {
              type: 'integer',
              description: 'Question ID',
            },
            title: {
              type: 'string',
              description: 'Question title',
            },
            description: {
              type: 'string',
              description: 'Question description',
            },
            category: {
              type: 'string',
              description: 'Question category',
            },
          },
        },
        Answer: {
          type: 'object',
          required: ['content'],
          properties: {
            id: {
              type: 'integer',
              description: 'Answer ID',
            },
            question_id: {
              type: 'integer',
              description: 'Question ID this answer belongs to',
            },
            content: {
              type: 'string',
              description: 'Answer content',
            },
          },
        },
        Vote: {
          type: 'object',
          required: ['vote'],
          properties: {
            vote: {
              type: 'integer',
              enum: [1, -1],
              description: 'Vote value: 1 for upvote, -1 for downvote',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./app.mjs', './app/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
