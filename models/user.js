const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;
const { conn } = require("../config/dbb");

const userSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: false,
  },
  title: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  } ,
  emailVerificationTokenExpiresAt: {
   type: Date,
  },  
  emailVerifiedAt: {
   type: Date,
  },  
  resetPasswordExpires: {
    type: Date,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// encrypt the password before storing
userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function (candidatePassword) {
  if (this.password != null) {
    return bcrypt.compareSync(candidatePassword, this.password);
  } else {
    return false;
  }
};

userSchema.methods.setPassword = function (password) {
  this.password = this.encryptPassword(password);
};

module.exports = conn.model("User", userSchema);
