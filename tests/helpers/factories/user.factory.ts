import User from "../../../src/models/userModel.js";
import { USER_ROLES } from "../../../src/config/constants.js";
import type { UserRole } from "../../../src/config/constants.js";
import type { CreateUserPayload } from "../../../src/types/user.types.js";
import type { IUserDocument } from "../../../src/types/user.types.js";

let sequence = 0;

const uniqueSuffix = (): string => {
  sequence += 1;
  return `${Date.now()}_${sequence}`;
};

export const buildSignupPayload = (
  overrides: Partial<CreateUserPayload> = {}
): CreateUserPayload => {
  const suffix = uniqueSuffix();
  return {
    firstName: "Test",
    lastName: "User",
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    phoneNumber: "1234567890",
    password: "password123",
    ...overrides,
  };
};

export const createUserInDb = async (
  overrides: Partial<CreateUserPayload> & { role?: UserRole } = {}
): Promise<IUserDocument> => {
  const { role, ...payloadOverrides } = overrides;
  const payload = buildSignupPayload(payloadOverrides);
  const user = new User({
    ...payload,
    role: role ?? USER_ROLES.USER,
  });
  return user.save();
};

export const buildAdminSignupPayload = (
  overrides: Partial<CreateUserPayload> = {}
): CreateUserPayload => buildSignupPayload(overrides);

export const createAdminInDb = async (
  overrides: Partial<CreateUserPayload> = {}
): Promise<IUserDocument> =>
  createUserInDb({ ...overrides, role: USER_ROLES.ADMIN });
