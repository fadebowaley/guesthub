const express = require("express");
const csrf = require("csurf");
const router = express.Router();
const {
  userContactUsValidationRules,
  validateContactUs,
} = require("../middleware/validator");
const csrfProtection = csrf();
router.use(csrfProtection);

const { sendContactFormEmail } = require("../middleware/email");

//GET: display about us page
router.get("/about", (req, res) => {
  res.render("pages/about", {
    pageName: "About Us",
  });
});

router.get("/rooms", (req, res) => {
  res.render("pages/rooms", {
    pageName: "our Rooms",
  });
});

router.get("/room-details", (req, res) => {
  res.render("pages/roomDetails", {
    pageName: "our Rooms",
  });
});

router.get("/facilities", (req, res) => {
  res.render("pages/facilities", {
    pageName: "Our Facilities",
  });
});

// ---------------------------------------

//GET: display about us page
router.get("/about-us", (req, res) => {
  res.render("pages/about-us", {
    pageName: "About Us",
  });
});

//GET: display shipping policy page
router.get("/shipping-policy", (req, res) => {
  res.render("pages/shipping-policy", {
    pageName: "Shipping Policy",
  });
});

//GET: display careers page
router.get("/careers", (req, res) => {
  res.render("pages/careers", {
    pageName: "Careers",
  });
});

//GET: display contact us page and form with csrf tokens
router.get("/contact", (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error");
  res.render("pages/contact", {
    pageName: "Contact Us",
    csrfToken: req.csrfToken(),
    successMsg,
    errorMsg,
  });
});

//POST: handle contact us form logic using nodemailer

router.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    await sendContactFormEmail(name, email, phone, subject, message);
    req.flash("success", "Message sent successfully!");
    res.redirect("/pages/contact");
  } catch (error) {
    console.log(error);
    req.flash("error", "An error occurred while sending the message.");
    res.redirect("/pages/contact");
  }
});

module.exports = router;
