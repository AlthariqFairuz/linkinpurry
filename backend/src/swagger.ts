import type { OpenAPI } from 'openapi-types';

export const swaggerConfig: OpenAPI.Document = {
  openapi: '3.0.0',
  info: {
    title: 'LinkInPurry API Documentation',
    version: '1.0.0',
    description: 'API documentation for LinkInPurry - A Professional Social Network Platform',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'jwt'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          fullName: { type: 'string' },
          skills: { type: 'string' },
          workHistory: { type: 'string' },
          profilePhotoPath: { type: 'string' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password', 'confirmPassword'],
        properties: {
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          confirmPassword: { type: 'string', format: 'password' },
          fullName: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/api/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login to the application',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful login',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    body: {
                      type: 'object',
                      properties: {
                        token: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful registration'
          }
        }
      }
    },
    '/api/profile/{id}': {
      get: {
        tags: ['Profile'],
        summary: 'Get user profile',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        security: [
          { cookieAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Profile retrieved successfully'
          }
        }
      },
      put: {
        tags: ['Profile'],
        summary: 'Update user profile',
        security: [
          { cookieAuth: [] }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  username: { type: 'string' },
                  skills: { type: 'string' },
                  workHistory: { type: 'string' },
                  photo: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Profile updated successfully'
          }
        }
      }
    },
    '/api/users/search': {
      get: {
        tags: ['Users'],
        summary: 'Search users',
        parameters: [
          {
            name: 'q',
            in: 'query',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Search results retrieved successfully'
          }
        }
      }
    },
    '/api/network/unconnected': {
      get: {
        tags: ['Network'],
        summary: 'Get unconnected users',
        security: [
          { cookieAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Unconnected users retrieved successfully'
          }
        }
      }
    },
    '/api/network/requested': {
      get: {
        tags: ['Network'],
        summary: 'Get users with pending outgoing connection requests',
        security: [
          { cookieAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Requested connections retrieved successfully'
          }
        }
      }
    },
    '/api/network/incoming-requests': {
      get: {
        tags: ['Network'],
        summary: 'Get incoming connection requests',
        security: [
          { cookieAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Incoming requests retrieved successfully'
          }
        }
      }
    },
    '/api/network/connected': {
      get: {
        tags: ['Network'],
        summary: 'Get connected users',
        security: [
          { cookieAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Connected users retrieved successfully'
          }
        }
      }
    },
    '/api/request/{id}': {
      post: {
        tags: ['Network'],
        summary: 'Send connection request',
        security: [
          { cookieAuth: [] }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Connection request sent successfully'
          }
        }
      }
    }
  }
};