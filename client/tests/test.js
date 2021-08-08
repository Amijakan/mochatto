import socketIOClient from "socket.io-client";
import { addUser, updateAllTracks, sendOffer } from "../src/RTCPeerConnector";
import User from "../src/User";

describe('User class tests', () => {
  it('instantiates user', () => {
		const id = "sampleid";
		const user = new User(id);
		
  })
})
