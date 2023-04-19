const { Worker } = require('worker_threads');
const { sendResetPasswordEmail } = require("../config/email");
const worker = new Worker("./config/workers.js");


worker.on('message', (message) => {
  console.log(message);
});

worker.on('error', (error) => {
  console.error(error);
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Worker stopped with exit code ${code}`);
  }
});

const sendPasswordResetEmailInBackground = async (token, email) => {
  try {
    await sendResetPasswordEmail(token, email);
  } catch (error) {
    console.error("Error sending password reset email in background:", error);
  }
};

module.exports = { sendPasswordResetEmailInBackground };
