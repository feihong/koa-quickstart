const Koa = require('koa')
const route = require('koa-route')
const pug = require('pug')
const promisify = require('es6-promisify')

const app = new Koa()
const readFile = promisify(require('fs').readFile)

app.use(route.get('/', index))

async function index(ctx) {
  // ctx.response.type = 'text'
  let text = await readFile('index.pug')
  ctx.body = pug.render(text)
}

app.listen(8000)
