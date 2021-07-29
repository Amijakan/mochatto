import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import logo from './logo.svg';
import './App.css';
import request from 'superagent'

const ENDPOINT = 'http://localhost:4000';

function App() {
	const [response, setResponse] = useState("");

	useEffect(() => {
		const socket = socketIOClient(ENDPOINT);
		socket.on("FromAPI", data => {
			setResponse(data);
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
