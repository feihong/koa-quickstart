const path = require('path')
const promisify = require('es6-promisify')
const Koa = require('koa')
const pug = require('pug')

const app = new Koa()
const readFile = promisify(require('fs').readFile)


app.use(async (ctx) => {
  let url = ctx.url
  if (url === '/') {
    ctx.body = await renderTemplate('index.pug')
  } else {
    let filePath = path.join(__dirname, ctx.url)
    try {
      let text = await readFile(filePath)
      ctx.response.type = 'text'
      ctx.body = text
    } catch (err) {
      ctx.response.status = 404
      ctx.body = `${err.message}`
    }
  }
})

async function renderTemplate(templateFile) {
  let text = await readFile(templateFile)
  return pug.render(text)
}

app.listen(8000)
