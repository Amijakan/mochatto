import express from 'express'

const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(port, () => {
  return console.log(`server is listening on ${port}`)
} )
