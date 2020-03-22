const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model
const User = require("../models/User");

//Login page
router.get('/login', (req, res) => 
  res.render('login')
);

//Register page
router.get('/register', (req, res) => 
  res.render('register')
);

//Register handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  
  //Check required fields
  if(!name || !email || !password || !password2){
    errors.push({ msg: 'Please fill in all required fields.'});
  }

  //Check passwords match
  if(password !== password2){
    errors.push({ msg: 'Passwords do not match.'});
  }

  //Check password meets criteria
  let pwrules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  if(!password.match(pwrules)){
    errors.push({ msg: 'Password must be between 6 & 20 characters, and contain at least 1 numeric digit, 1 upper case and 1 lower case letter'})
  }

  if(errors.length > 0){
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    })
  }
  else{
    // Validation passed
    User.findOne({ email: email })
    .then(user => {
      if(user) {
        //User already exists
        errors.push({ msg: 'Email is already registered. Please register a new account.'});
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
        
        //encrypt password
        bcrypt.genSalt(10, (err, salt) => 
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;

            //Set password to encrypted pass
            newUser.password = hash;
            //Save user in DB
            newUser.save()
              .then(user => {
                req.flash('success_msg', 'You are now Registered. Login below');
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          })
        );
      }
    });
  }
});

//Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Logout Handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have successfully logged out');
  res.redirect('/users/login');
});

module.exports = router;