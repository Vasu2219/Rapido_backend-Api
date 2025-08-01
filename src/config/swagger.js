const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rapido Corporate API',
      version: '1.0.0',
      description: 'API for Rapido Corporate Ride Booking System',
      contact: {
        name: 'Rapido Development Team',
        email: 'support@rapido.bike'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.rapido-corporate.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d5ecb74d8b8e001c8e4b1a'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@company.com'
            },
            phone: {
              type: 'string',
              example: '+91-9876543210'
            },
            employeeId: {
              type: 'string',
              example: 'EMP001'
            },
            department: {
              type: 'string',
              enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
              example: 'Engineering'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        UserRegistration: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'phone', 'employeeId', 'department'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'John'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@company.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'SecurePass123!'
            },
            phone: {
              type: 'string',
              example: '+91-9876543210'
            },
            employeeId: {
              type: 'string',
              example: 'EMP001'
            },
            department: {
              type: 'string',
              enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
              example: 'Engineering'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              example: 'user'
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@company.com'
            },
            password: {
              type: 'string',
              example: 'SecurePass123!'
            }
          }
        },
        // Ride Schemas
        Ride: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d5ecb74d8b8e001c8e4b1b'
            },
            userId: {
              $ref: '#/components/schemas/User'
            },
            pickup: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  example: 'Office Building A, Sector 5, Bangalore'
                },
                latitude: {
                  type: 'number',
                  example: 12.9716
                },
                longitude: {
                  type: 'number',
                  example: 77.5946
                },
                landmark: {
                  type: 'string',
                  example: 'Near Metro Station'
                }
              }
            },
            drop: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  example: 'Kempegowda International Airport, Bangalore'
                },
                latitude: {
                  type: 'number',
                  example: 13.1986
                },
                longitude: {
                  type: 'number',
                  example: 77.7066
                },
                landmark: {
                  type: 'string',
                  example: 'Terminal 1'
                }
              }
            },
            scheduleTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
              example: 'pending'
            },
            estimatedFare: {
              type: 'number',
              example: 250
            },
            actualFare: {
              type: 'number',
              example: 240
            },
            purpose: {
              type: 'string',
              example: 'Client meeting at airport'
            },
            specialRequirements: {
              type: 'string',
              example: 'Need AC car'
            },
            driver: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Rajesh Kumar'
                },
                phone: {
                  type: 'string',
                  example: '+91-9876543211'
                },
                vehicle: {
                  type: 'string',
                  example: 'Toyota Innova'
                },
                rating: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  example: 4.5
                }
              }
            },
            approvedBy: {
              $ref: '#/components/schemas/User'
            },
            approvedAt: {
              type: 'string',
              format: 'date-time'
            },
            rejectedBy: {
              $ref: '#/components/schemas/User'
            },
            rejectedAt: {
              type: 'string',
              format: 'date-time'
            },
            rejectionReason: {
              type: 'string',
              example: 'No available drivers'
            },
            cancelledAt: {
              type: 'string',
              format: 'date-time'
            },
            cancellationReason: {
              type: 'string',
              example: 'Meeting cancelled'
            },
            feedback: {
              type: 'object',
              properties: {
                rating: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                  example: 5
                },
                comment: {
                  type: 'string',
                  example: 'Excellent service!'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        RideRequest: {
          type: 'object',
          required: ['pickup', 'drop', 'scheduleTime'],
          properties: {
            pickup: {
              type: 'object',
              required: ['address'],
              properties: {
                address: {
                  type: 'string',
                  example: 'Office Building A, Sector 5, Bangalore'
                },
                latitude: {
                  type: 'number',
                  example: 12.9716
                },
                longitude: {
                  type: 'number',
                  example: 77.5946
                },
                landmark: {
                  type: 'string',
                  example: 'Near Metro Station'
                }
              }
            },
            drop: {
              type: 'object',
              required: ['address'],
              properties: {
                address: {
                  type: 'string',
                  example: 'Kempegowda International Airport, Bangalore'
                },
                latitude: {
                  type: 'number',
                  example: 13.1986
                },
                longitude: {
                  type: 'number',
                  example: 77.7066
                },
                landmark: {
                  type: 'string',
                  example: 'Terminal 1'
                }
              }
            },
            scheduleTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            purpose: {
              type: 'string',
              example: 'Client meeting at airport'
            },
            specialRequirements: {
              type: 'string',
              example: 'Need AC car'
            }
          }
        },
        // Common Response Schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object'
            },
            count: {
              type: 'number',
              example: 5
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Email is required'
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Validation failed',
                errors: [
                  {
                    field: 'email',
                    message: 'Email is required'
                  }
                ]
              }
            }
          }
        },
        UnauthorizedError: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Access denied. No token provided.'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Access denied. Admin role required.'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Resource not found'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Too many requests from this IP, please try again later.'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Internal server error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Rides',
        description: 'Ride booking and management endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints for ride approval and user management'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './app.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 