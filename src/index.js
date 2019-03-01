require('dotenv').config()

console.log('express-starter imported...')

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
  secret: 'Arundo eats real-world industrial problems for breakfast, lunch, and dinner. ' + new Date(),
  resave: false,
  saveUninitialized: true,
}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())

// static serving from /dist/client

console.log(`serving static content from ${clientPath}`)
app.use(express.static(clientPath))
app.use(favicon(path.join(__dirname, 'favicon.ico')))

app.start = (options = {
  port: process.env.PORT || 3000,
}) => {
  let { port } = options
  // after all other middleware has been applied, add final catch all routes
  // all other client requests that lack an extension redirected to client
  app.get(/.*(?<!\.\w{1,4})$/, (req, res) => {
    console.log('redirecting request for', req.path, 'to', clientPath + '/index.html')
    res.sendFile('/index.html', { root: clientPath })
  })

  // all unmatched get 404
  app.get('*', (req, res) => {
    res.sendStatus(404)
  })

  const server = http.createServer(app)
  console.log(`Express server @ http://localhost:${port} (${isProduction ? 'production' : 'development'})\n`)
  server.listen(port)
}

export default app
