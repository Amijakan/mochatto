import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import logo from './logo.svg';
import './App.css';
import request from 'superagent'

const ENDPOINT = 'http://localhost:4000';

function App() {
	const [response, setResponse] = useState("");

	const context = new AudioContext();

	useEffect(() => {
		const socket = socketIOClient(ENDPOINT);
		socket.on("FromAPI", data => {
			setResponse(data);
		});
		navigator.mediaDevices.getUserMedia({ audio: true, video: false}).then((stream) => {
			const source = context.createMediaStreamSource(stream);
			const processor = context.createScriptProcessor(1024, 1, 1);

			source.connect(processor);
			processor.connect(context.destination);

			processor.onaudioprocess = function(e) {
				// Do something with the data, e.g. convert it to WAV
				console.log(e.inputBuffer);
			};
		});
	}, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
					It's <time dateTime={response}>{response}</time>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button
          onClick={() => {
            request.get(':4000').then(resp => {
              console.log(resp)
            })
          }}
  >Click</button>
      </header>
    </div>
  );
}

export default App;
