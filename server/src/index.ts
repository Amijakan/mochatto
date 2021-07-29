import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'

const app = express()
const port = 4000
const server = app.listen(port, () => {
	return console.log(`server is listening on ${port}`)
})

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:4500',
	},
})

app.get('/', (req, res) => {
	res.send({ body: 'Hello world, 3' })
})

io.on('connection', (socket) => {
	console.log('new client connected')
	getApiAndEmit(socket)
	socket.on('disconnect', () => {
		console.log('client disconnect')
	})
})

const getApiAndEmit = (socket: any) => {
	const response = new Date()
	socket.emit('FromAPI', response)
}
