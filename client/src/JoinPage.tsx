import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import request from 'superagent';
import Select from 'react-select';

const ENDPOINT = 'http://localhost:4000';

function JoinPage() {
	const [response, setResponse] = useState("");
	const Device = () => {
		const value = "";
		const label = "";
		return {value, label};
	};
	const [inputOptions, setInputOptions] = useState([{}]);
	const [selectedInput, setSelectedInput] = useState(Device());

	//when rendered
	useEffect(() => {
		//enumerate through media devices
		navigator.mediaDevices.enumerateDevices().then((devices) => {
			var inputs = [{}];
			devices.map((device) => {
				var input = Device();
				input.value = device.deviceId;
				input.label = device.label;
				inputs.push(input);
			});
			setInputOptions(inputs);
		});
	}, []);

	//when new input is selected
	useEffect(() => {
		const socket = socketIOClient(ENDPOINT);
		const audio = document.querySelector('audio');
		socket.on("FromAPI", data => {
			setResponse(data);
		});
		navigator.mediaDevices.getUserMedia({ audio: {deviceId: selectedInput.value}, video: false}).then((stream) => {
			console.log("selected input");
			console.log(selectedInput);
			if(audio){
				(audio as HTMLAudioElement).srcObject=stream;
			}
		});
	}, [selectedInput]);


  return (
		<>
				<audio controls autoPlay></audio>
				<Select value={selectedInput} options={inputOptions} onChange={selection => {setSelectedInput(selection)}}/>
        <p>
					It's <time dateTime={response}>{response}</time>
        </p>
        <button
          onClick={() => {
            request.get(':4000').then(resp => {
              console.log(resp)
            })
          }}
  >Click</button>
		</>
	
  );
}

export default JoinPage;
