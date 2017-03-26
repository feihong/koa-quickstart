const Koa = require('koa')
const route = require('koa-route')
const axios = require('axios')
const app = new Koa()


const greetings = [
    'Hello World',
    'Hola Mundo',
    'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨਿਆ',
    'こんにちは世界',
    '你好世界',
    'Përshendetje Botë',
    'مرحبا بالعالم',
    'Բարեւ, աշխարհ',
    'হ্যালো দুনিয়া',
    'Saluton mondo',
    'გამარჯობა მსოფლიო',
]


app.use(route.get('/', index))
app.use(route.get('/woohoo', woohoo))


async function index() {
  let index = Math.floor(Math.random() * greetings.length)
  let text = greetings[index]
  this.body = `<h1>${text}</h1>
  <a href='/woohoo'>Woohoo</a>`
}


async function woohoo() {
    let response = await axios.get('http://ipecho.net/plain')
    this.body = `Woohoo! Your IP address is ${response.data}.`
}

app.listen(8000)
