const fs = require('fs')
const pathlib = require('path')
const promisify = require('es6-promisify')
const Koa = require('koa')
const pug = require('pug')
const stylus = require('stylus')

const app = new Koa()
const _readFile = promisify(fs.readFile)
const readFile = path => _readFile(path, 'utf8')

app.use(async (ctx) => {
  let url = ctx.url
  if (url === '/') {
    url = ''
  }
  let path = pathlib.join(__dirname, url)

  let stats = await getStats(path)
  if (stats === null) {
    ctx.response.status = 404
    ctx.body = `File not found: ${path}`
    return
  }

  if (stats.isDirectory()) {
    let indexFile = pathlib.join(path, 'index.pug')
    if (await isFile(indexFile)) {
      ctx.body = await renderTemplate(indexFile)
    } else {
      ctx.response.status = 404
      ctx.body = `${path} is a directory`
    }
    return
  }

  let ext = pathlib.extname(path)
  if (ext === '.styl') {
    ctx.response.type = 'css'
    ctx.body = await renderStylesheet(path)
    return
  }

  ctx.response.body = await readFile(path)
})

function getStats(path) {
  return new Promise(resolve => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(null)
      } else {
        resolve(stats)
      }
    })
  })
}

async function isFile(path) {
  let stats = await getStats(path)
  return (stats === null) ? false : stats.isFile()
}

async function renderTemplate(templateFile) {
  let text = await readFile(templateFile)
  return pug.render(text)
}

async function renderStylesheet(stylFile) {
  let text = await readFile(stylFile)
  return await asyncStylus(text, stylFile)
}

function asyncStylus(text, stylFile) {
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

app.listen(8000)
