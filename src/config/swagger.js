const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Rapido Corporate Ride Booking API',
    version: '1.0.0',
    description: `
      **Professional REST API for Rapido's Corporate Ride Booking System**
      
      This comprehensive API provides complete functionality for corporate ride management including:
      - User authentication and profile management
      - Ride booking and management workflows
      - Admin approval and rejection system
      - Advanced analytics and reporting
      - Role-based access control
      
      ## Authentication
      This API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
      \`\`\`
      Authorization: Bearer <your_jwt_token>
      \`\`\`
      
      ## Rate Limiting
      API requests are limited to 100 requests per 15-minute window per IP address.
      
      ## Response Format
      All API responses follow a consistent format:
      \`\`\`json
      {
        "success": true,
        "message": "Success message",
        "data": { ... },
        "pagination": { ... } // for paginated results
      }
      \`\`\`
    `,
    contact: {
      name: 'Rapido API Support',
      email: 'api-support@rapido.bike',
      url: 'https://rapido.bike/support'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    },
    termsOfService: 'https://rapido.bike/terms',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://api.rapido.bike',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login endpoint'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password', 'phone', 'employeeId', 'department'],
        properties: {
          _id: {
            type: 'string',
            description: 'Unique identifier for the user',
            example: '60d5ecb74d8b8e001c8e4b1a'
          },
          firstName: {
            type: 'string',
            description: 'First name of the user',
            example: 'John',
            minLength: 2,
            maxLength: 50
          },
          lastName: {
            type: 'string',
            description: 'Last name of the user',
            example: 'Doe',
            minLength: 2,
            maxLength: 50
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address (must be unique)',
            example: 'john.doe@company.com'
          },
          phone: {
            type: 'string',
            description: 'Phone number with country code',
            example: '+91-9876543210',
            pattern: '^\\+?[1-9]\\d{1,14}$'
          },
          employeeId: {
            type: 'string',
            description: 'Unique employee identifier',
            example: 'EMP001',
            minLength: 3,
            maxLength: 20
          },
          department: {
            type: 'string',
            description: 'Department name',
            example: 'Engineering',
            enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
          },
          role: {
            type: 'string',
            description: 'User role for access control',
            example: 'user',
            enum: ['user', 'admin'],
            default: 'user'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the user account is active',
            example: true,
            default: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp',
            example: '2024-01-15T10:30:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2024-01-15T10:30:00.000Z'
          }
        }
      },
      UserRegistration: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password', 'phone', 'employeeId', 'department'],
        properties: {
          firstName: {
            type: 'string',
            example: 'John',
            minLength: 2,
            maxLength: 50
          },
          lastName: {
            type: 'string',
            example: 'Doe',
            minLength: 2,
            maxLength: 50
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@company.com'
          },
          password: {
            type: 'string',
            example: 'SecurePass123!',
            minLength: 8,
            description: 'Password must be at least 8 characters with mix of letters, numbers, and symbols'
          },
          phone: {
            type: 'string',
            example: '+91-9876543210'
          },
          employeeId: {
            type: 'string',
            example: 'EMP001',
            minLength: 3,
            maxLength: 20
          },
          department: {
            type: 'string',
            example: 'Engineering',
            enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
          },
          role: {
            type: 'string',
            example: 'user',
            enum: ['user', 'admin'],
            default: 'user'
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
      Location: {
        type: 'object',
        required: ['address', 'latitude', 'longitude'],
        properties: {
          address: {
            type: 'string',
            description: 'Full address',
            example: 'Office Building A, Sector 5, Bangalore'
          },
          latitude: {
            type: 'number',
            format: 'double',
            description: 'Latitude coordinate',
            example: 12.9716,
            minimum: -90,
            maximum: 90
          },
          longitude: {
            type: 'number',
            format: 'double',
            description: 'Longitude coordinate',
            example: 77.5946,
            minimum: -180,
            maximum: 180
          },
          landmark: {
            type: 'string',
            description: 'Nearby landmark (optional)',
            example: 'Near Metro Station'
          }
        }
      },
      Ride: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique ride identifier',
            example: '60d5ecb74d8b8e001c8e4b1b'
          },
          userId: {
            $ref: '#/components/schemas/User'
          },
          pickup: {
            $ref: '#/components/schemas/Location'
          },
          drop: {
            $ref: '#/components/schemas/Location'
          },
          scheduleTime: {
            type: 'string',
            format: 'date-time',
            description: 'Scheduled pickup time',
            example: '2024-01-15T10:30:00.000Z'
          },
          status: {
            type: 'string',
            description: 'Current ride status',
            example: 'pending',
            enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled']
          },
          estimatedFare: {
            type: 'number',
            description: 'Estimated fare in INR',
            example: 250.00,
            minimum: 0
          },
          actualFare: {
            type: 'number',
            description: 'Actual fare charged',
            example: 245.50,
            minimum: 0
          },
          driver: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                example: 'Ravi Kumar'
              },
              phone: {
                type: 'string',
                example: '+91-9876543210'
              },
              vehicleNumber: {
                type: 'string',
                example: 'KA-01-AB-1234'
              },
              rating: {
                type: 'number',
                example: 4.8,
                minimum: 1,
                maximum: 5
              }
            }
          },
          approvedBy: {
            type: 'string',
            description: 'Admin who approved the ride',
            example: '60d5ecb74d8b8e001c8e4b1c'
          },
          rejectedBy: {
            type: 'string',
            description: 'Admin who rejected the ride',
            example: '60d5ecb74d8b8e001c8e4b1c'
          },
          approvedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T09:30:00.000Z'
          },
          rejectedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T09:30:00.000Z'
          },
          rejectionReason: {
            type: 'string',
            example: 'Budget constraints for this month'
          },
          adminComments: {
            type: 'string',
            example: 'Approved for client meeting'
          },
          feedback: {
            type: 'object',
            properties: {
              rating: {
                type: 'number',
                minimum: 1,
                maximum: 5,
                example: 4
              },
              comment: {
                type: 'string',
                example: 'Good service, driver was punctual'
              }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T08:30:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z'
          }
        }
      },
      RideRequest: {
        type: 'object',
        required: ['pickup', 'drop', 'scheduleTime'],
        properties: {
          pickup: {
            $ref: '#/components/schemas/Location'
          },
          drop: {
            $ref: '#/components/schemas/Location'
          },
          scheduleTime: {
            type: 'string',
            format: 'date-time',
            description: 'Scheduled pickup time (must be future)',
            example: '2024-01-15T10:30:00.000Z'
          },
          purpose: {
            type: 'string',
            description: 'Purpose of the ride',
            example: 'Client meeting at airport'
          },
          specialRequirements: {
            type: 'string',
            description: 'Any special requirements',
            example: 'Need AC car, urgent'
          }
        }
      },
      AdminAction: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '60d5ecb74d8b8e001c8e4b1d'
          },
          adminId: {
            type: 'string',
            description: 'Admin who performed the action',
            example: '60d5ecb74d8b8e001c8e4b1c'
          },
          action: {
            type: 'string',
            description: 'Type of action performed',
            example: 'approve_ride',
            enum: ['approve_ride', 'reject_ride', 'create_user', 'update_user', 'delete_user']
          },
          targetType: {
            type: 'string',
            description: 'Type of target entity',
            example: 'Ride',
            enum: ['User', 'Ride']
          },
          targetId: {
            type: 'string',
            description: 'ID of the target entity',
            example: '60d5ecb74d8b8e001c8e4b1b'
          },
          details: {
            type: 'object',
            description: 'Additional action details',
            example: {
              rideId: '60d5ecb74d8b8e001c8e4b1b',
              userId: '60d5ecb74d8b8e001c8e4b1a',
              comments: 'Approved for business purpose'
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z'
          }
        }
      },
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
            type: 'object',
            description: 'Response data (varies by endpoint)'
          }
        }
      },
      PaginatedResponse: {
        allOf: [
          {
            $ref: '#/components/schemas/ApiResponse'
          },
          {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: 'Number of items in current page',
                example: 10
              },
              total: {
                type: 'number',
                description: 'Total number of items',
                example: 125
              },
              pagination: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                    example: 1
                  },
                  limit: {
                    type: 'number',
                    example: 10
                  },
                  totalPages: {
                    type: 'number',
                    example: 13
                  }
                }
              }
            }
          }
        ]
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
            example: 'Error description'
          },
          error: {
            type: 'string',
            description: 'Detailed error information (development mode only)',
            example: 'Validation failed: email is required'
          }
        }
      },
      Analytics: {
        type: 'object',
        properties: {
          summary: {
            type: 'object',
            properties: {
              totalRides: {
                type: 'number',
                example: 1250
              },
              pendingRides: {
                type: 'number',
                example: 45
              },
              approvedRides: {
                type: 'number',
                example: 980
              },
              rejectedRides: {
                type: 'number',
                example: 125
              },
              completedRides: {
                type: 'number',
                example: 950
              },
              cancelledRides: {
                type: 'number',
                example: 100
              },
              approvalRate: {
                type: 'string',
                example: '78.40'
              }
            }
          },
          departmentAnalytics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  example: 'Engineering'
                },
                totalRides: {
                  type: 'number',
                  example: 450
                },
                totalFare: {
                  type: 'number',
                  example: 112500
                },
                avgFare: {
                  type: 'number',
                  example: 250
                }
              }
            }
          },
          monthlyAnalytics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'object',
                  properties: {
                    year: {
                      type: 'number',
                      example: 2024
                    },
                    month: {
                      type: 'number',
                      example: 1
                    },
                    status: {
                      type: 'string',
                      example: 'completed'
                    }
                  }
                },
                count: {
                  type: 'number',
                  example: 85
                },
                totalFare: {
                  type: 'number',
                  example: 21250
                }
              }
            }
          },
          fareAnalytics: {
            type: 'object',
            properties: {
              totalFare: {
                type: 'number',
                example: 312500
              },
              avgFare: {
                type: 'number',
                example: 250
              },
              maxFare: {
                type: 'number',
                example: 850
              },
              minFare: {
                type: 'number',
                example: 100
              }
            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication information is missing or invalid',
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
        description: 'Access denied. Insufficient permissions.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              message: 'Access denied. Insufficient permissions.'
            }
          }
        }
      },
      NotFoundError: {
        description: 'The requested resource was not found',
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
      ValidationError: {
        description: 'Validation error in request data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              message: 'Validation failed',
              error: 'email is required'
            }
          }
        }
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
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
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and profile management endpoints',
      externalDocs: {
        description: 'Learn more about authentication',
        url: 'https://rapido.bike/docs/auth'
      }
    },
    {
      name: 'Rides',
      description: 'Ride booking and management operations for employees',
      externalDocs: {
        description: 'Ride booking guide',
        url: 'https://rapido.bike/docs/rides'
      }
    },
    {
      name: 'User Management',
      description: 'User CRUD operations (Admin only)',
      externalDocs: {
        description: 'User management guide',
        url: 'https://rapido.bike/docs/users'
      }
    },
    {
      name: 'Admin',
      description: 'Administrative functions, ride approval, and analytics',
      externalDocs: {
        description: 'Admin dashboard guide',
        url: 'https://rapido.bike/docs/admin'
      }
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs;
