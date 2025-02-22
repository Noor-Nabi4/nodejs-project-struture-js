const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // Option for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
  };

  res.status(statusCode).cookie("authToken", token, options).json({
    success: true,
    user,
    token,
  });
};

export default sendToken;
