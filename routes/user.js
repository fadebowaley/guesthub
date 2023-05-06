const express = require("express");
const router = express.Router();
const csrf = require("csurf");
var passport = require("passport");
const bcrypt = require("bcrypt-nodejs");
var LocalStrategy = require("passport-local").Strategy;
const Product = require("../models/product");
const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");

const middleware = require("../middleware/confirm");

// function to generate Token
function generateToken() {
  return require("crypto").randomBytes(20).toString("hex");
}

const {
  userSignUpValidationRules,
  userSignInValidationRules,
  validateSignup,
  validateSignin,
} = require("../middleware/validator");
const csrfProtection = csrf();
router.use(csrfProtection);

const {
  sendPasswordResetEmailInBackground,
  sendVerificationEmailInBackground,
} = require("../worker/workers");

//send a verification email
async function sendVerificationEmail(email) {
  // Check if the user exists in the database
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User does not exist");
  }
  // Generate a new token and save it to the user's record in the database
  const token = generateToken();
  user.emailVerificationToken = token;
  user.emailVerificationTokenExpiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ); // Token expires in 24 hours
  await user.save();

  // Send the verification email to the user
  await sendVerificationEmailInBackground(token, email);
}

// Get password request for rest
router.get("/request-password", middleware.isNotLoggedIn, (req, res) => {
  const errorMsg = req.flash("error")[0];
  const successMsg = req.flash("success")[0];
  res.render("user/requestPassword", {
    csrfToken: req.csrfToken(),
    errorMsg,
    successMsg,
    pageName: "Reset Password",
  });
});

router.post("/forgot", async (req, res, next) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Sorry Email not found.");
      return res.redirect("/user/request-password");
    }

    // Generate a random token for password reset
    const token = generateToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    sendPasswordResetEmailInBackground(token, email);
    req.flash(
      "success",
      "An email has been sent to " + email + " with further instructions."
    );
    res.redirect("/user/request-password");
  } catch (error) {
    console.error("Error resetting password:", error);
    next(error);
  }
});

//Reset token from the email
router.get("/reset/:token", async (req, res, next) => {
  try {
    // Find user with matching reset token
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // If no user found, token is invalid or has expired
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/user/request-password");
    }

    // Render password reset form
    res.render("user/reset", {
      token: req.params.token,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    next(error);
  }
});

router.post("/reset/:token", async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/user/request-password");
    }
    if (req.body.password !== req.body.password2) {
      req.flash("error", "Passwords do not match.");
      return res.redirect(`/user/reset/${req.params.token}`);
    }
    console.log(user);
    console.log(req.body.password);

    user.setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    req.flash("success", "Password has been reset.");
    res.redirect("/user/login");
  } catch (error) {
    console.error("Error resetting password:", error);
    next(error);
  }
});

// GET: display the signup form with csrf token
router.get("/register", middleware.isNotLoggedIn, (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("user/register", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Sign Up",
  });
});

// Resend verification email
router.get(
  "/resend-verification-email",
  middleware.isLoggedIn,
  async (req, res) => {
    try {
      // Send verification email to the logged-in user's email
      await sendVerificationEmail(req.user.email);
      req.flash("success", "Verification email has been resent.");
      res.redirect("/activate-your-account");
    } catch (err) {
      console.log(err);
      req.flash(
        "error",
        "Unable to resend verification email. Please try again later."
      );
      res.redirect("/activate-your-account");
    }
  }
);

// Confirm and verify email address
router.get("/verify/:token", async (req, res, next) => {
  try {
    // Find user with matching reset token
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationTokenExpiresAt: { $gt: Date.now() },
    });

    // If no user found, token is invalid or has expired
    if (!user) {
      req.flash("error", "Activation link is invalid or has expired.");
      return res.redirect("/resend-verification-email");
    }

    // update users and save
    user.emailVerifiedAt = Date.now();
    user.emailVerified = true;
   // Token expires in 24 hours
    await user.save();


  } catch (error) {
    console.error("Error resetting password:", error);
    next(error);
  }
});

router.post(
  "/signup",
  [
    middleware.isNotLoggedIn,
    userSignUpValidationRules(),
    validateSignup,
    passport.authenticate("local.signup", {
      successRedirect: "/activate-your-account",
      failureRedirect: "/user/register",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    try {
      // generate a verification token
      if (req.user.email && !req.user.emailVerified) {
        sendVerificationEmail(req.user.email);
      }
      //if there is cart session, save it to the user's cart in db
      if (req.session.cart) {
        const cart = await new Cart(req.session.cart);
        cart.user = req.user._id;
        await cart.save();
      }
      // redirect to the previous URL
      if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect("/user/profile");
      }
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/");
    }
  }
);

router.get("/verify/:token", async (req, res, next) => {
  try {
    // Find the user with the verification token
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Invalid verification token");
      return res.redirect("/user/login");
    }
    // Set the user's email as verified and remove the verification token
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerifiedAt = Date.now();
    await user.save();
    req.flash("success", "Email verification successful! You can now log in.");
    return res.redirect("/user/login");
  } catch (error) {
    console.error("Error verifying email:", error);
    next(error);
  }
});

// GET: display the signin form with csrf token
router.get("/login", middleware.isNotLoggedIn, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("user/login", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Sign In",
  });
});

// POST: handle the signin logic

// router.post(
//   "/signin",
//   [
//     middleware.isNotLoggedIn,
//     userSignInValidationRules(),
//     validateSignin,
//     passport.authenticate("local.signin", {
//       failureRedirect: "/user/login",
//       failureFlash: true,
//     }),
//   ],
//   async (req, res) => {
//     try {
//       // cart logic when the user logs in
//       const cart = await Cart.findOneAndUpdate(
//         { user: req.user._id },
//         req.session.cart,
//         { upsert: true, new: true }
//       );
//       req.session.cart = cart || req.session.cart;

//       // redirect to appropriate URL based on user role
//       if (req.user.role === "admin") {
//         res.redirect("/admin/dashboard");
//       } else if (req.session.oldUrl) {
//         res.redirect(req.session.oldUrl);
//         req.session.oldUrl = null;
//       } else {
//         res.redirect("/user/profile");
//       }
//     } catch (err) {
//       console.log(err);
//       req.flash("error", err.message);
//       res.redirect("/");
//     }
//   }
// );

router.post(
  "/signin",
  [
    middleware.isNotLoggedIn,
    userSignInValidationRules(),
    validateSignin,
    passport.authenticate("local.signin", {
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    middleware.emailVerified, // Only authenticate user if email is verified
  ],
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      // cart logic when the user logs in
      const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        req.session.cart,
        { upsert: true, new: true }
      );
      req.session.cart = cart || req.session.cart;

      // redirect to appropriate URL based on user role
      if (req.user.role === "admin") {
        res.redirect("/admin/dashboard");
      } else if (req.session.oldUrl) {
        res.redirect(req.session.oldUrl);
        req.session.oldUrl = null;
      } else {
        res.redirect("/user/profile");
      }
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      res.redirect("/");
    }
  }
);

// GET: display user's profile
router.get("/profile", middleware.isLoggedIn, async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  try {
    // find all orders of this user
    allOrders = await Order.find({ user: req.user });
    res.render("user/profile", {
      orders: allOrders,
      errorMsg,
      successMsg,
      pageName: "User Profile",
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
});

// GET: display user's profile
router.get("/account", middleware.isLoggedIn, async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  try {
    // find all orders of this user
    allOrders = await Order.find({ user: req.user });
    res.render("user/account", {
      orders: allOrders,
      errorMsg,
      successMsg,
      pageName: "User Profile",
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
});

// GET: logout
router.get("/logout", middleware.isLoggedIn, (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    req.session.cart = null;
    res.redirect("/");
  });
});

module.exports = router;
