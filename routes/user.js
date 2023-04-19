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

const middleware = require("../middleware");
const saltRounds = 10;

const {
  userSignUpValidationRules,
  userSignInValidationRules,
  validateSignup,
  validateSignin,
} = require("../config/validator");
const csrfProtection = csrf();
router.use(csrfProtection);


const { sendPasswordResetEmailInBackground } = require("../config/workers");



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


//post Logic to reset password

// router.post("/reset/:token", async (req, res, next) => {
//   try {
//     const user = await User.findOne({
//       resetPasswordToken: req.params.token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });
//     if (!user) {
//       req.flash("error", "Password reset token is invalid or has expired.");
//       return res.redirect("/user/request-password");
//     }
//     if (req.body.password !== req.body.password2) {
//       req.flash("error", "Passwords do not match.");
//       return res.redirect(`/user/reset/${req.params.token}`);
//     }

//     console.log(user);
//     console.log(req.body.password);

//     user.setPassword(req.body.password);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     // Call the sendPasswordResetEmailInBackground function passing the token and email
//     sendPasswordResetEmailInBackground(req.params.token, user.email);

//     req.flash("success", "Password has been reset.");
//     res.redirect("/user/login");
//   } catch (error) {
//     console.error("Error resetting password:", error);
//     next(error);
//   }
// });

router.post("/forgot", async (req, res, next) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Sorry Email not found.");
      return res.redirect("/user/request-password");
    }

    // Generate a random token for password reset
    const token = require("crypto").randomBytes(20).toString("hex");
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
router.get("/signup", middleware.isNotLoggedIn, (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("user/signup", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Sign Up",
  });
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



// POST: handle the signup logic
router.post(
  "/signup",
  [
    middleware.isNotLoggedIn,
    userSignUpValidationRules(),
    validateSignup,
    passport.authenticate("local.signup", {
      successRedirect: "/user/profile",
      failureRedirect: "/user/register",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    try {
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

// GET: display the signin form with csrf token
router.get("/signin", middleware.isNotLoggedIn, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("user/signin", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Sign In",
  });
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
  ],
  async (req, res) => {
    try {
      // cart logic when the user logs in
      let cart = await Cart.findOne({ user: req.user._id });
      // if there is a cart session and user has no cart, save it to the user's cart in db
      if (req.session.cart && !cart) {
        const cart = await new Cart(req.session.cart);
        cart.user = req.user._id;
        await cart.save();
      }
      // if user has a cart in db, load it to session
      if (cart) {
        req.session.cart = cart;
      }
      // redirect to appropriate URL based on user role
      if (req.user.role === "admin") {
        res.redirect("/admin/payment");
        // redirect to old URL before signing in
      } else if (req.session.oldUrl) {
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
  req.logout();
  req.session.cart = null;
  res.redirect("/");
});
module.exports = router;
