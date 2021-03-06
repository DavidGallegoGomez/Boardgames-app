const passport       = require('passport')
const User           = require('../models/user.model')
const LocalStrategy  = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;


passport.serializeUser((user, next) => {
  next(null, user.id)
})

passport.deserializeUser((id, next)  => {
  User.findById(id)
    .then(user => next(null, user))
    .catch(next)
})

passport.use("local-auth", new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, (username, password, next) => {
  User.findOne({ username: username })
    .then(user => {
      if(!user){
        next(null, null, {password: 'Invalid username or password'})
      } else {
        return user.checkPassword(password)
          .then(match => {
            if(!match){
              next(null, null, {password: 'Invalid username or password'})
            } else {
              next(null, user)
            }
          })
      }
    })
}))

passport.use('google-auth', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, authenticateOAuthUser));


function authenticateOAuthUser(accessToken, refreshToken, profile, next) {
  const provider  = `${profile.provider}Id`;
  const socialId  = profile.id;
  const username  = profile.displayName; // Inicialmente era 'name'
  const email     = profile.emails ? profile.emails[0].value:undefined;
  const avatarURL = profile.picture || profile.photos && profile.photos[0].value;
  
  User.findOne({
    $or:[
      { email: email },
      { [ `social.${provider}` ]: socialId }
    ]
  })
    .then( user => {
      if (user) { next(null,user); }
      else if (!user){ 
        user = new User({
          username: username,
          email:    email,
          password: Math.random().toString(35),
          social: {
            [ provider ]: socialId
          },
          avatarURL: avatarURL 
        })
        return user.save()
          .then( user => next(null, user) )
      }
    })
    .catch(next)
}