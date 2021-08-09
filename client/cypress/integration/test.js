import socketIOClient from "socket.io-client";
import { addUser, updateAllTracks, sendOffer } from "../src/RTCPeerConnector";
import User from "../src/User";

describe('Server tests', () => {
	const ENDPOINT = "http://localhost:4000/";
	const socket = socketIOClient(ENDPOINT);
  it('should connect to signaling server', () => {
		cy.wait(1000);
		expect(socket.connected).to.eq(true);
  })
})
