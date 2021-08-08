/* eslint-disable */
import socketIOClient from "socket.io-client";
import { addUser, updateAllTracks, sendOffer } from "../src/RTCPeerConnector";
import User from "../src/User";

describe('User class tests', () => {
  it('joins', () => {
		const name = ''
		cy.visit('http://localhost:4500/room')
		cy.get('input').type('user1')
		cy.get('button').click()

		cy.contains('div', 'user1 has joined.')
			.should('be.visible')
			.then(()=> {
				cy.visit('http://localhost:4500/room')
			})
  })
})
