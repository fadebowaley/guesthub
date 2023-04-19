const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");



// set up transporter
const transporter = nodemailer.createTransport({
  service: "sendinblue",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  host: process.env.MAIL_SERVER,
  port: process.env.MAIL_PORT,
});


// const sendResetPasswordEmail = async (token, email) => {
//   try {
//     const templatePath = path.join(
//       __dirname,
//       "../views/emails/password-reset.ejs"
//     );
//     const html = await ejs.renderFile(templatePath, { token });

//     await transporter.sendMail({
//       from: process.env.DEFAULT_SENDER,
//       to: email,
//       subject: "Password Reset",
//       html: html,
//     });

//     if (parentPort) {
//       parentPort.postMessage({
//         status: "success",
//         message: "Password reset email sent successfully.",
//       });
//     }
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     if (parentPort) {
//       parentPort.postMessage({
//         status: "error",
//         message: "Error sending password reset email.",
//       });
//     }
//     throw error;
//   }
// };


const sendResetPasswordEmail = async (token, email) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/emails/password-reset.ejs"
    );
    const html = await ejs.renderFile(templatePath, { token });

    await transporter.sendMail({
      from: process.env.DEFAULT_SENDER,
      to: email,
      subject: "Password Reset",
      html: html,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};


const sendOrderCompletionEmail = async (email, orderNumber) => {
  try {
    // send mail with defined transport object
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Order Completed",
      text: `Your order with order number ${orderNumber} has been completed.`,
    });
  } catch (error) {
    console.log(error);
  }
};



const sendUserSignupEmail = async (email) => {
  try {
    // send mail with defined transport object
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Thank you for signing up",
      text: "Welcome to our website! We're excited to have you as a new user.",
    });
  } catch (error) {
    console.log(error);
  }
};



const sendPromotionalEmail = async (email) => {
  try {
    // send mail with defined transport object
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "New promotion",
      text: "We have a new promotion just for you! Check it out now.",
    });
  } catch (error) {
    console.log(error);
  }
};


const sendContactFormEmail = async (name, email, phone, subject, message) => {
  try {
    // send mail with defined transport object
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.FEEDBACK_EMAIL,
      subject: "New contact form submission",
      html: `
        <h3>New Equiry Form  Submission </h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Email:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  sendResetPasswordEmail,
  sendOrderCompletionEmail,
  sendUserSignupEmail,
  sendPromotionalEmail,
  sendContactFormEmail,
};
