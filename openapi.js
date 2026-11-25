const { states } = require('./validateTodo');

const todoSchema = { $ref: '#/components/schemas/Todo' };
const errorSchema = { $ref: '#/components/schemas/Error' };

function jsonResponse(description, schema) {
  return {
    description,
    content: {
      'application/json': { schema },
    },
  };
}

function todoBody(schemaName) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: `#/components/schemas/${schemaName}` },
      },
    },
  };
}

const todoFields = {
  title: { type: 'string', example: 'Finish REST API assignment' },
  description: { type: 'string', example: 'Test JSON and CSV' },
  state: { type: 'string', enum: states },
  dueDate: { type: 'string', format: 'date' },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Todo API',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/todos': {
      get: {
        summary: 'List todos',
        parameters: [
          {
            name: 'state',
            in: 'query',
            description: 'Filter todos by state',
            schema: { type: 'string', enum: states },
          },
        ],
        responses: {
          '200': {
            description: 'Todo list',
            content: {
              'application/json': {
                schema: { type: 'array', items: todoSchema },
              },
              'text/csv': {
                schema: { type: 'string' },
                example: 'id,title,description,state,createdAt,updatedAt',
              },
            },
          },
          '400': jsonResponse('Invalid state filter', errorSchema),
          '406': jsonResponse('Requested format is unavailable', errorSchema),
        },
      },
      post: {
        summary: 'Create a todo',
        requestBody: todoBody('TodoCreate'),
        responses: {
          '201': jsonResponse('Todo created', todoSchema),
          '400': jsonResponse('Invalid request', errorSchema),
        },
      },
    },
    '/todos/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      get: {
        summary: 'Get a todo by ID',
        responses: {
          '200': jsonResponse('Todo found', todoSchema),
          '404': jsonResponse('Todo not found', errorSchema),
        },
      },
      put: {
        summary: 'Update a todo',
        requestBody: todoBody('TodoUpdate'),
        responses: {
          '200': jsonResponse('Todo updated', todoSchema),
          '400': jsonResponse('Invalid request', errorSchema),
          '404': jsonResponse('Todo not found', errorSchema),
        },
      },
      delete: {
        summary: 'Delete a todo',
        responses: {
          '204': { description: 'Todo deleted' },
          '404': jsonResponse('Todo not found', errorSchema),
        },
      },
    },
  },
  components: {
    schemas: {
      Todo: {
        type: 'object',
        required: ['id', 'title', 'state', 'createdAt', 'updatedAt'],
        properties: {
          ...todoFields,
          id: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TodoCreate: {
        type: 'object',
        properties: todoFields,
        required: ['title'],
        additionalProperties: false,
      },
      TodoUpdate: {
        type: 'object',
        properties: todoFields,
        minProperties: 1,
        additionalProperties: false,
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string' } },
      },
    },
  },
};