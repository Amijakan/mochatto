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
	console.log('new client: ' + socket.id)
	if (!socketIds.includes(socket.id)) {
		socketIds.push(socket.id)
	}
	socket.on('OFFER_OUT', (dataString) => {
		console.log('offer out from: ' + JSON.parse(dataString).id)
		socket.broadcast.emit('OFFER_IN', dataString)
	})
	socket.on('ANSWER_OUT', (dataString) => {
		const target = JSON.parse(dataString).target
		console.log(
			'answer out to: ' + target + ' from: ' + JSON.parse(dataString).id
		)
		socket.broadcast.to(target).emit('ANSWER_IN', dataString)
	})

	socket.on('UPDATE_OUT', () => {
		socket.broadcast.emit('UPDATE_IN')
	})
	socket.on('disconnect', () => {
		console.log('client disconnect')
	})
})
