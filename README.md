A simplified Express.js environment to serve server + client code.
=======
#### Supports Redis or built-in memory engine with auto-clearing.

# Includes
- [x] gzip compression
- [x] body parsing for form data
- [x] favicon serving
- [x] sessions
- [x] cookies
- [ ] authentication

# Installation
```bash
yarn add @supergeneric/express-server
```

# Usage
```js
/* import instantiated express app from our starter kit...
   this is a full-fledged express app, ready to accept middleware,
   plugins, routers, etc.  We've added the .start() method to fire
   up the server directly, although you could always start it any other way
   you like.
*/
import app from '@supergeneric/express-server'

app.start()
```

# Examples
### Usage with custom API

###### index.js
```js
import express from '@supergeneric/express-server'
import api from './api'

const app = express() // same way you instantiate express

app.use('/api', api)
app.start()
```

###### api.js
```js
import express from 'express'

const app = express()

// example route... will be callable from /api/foo
app.get('/foo', (req, res) => {
  res.json({
    success: true,
    path: req.path,
  })
})

export default app
```

# What goes on under the hood?
This library basically abstracts the basic setup of the express http server, complete with
static routing, compression, sessions, cookies, etc.  It's basically super shorthand for something like the following:

```js
require('dotenv').config()

// include other main deps
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import session from 'express-session'
import sslRedirect from 'heroku-ssl-redirect'
import path from 'path'
import http from 'http'
import fs from 'fs'
import favicon from 'serve-favicon'
import { clientPath } from './paths'

// instantiate express
const app = express()
const isProduction = process.env.NODE_ENV === 'production'

// force SSL on production
app.use(sslRedirect([
  'production',
]))

app.use(session({
  secret: 'secret: 'Puppies are the new secretness. ' + new Date(),' + new Date(),
  resave: false,
  saveUninitialized: true,
}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())

// static serving of assets, files, scripts
console.log(`serving static content from ${clientPath}`)
app.use(express.static(clientPath))

// serves favicon
app.use(favicon(path.join(__dirname, 'favicon.ico')))

// all unmatched get 404
app.get('*', (req, res) => {
  res.sendStatus(404)
})

const server = http.createServer(app)
console.log(`Express server @ http://localhost:3000 (${isProduction ? 'production' : 'development'})\n`)
server.listen(3000)
```
