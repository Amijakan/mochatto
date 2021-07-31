import React, { useState, useEffect, useContext } from 'react';
import socketIOClient from 'socket.io-client';
import request from 'superagent';
import Select from 'react-select';
import { Link } from 'react-router-dom';

const ENDPOINT = 'http://localhost:4000';
const socket = socketIOClient(ENDPOINT);

const Device = () => {
	const value = ''
	const label = ''
	return { value, label }
}

function JoinPage() {
	const [response, setResponse] = useState("");
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
		const audio = document.querySelector('audio');
		navigator.mediaDevices.getUserMedia({ audio: {deviceId: selectedInput.value}, video: false}).then((stream) => {
			console.log("selected input");
			console.log(selectedInput);
			if(audio){
				(audio as HTMLAudioElement).srcObject=stream;
				socket.emit("SEND_USER_AUDIO", stream);
			}
		});
	}, [selectedInput]);


  return (
		<>
			<audio controls autoPlay></audio>
			<Select value={selectedInput} options={inputOptions} onChange={selection => {setSelectedInput(selection)}}/>
			<Link to="./RoomPage"></Link>
		</>
	
  );
}

export default JoinPage;
