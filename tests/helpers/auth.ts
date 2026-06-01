import jwt from "jsonwebtoken";
import type { Application } from "express";
import request, { type Agent } from "supertest";
import { COOKIE_NAMES } from "../../src/config/constants.js";
import type { CreateUserPayload } from "../../src/types/user.types.js";
import type { IUserDocument } from "../../src/types/user.types.js";
import { buildSignupPayload } from "./factories/user.factory.js";

const API_PREFIX = "/api/v1";

export const createAgent = (app: Application): Agent => request.agent(app);

export const signupUser = async (
  agent: Agent,
  overrides: Partial<CreateUserPayload> = {}
) => {
  const payload = buildSignupPayload(overrides);
  const response = await agent.post(`${API_PREFIX}/auth/signup`).send(payload);
  return { response, payload };
};

export const signinUser = async (
  agent: Agent,
  credentials: { email: string; password: string }
) => agent.post(`${API_PREFIX}/auth/signin`).send(credentials);

export const signupAndSignin = async (
  app: Application,
  overrides: Partial<CreateUserPayload> = {}
) => {
  const agent = createAgent(app);
  const { response: signupRes, payload } = await signupUser(agent, overrides);
  const signinRes = await signinUser(agent, {
    email: payload.email,
    password: payload.password,
  });
  return { agent, signupRes, signinRes, payload };
};

export const authCookieForUser = (user: IUserDocument): string => {
  const token = user.getJWTToken();
  return `${COOKIE_NAMES.AUTH_TOKEN}=${token}`;
};

export const invalidAuthCookie = (): string =>
  `${COOKIE_NAMES.AUTH_TOKEN}=invalid.token.value`;

export const expiredAuthCookieForUser = (user: IUserDocument): string => {
  const secret = process.env.JWT_SECRET ?? "test-jwt-secret-for-api-tests";
  const token = jwt.sign({ id: user._id.toHexString() }, secret, {
    expiresIn: "-1s",
  });
  return `${COOKIE_NAMES.AUTH_TOKEN}=${token}`;
};

export { API_PREFIX };
