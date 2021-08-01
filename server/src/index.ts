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
	socket.on('SEND_USER_AUDIO', (blob) => {
		// change to socket.broadcast.emit to omit the sender for multiple clients
		socket.emit('BROADCAST_AUDIO', blob)
	})
	socket.on('disconnect', () => {
		console.log('client disconnect')
	})
})
