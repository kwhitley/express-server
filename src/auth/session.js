import session from 'express-session'
import redis from 'redis'

const { REDIS_HOST, REDIS_PASSWORD, NODE_ENV, AUTH0_CLIENT_SECRET } = process.env

const RedisStore = require('connect-redis')(session)

var client = redis.createClient(6380, REDIS_HOST,
  {
    auth_pass: REDIS_PASSWORD,
    tls: { servername: REDIS_HOST },
  });

const redisStoreOptions = {
  client,
  port: 6380,
}

//session-related stuff
const sess = {
  secret: AUTH0_CLIENT_SECRET,
  cookie: {},
  resave: true,
  saveUninitialized: true,
  store: new RedisStore(redisStoreOptions),
  proxy: true,
  rolling: true,
}

if (NODE_ENV === 'production') {
  sess.cookie.secure = true // serve secure cookies, requires https
}

export default session(sess)
