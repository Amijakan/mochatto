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
		origin: ['http://localhost:4500'],
	},
})

app.get('/', (req, res) => {
	res.send({ body: 'Hello world, 3' })
})

const socketIds: string[] = []
io.on('connection', (socket) => {
	if (!socketIds.includes(socket.id)) {
		socketIds.push(socket.id)
	}
	socket.on('OFFER_OUT', (sdp) => {
		socket.broadcast.emit('OFFER_IN', sdp)
	})
	socket.on('disconnect', () => {
		console.log('client disconnect')
	})
})
