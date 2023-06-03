let middlewareObject = {};

//a middleware to check if a user is logged in or not
middlewareObject.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

//check if user is an Administrator
middlewareObject.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.redirect("/");
};


//check if user email is verified before login
middlewareObject.emailVerified  = (req, res, next) => {
  if (req.isAuthenticated() && !req.user.emailVerified) {
    req.flash("success", "please activate your account by checking email:" + req.user.email);
    //check if user.email not verifies
    console.log('please verify your account first')
    return res.redirect("/user/activate-your-account");
  }
  next();
}



//check if user is Login as User 
middlewareObject.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('Please you need to login to make reservations');
  res.redirect("/user/login");
};

module.exports = middlewareObject;
