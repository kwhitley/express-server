const fs = require('fs')
const { src, task, exec, context } = require('fuse-box/sparky')
const {
  FuseBox,
  EnvPlugin,
  JSONPlugin,
  CSSPlugin,
  CSSResourcePlugin,
  SassPlugin,
  LESSPlugin,
  CopyPlugin,
  ImageBase64Plugin,
  SVGPlugin,
  WebIndexPlugin,
  QuantumPlugin,
} = require('fuse-box')

const pkg = JSON.parse(fs.readFileSync('./package.json',  'utf8')) // read package.json
const DEV_BUILD_PATH = '.dist-dev'
const PROD_BUILD_PATH = 'dist'

console.log('pkg', pkg)
console.log('title', pkg.title)
console.log('version', pkg.version)
console.log('description', pkg.description)

const serverConfig = (isProduction, basePath = DEV_BUILD_PATH) => ({
  homeDir: 'src',
  output: `${basePath}/$name.js`,
  useTypescriptCompiler: true,
  allowSyntheticDefaultImports: true,
  target : 'server@esnext',
  debug: true,
  sourceMaps: true,
  plugins: [
    !isProduction && EnvPlugin({
      NODE_ENV: 'development',
    }),
    JSONPlugin(),
  ]
})

task('build', async context => {
  await src(`./${PROD_BUILD_PATH}`)
      .clean(`${PROD_BUILD_PATH}/`)
      .exec()

  const server = FuseBox.init(serverConfig(true, PROD_BUILD_PATH))

  server
    .bundle('index')
    .instructions(' > [server/index.js]')

  await server.run()
})
