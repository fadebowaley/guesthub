
const { sendResetPasswordEmail, sendVerificationEmail } = require("../middleware/email");

const sendPasswordResetEmailInBackground = async (token, email) => {
  try {
   sendResetPasswordEmail(token, email);
    console.log("Password reset email sent in the background");
  } catch (error) {
    console.error("Error sending password reset email in background:", error);
  }
};
const sendVerificationEmailInBackground = async (token, email) => {
  try {
   sendVerificationEmail(token, email);
    console.log("verification email sent in the background");
  } catch (error) {
    console.error("Error sending password reset email in background:", error);
  }
};

module.exports = {
  sendPasswordResetEmailInBackground,
  sendVerificationEmailInBackground,
};
