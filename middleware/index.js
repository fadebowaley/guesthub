let middlewareObject = {};

//a middleware to check if a user is logged in or not
middlewareObject.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

//check of user is na Administrator
middlewareObject.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.redirect("/admin/dashboard");
};


middlewareObject.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/user/signin");
};

module.exports = middlewareObject;
