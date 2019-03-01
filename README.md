# Arundo Express Starter
**Purpose**: To give us a starting Express.js environment for new client side apps.
[![Build Status via Travis CI](https://travis-ci.com/arundo/express-starter.svg?branch=develop)](https://travis-ci.com/arundo/express-starter)
---

# Installation
```bash
yarn add @arundo/express-starter
```

# Usage
```js
/* import instantiated express app from our starter kit...
   this is a full-fledged express app, ready to accept middleware,
   plugins, routers, etc.  We've added the .start() method to fire
   up the server directly, although you could always start it any other way
   you like.
*/
import app from '@arundo/express-starter'

app.start()
```

# Examples
### Usage with custom API

###### index.js
```js
import app from '@arundo/express-starter'
import api from './api'

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
