const path = require('path')
const promisify = require('es6-promisify')
const Koa = require('koa')
const pug = require('pug')
const stylus = require('stylus')

const app = new Koa()
const readFile = promisify(require('fs').readFile)


app.use(async (ctx) => {
  let url = ctx.url
  if (url === '/') {
    ctx.body = await renderTemplate('index.pug')
  } else {
    let filePath = path.join(__dirname, ctx.url)
    let text
    try {
      let text = await readFile(filePath)
    } catch (err) {
      ctx.response.status = 404
      ctx.body = err.message
      return
    }
    let ext = path.extname(filePath)
    if (ext === '.styl') {
      ctx.response.type = 'css'
      ctx.body = await renderStylesheet(text, filePath)
    } else {
      ctx.response.type = 'text'
      ctx.body = text
    }
  }
})

async function renderTemplate(templateFile) {
  let text = await readFile(templateFile)
  return pug.render(text)
}

function renderStylesheet(text, filename) {
  return new Promise((resolve, reject) => {
    stylus(text)
      .set('filename', filename)
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
