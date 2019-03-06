import path from 'path'

// gets parent application root path, rather than root path of this module (likely within node_modules)
var appRoot = require('app-root-path')
                .toString()
                .replace(/^(.*)\/express-starter$/, '$1') // only for use in local dev, ignored otherwise

const isProduction = process.env.NODE_ENV === 'production'
const isDevelop = process.env.NODE_ENV === 'development'

export const serverPath = path.join(appRoot, `./${isDevelop ? '.dist-dev' : 'dist'}`)
export const clientPath = serverPath + '/client'
export const imagePath = clientPath + '/i'
