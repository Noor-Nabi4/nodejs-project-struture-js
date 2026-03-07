import swaggerJsdoc from "swagger-jsdoc";
import config from "./index.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory Management API",
      version: "1.0.0",
      description: "REST API with JWT auth and user management",
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: "Development",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "authToken" },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["ADMIN", "USER"] },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {},
          },
        },
      },
    },
    paths: {
      "/auth/signup": {
        post: {
          summary: "Register",
          tags: ["Auth"],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "firstName",
                    "lastName",
                    "username",
                    "email",
                    "phoneNumber",
                    "password",
                  ],
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    username: { type: "string" },
                    email: { type: "string", format: "email" },
                    phoneNumber: { type: "string" },
                    password: { type: "string", format: "password" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "User created" } },
        },
      },
      "/auth/signin": {
        post: {
          summary: "Login",
          tags: ["Auth"],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Sets authToken cookie, returns user and token",
            },
          },
        },
      },
      "/auth/signout": {
        get: {
          summary: "Sign out",
          tags: ["Auth"],
          responses: { 200: { description: "Cookie cleared, signed out" } },
        },
      },
      "/auth/me": {
        get: {
          summary: "Get current user",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Current user" } },
        },
      },
      "/auth/password/forgot": {
        post: {
          summary: "Request password reset",
          tags: ["Auth"],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: { email: { type: "string", format: "email" } },
                },
              },
            },
          },
          responses: {
            200: { description: "If email exists, reset link sent" },
          },
        },
      },
      "/auth/password/reset/:token": {
        put: {
          summary: "Reset password with token",
          tags: ["Auth"],
          parameters: [
            {
              name: "token",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["password", "confirmPassword"],
                  properties: {
                    password: { type: "string", format: "password" },
                    confirmPassword: { type: "string", format: "password" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Password reset" } },
        },
      },
      "/auth/password/change": {
        patch: {
          summary: "Change password (authenticated)",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["oldPassword", "password"],
                  properties: {
                    oldPassword: { type: "string", format: "password" },
                    password: { type: "string", format: "password" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Password changed" } },
        },
      },
      "/users/profile": {
        get: {
          summary: "Get profile",
          tags: ["Users"],
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Current user profile" } },
        },
        put: {
          summary: "Update profile",
          tags: ["Users"],
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    username: { type: "string" },
                    email: { type: "string" },
                    phoneNumber: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Profile updated" } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
