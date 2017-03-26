const fs = require('fs')
const pathlib = require('path')
const Koa = require('koa')
const pug = require('pug')
const _stylus = require('stylus')

const app = new Koa()
const here = process.cwd()

app.use(async (ctx) => {
  let url = ctx.url
  if (url === '/') {
    url = ''
  }
  let path = pathlib.join(here, url)

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

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
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
  return await stylus(text, stylFile)
}

function stylus(text, stylFile) {
  return new Promise((resolve, reject) => {
    _stylus(text)
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
