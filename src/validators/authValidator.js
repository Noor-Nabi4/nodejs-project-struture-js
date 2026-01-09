/**
 * Validation schemas and middleware for authentication routes
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate signup request
 */
export const validateSignup = (req, res, next) => {
  const { firstName, lastName, username, email, password, phoneNumber } = req.body;
  const errors = [];

  if (!firstName || firstName.trim().length < 2) {
    errors.push("First name is required and must be at least 2 characters");
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push("Last name is required and must be at least 2 characters");
  }

  if (!username || username.trim().length < 3) {
    errors.push("Username is required and must be at least 3 characters");
  }

  if (!email || !validateEmail(email)) {
    errors.push("Valid email is required");
  }

  if (!password || !validatePassword(password)) {
    errors.push(
      "Password must be at least 8 characters with uppercase, lowercase, and number"
    );
  }

  if (!phoneNumber || phoneNumber.trim().length < 10) {
    errors.push("Valid phone number is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

/**
 * Validate signin request
 */
export const validateSignin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push("Email or username is required");
  }

  if (!password || password.length === 0) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

/**
 * Validate forgot password request
 */
export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push("Valid email is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

/**
 * Validate reset password request
 */
export const validateResetPassword = (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  const errors = [];

  if (!token) {
    errors.push("Reset token is required");
  }

  if (!password || !validatePassword(password)) {
    errors.push(
      "Password must be at least 8 characters with uppercase, lowercase, and number"
    );
  }

  if (password !== confirmPassword) {
    errors.push("Password and confirm password must match");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

/**
 * Validate change password request
 */
export const validateChangePassword = (req, res, next) => {
  const { oldPassword, password, confirmPassword } = req.body;
  const errors = [];

  if (!oldPassword) {
    errors.push("Old password is required");
  }

  if (!password || !validatePassword(password)) {
    errors.push(
      "Password must be at least 8 characters with uppercase, lowercase, and number"
    );
  }

  if (password !== confirmPassword) {
    errors.push("Password and confirm password must match");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

