const fs = require('fs')
const pathlib = require('path')
const join = pathlib.join
const Koa = require('koa')
const pug = require('pug')
const stylus = require('stylus')
const compiler = require('node-elm-compiler')

const app = new Koa()
const templateDir = join(__dirname, 'templates')
const here = process.cwd()

app.use(async (ctx, next) => {
  let req = ctx.request
  console.log(`${req.method} - ${ctx.url}`)
  await next()
})

// Map url to file path, return 404 response if path doesn't exist.
app.use(async (ctx, next) => {
  let url = ctx.url
  if (url === '/') {
    url = ''
  }
  let path = join(here, url)

  let stats = await getStats(path)
  if (stats === null) {
    ctx.response.status = 404
    ctx.body = `File not found: ${path}`
    return
  }

  ctx.state.path = path
  ctx.state.stats = stats
  await next()
})

// If path points to directory, try to render an index page.
app.use(async (ctx, next) => {
  let {path, stats} = ctx.state

  if (stats.isDirectory()) {
    let indexFile = join(path, 'index.html')
    if (await isFile(indexFile)) {
      ctx.body = await readFile(indexFile)
      return
    }

    indexFile = join(path, 'index.pug')
    if (await isFile(indexFile)) {
      ctx.body = await renderTemplate(indexFile)
      return
    }

    ctx.response.status = 404
    ctx.body = `Not found: "${path}" does not contain an index page`
    return
  }
  await next()
})

// If path points to a Stylus stylesheet, render it as CSS.
app.use(async (ctx, next) => {
  let {path} = ctx.state
  let ext = pathlib.extname(path)
  if (ext === '.styl') {
    ctx.response.type = 'css'
    ctx.body = await renderStylesheet(path)
    return
  }
  await next()
})

// If path points to an Elm source file, render it as JS.
app.use(async (ctx, next) => {
  let {path} = ctx.state
  let ext = pathlib.extname(path)
  if (ext === '.elm') {
    ctx.response.type = 'javascript'
    ctx.body = await compileElm(path)
    return
  }
  await next()
})

// Just serve the file as-is.
app.use(async (ctx, next) => {
  let {path} = ctx.state
  ctx.response.body = await readFile(path)
})

function getStats(path) {
  return new Promise(resolve => {
    fs.stat(path, (err, stats) => {
      if (err) {
        // Unlike fs.stat, will resolve to null instead of throwing error.
        resolve(null)
      } else {
        resolve(stats)
      }
    })
  })
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    // Data will always be a string since we passed in an encoding.
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// Return true if path points to a file.
async function isFile(path) {
  let stats = await getStats(path)
  return (stats === null) ? false : stats.isFile()
}

async function renderTemplate(pugFile) {
  let text = await readFile(pugFile)
  return pug.render(text, {filename: pugFile, basedir: templateDir})
}

async function renderStylesheet(stylFile) {
  let text = await readFile(stylFile)
  return new Promise((resolve, reject) => {
    stylus(text)
      .set('filename', stylFile)
      .render((err, css) => {
        if (err) {
          reject(err)
        } else {
          resolve(css)
        }
      })
  })
}

async function compileElm(elmFile) {
    try {
      let data = await compiler.compileToString(
        [elmFile], {yes: true, cwd: pathlib.dirname(elmFile)})
      return data.toString()
    } catch (err) {
      let text = err.toString().replace(/`/g, '\\`')
      return 'console.error(`' + text + '`)'
    }
}

app.listen(8000)
