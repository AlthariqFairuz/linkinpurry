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
      UserData: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          id: { type: 'string' },
          email: { type: 'string' },
          username: { type: 'string' },
          fullName: { type: 'string' },
        }
      },
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
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' }
        }
      },
      Profile: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          username: { type: 'string' },
          fullName: { type: 'string' },
          skills: { type: 'string' },
          workHistory: { type: 'string' },
          profilePhotoPath: { type: 'string' },
          connections: { type: 'string' }
        }
      },
      Chat: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          timestamp: { type: 'string' },
          fromId: { type: 'string' },
          toId: { type: 'string' },
          message: { type: 'string' },
          read: { type: 'boolean' },
          readAt: { type: 'string' }
        }
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string'},
          userId: { type: 'string'},
          content: { type: 'string'},
          createdAt: { type: 'string'},
          updatedAt: { type: 'string'},
          user: {
            type: 'object',
            properties: {
              fullName: { type: 'string'},
              profilePhotoPath: { type: 'string'}
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/verify': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify token & Get user data',
        security: [
          { cookieAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Token verified',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    body: { 
                      $ref: '#/components/schemas/UserData'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Failed operation'
          }
        }
      }
    },
    '/api/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        responses: {
          '200': {
            description: 'Logged out successfully'
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
            description: 'Registration Successful'
          },
          '400': {
            description: 'Failed operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    body: { 
                      oneOf: [
                        {
                          type: "object",
                          properties: {
                            field: {type: 'string'},
                            message: {type: 'string'}
                          }
                        }, {
                          type: 'object',
                          nullable: true
                        } 
                      ]
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Registration failed'
          }
        }
      }
    },
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
          },
          '400': {
            description: 'Email and password are required'
          },
          '401': {
            description: 'Invalid credentials'
          },
          '500': {
            description: 'Registration failed'
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
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    body: {
                      // TODO write examples
                      oneOf: [
                        {
                          $ref: '#/components/schemas/Profile'
                        }, 
                        {
                          type: 'object',
                          properties: {
                            fullName: { type: 'string' },
                            skills: { type: 'string' },
                            workHistory: { type: 'string' },
                            profilePhotoPath: { type: 'string' },
                            connections: { type: 'string' }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Invalid user'
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
            description: 'Profile updated successfully',
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
                        fullName: { type: 'string' },
                        username: { type: 'string' },
                        skills: { type: 'string' },
                        workHistory: { type: 'string' },
                        profilePhotoPath: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request'
          },
          '401': {
            description: 'Unauthorized request'
          },
          '500': {
            description: 'Failed operation'
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
            description: 'Search results retrieved successfully',
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
                        id: {type: 'string' },
                        username: { type: 'string' },
                        fullName: { type: 'string' },
                        profilePhotoPath: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Failed to perform search'
          }
        }
      }
    },
    '/api/connection-status/{id}': {
      get: {
        tags: ['Profile'],
        summary: 'Get profile connection status',
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
            description: 'Successful operation',
          },
          '401': {
            description: 'Failed operation'
          }
        }
      },
    },
    '/api/network/all-users': {
      get: {
        tags: ['Network'],
        summary: 'Get all users',
        security: [
          { cookieAuth: [] }
        ],
        responses: {
          '200': {
            description: 'All users retrieved successfully',
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
                        connection: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              fullName: { type: 'string' },
                              username: { type: 'string' },
                              skills: { type: 'string' },
                              workHistory: { type: 'string' },
                              profilePhotoPath: { type: 'string' }
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
          '401': {
            description: 'Failed operation'
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
            description: 'Unconnected users retrieved successfully',
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
                        connection: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {type: 'string' },
                              username: { type: 'string' },
                              fullName: { type: 'string' },
                              profilePhotoPath: { type: 'string' }
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
          '401': {
            description: 'Failed operation'
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
            description: 'Requested connections retrieved successfully',
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
                        connection: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {type: 'string' },
                              fullName: { type: 'string' },
                              username: { type: 'string' },
                              skills: { type: 'string' },
                              workHistory: { type: 'string' },
                              profilePhotoPath: { type: 'string' }
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
          '401': {
            description: 'Failed operation'
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
            description: 'Incoming requests retrieved successfully',
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
                        connection: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {type: 'string' },
                              fullName: { type: 'string' },
                              username: { type: 'string' },
                              skills: { type: 'string' },
                              workHistory: { type: 'string' },
                              profilePhotoPath: { type: 'string' }
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
          '401': {
            description: 'Failed operation'
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
            description: 'Connected users retrieved successfully',
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
                        connection: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {type: 'string' },
                              fullName: { type: 'string' },
                              username: { type: 'string' },
                              skills: { type: 'string' },
                              workHistory: { type: 'string' },
                              profilePhotoPath: { type: 'string' }
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
          '401': {
            description: 'Failed operation'
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
          },
          '400': {
            description: 'Bad request'
          },
          '401': {
            description: 'Failed operation'
          }
        }
      }
    },
    '/api/accept-request/{id}': {
      post: {
        tags: ['Network'],
        summary: 'Accept incoming connection request',
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
            description: 'Connection accepted'
          },
          '400': {
            description: 'Bad request'
          },
          '401': {
            description: 'Unauthorized request'
          },
          '500': {
            description: 'Failed operation'
          }
        }
      }
    },
    '/api/decline-request/{id}': {
      post: {
        tags: ['Network'],
        summary: 'Decline incoming connection request',
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
            description: 'Request declined'
          },
          '401': {
            description: 'Unauthorized request'
          },
          '500': {
            description: 'Failed to decline request'
          }
        }
      }
    },
    '/api/disconnect/{id}': {
      post: {
        tags: ['Network'],
        summary: 'Remove connection',
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
            description: 'Connection removed successfully'
          },
          '401': {
            description: 'Unauthorized request'
          },
          '404': {
            description: 'Connection not found'
          },
          '500': {
            description: 'Failed to remove connection'
          }
        }
      }
    },
    '/api/chat/history/{userId}': {
      get: {
        tags: ['Chat'],
        summary: 'Get chat history',
        security: [
          { cookieAuth: [] }
        ],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Chat history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    body: {
                      $ref: '#/components/schemas/Chat'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized request'
          },
          '500': {
            description: 'Failed to fetch chat history'
          }
        }
      }
    },
    '/api/feed': {
      get: {
        tags: ['Feed'],
        summary: 'Get posts',
        security: [
          { cookieAuth: [] }
        ],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: true,
            schema: {
              type: 'integer'
            }
          },
          {
            name: 'cursor',
            in: 'query',
            schema: {
              type: 'integer'
            }
          }
        ],
        responses: {
          '200': {
            description: '"Feed data successfully fetched',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    body: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Post'
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'No token found'
          },
          '500': {
            description: 'Failed to fetch feed'
          }
        }
      },
      post: {
        tags: ['Feed'],
        summary: 'Create new post',
        security: [
          { cookieAuth: [] }
        ],
        requestBody: {
          required: true,
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Feed Post Successful'
          },
          '401': {
            description: 'No token found'
          },
          '500': {
            description: 'Failed to post feed'
          }
        }
      },
      put: {
        tags: ['Feed'],
        summary: 'Edit post',
        security: [
          { cookieAuth: [] }
        ],
        parameters: [
          {
            name: 'post_id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Feed Update Successful'
          },
          '401': {
            description: 'No token found'
          },
          '500': {
            description: 'Failed to update feed'
          }
        }
      },
      delete: {
        tags: ['Feed'],
        summary: 'Delete post',
        security: [
          { cookieAuth: [] }
        ],
        parameters: [
          {
            name: 'post_id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Feed Delete Successful'
          },
          '401': {
            description: 'No token found'
          },
          '500': {
            description: 'Failed to update feed'
          }
        }
      }
    }, 
    '/vapid-public-key': {
      get: {
        summary: 'Get VAPID Public Key',
        responses: {
          200: {
            description: 'Successfully get VAPID Public key',
          },
        },
      },
    },
    '/subscribe': {
      post: {
        summary: 'Save Push Subscription',
        responses: { 
          201: { 
            description: 'Subscription saved' 
          } 
        },
      },
    },
    '/send-notif-post': {
      post: {
        summary: 'Send Notification to a User',
        responses: {
          201: {
            description: 'Notification sent' 
          } 
        },
      },
    },
  },
};