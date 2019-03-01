import express from 'express'
import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import objectPath from 'object-path'
import passport from './passport'
import session from './session'

const { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN, ARUNDO_CLAIM_SPACE, ARUNDO_WS_SERVER } = process.env
const app = express()

export const checkToken = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 1,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  // Only validate if token intended for us
  audience: `${process.env.AUTH0_AUDIENCE}`,
  // Only validate if token issued by us
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  requestProperty: 'tokenUser'
})

function checkHeaderForToken(req){
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ')
    if (parts.length == 2) {
      var scheme = parts[0]
      var credentials = parts[1]

      if (/^Bearer$/i.test(scheme)) {
        return credentials
      }
    }
  }

  return null
}

function checkTokenOrSession(req, res, next, cb){
  checkToken(req, res, (err) => {
    if(!err && req.tokenUser){
      req.user = {
        profile: {
          "_json": {
            sub: req.tokenUser.sub,
            [`${ARUNDO_CLAIM_SPACE}company`]: req.tokenUser[`${ARUNDO_CLAIM_SPACE}company`]
          }
        },
      }
      next()
    } else {
      // token check failed, continue onto session check
      cb(req, res, next)
    }
  })
}

function checkSessionAndRedirectOrContinue(req, res, next){
  if (!req.isAuthenticated()) {
    console.log('REDIRECT: user not authenticated for', req.method, req.originalUrl)
    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  }

  // embed passport "user" into request (easier future traversal)
  if (req.session.passport) {
    req.user = req.session.passport.user
  }

  next()
}

export const isAuthenticatedUser = (req, res, next) => {
// check for bearer token, if we have a bearer token, see if it's valid
  const token = checkHeaderForToken(req)
  if (token){
    checkTokenOrSession(req, res, next, checkSessionAndRedirectOrContinue)
  } else {
    checkSessionAndRedirectOrContinue(req, res, next)
  }
}

const NOT_AUTHORIZED_MESSAGE = {
  message: 'User not authenticated',
}



function checkSessionAuth(req, res, next){
  // check session
  if (!req.isAuthenticated()) {
    if (!req.get('Referer')){
      console.log('REDIRECT: unauthenticated direct reference', req.method, req.originalUrl)
      req.session.returnTo = req.originalUrl
      return res.redirect('/login')
    }

    return res.status(401).json(NOT_AUTHORIZED_MESSAGE)
  }

  // embed passport "user" into request (easier future traversal)
  if (req.session.passport) {
    req.user = req.session.passport.user
  }

  next()
}

export const checkAuthAndReturnNoAuthJSON = (req, res, next) => {
  // check for bearer token, if we have a bearer token, see if it's valid
  const token = checkHeaderForToken(req)
  if (token){
    checkTokenOrSession(req, res, next, checkSessionAuth)
  } else {
    checkSessionAuth(req, res, next)
  }
}

app.use(session)
app.use(passport.initialize())
app.use(passport.session())

app.get('/login', passport.authenticate('auth0', { audience: AUTH0_AUDIENCE, scope: 'openid email profile' }), (req, res) => {
  res.redirect('/callback');
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect(`https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${req.protocol}://${req.get('Host')}`);
})

app.get('/callback', passport.authenticate('auth0', { failureRedirect: '/login' }), (req, res) => {
  if (req.params.error) {
    res.send(500, req.params.error_description)
  } else {

    let { returnTo } = req.session
    res.redirect(returnTo || '/')
  }
})

app.get('/api/profile', isAuthenticatedUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, type: 'authentication', message: 'User profile not found, or user not logged in.' })
  }
  // appending the auth token and wss connection inside the profile
  req.user.profile.token = objectPath.get(req, 'user.extraParams.access_token')
  const company = req.user.profile._json[`${ARUNDO_CLAIM_SPACE}company`]
  req.user.profile.wss = `${ARUNDO_WS_SERVER}/${company}/tags`
  
  res.json(req.user.profile)
})

export default app
