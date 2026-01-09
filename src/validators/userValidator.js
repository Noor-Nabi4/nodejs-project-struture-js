/**
 * Validation schemas and middleware for user routes
 */

/**
 * Validate profile update request
 */
export const validateProfileUpdate = (req, res, next) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "username",
    "email",
    "phoneNumber",
  ];
  const updateData = req.body;
  const errors = [];

  // Check if any invalid fields are being updated
  const invalidFields = Object.keys(updateData).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    errors.push(`Invalid fields: ${invalidFields.join(", ")}`);
  }

  // Validate email if provided
  if (updateData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      errors.push("Invalid email format");
    }
  }

  // Validate first name if provided
  if (updateData.firstName && updateData.firstName.trim().length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  // Validate last name if provided
  if (updateData.lastName && updateData.lastName.trim().length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  // Validate username if provided
  if (updateData.username && updateData.username.trim().length < 3) {
    errors.push("Username must be at least 3 characters");
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

