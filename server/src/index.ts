import express from 'express'

const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send({body: 'Hello world, 2'})
})

app.listen(port, () => {
  return console.log(`server is listening on ${port}`)
} )
