import React, { useState, useEffect } from "react";
import Select from "react-select";

const Device = () => {
  const value = "";
  const label = "";
  return { value, label };
};

function DeviceSelector(props) {
  const [inputOptions, setInputOptions] = useState([{}]);
  const [selectedInput, setSelectedInput] = useState(Device());

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .then((stream) => {
        //if microphone permission is allowed
        //enumerate through media devices
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          var inputs = [{}];
          devices.map((device) => {
            var input = Device();
            input.value = device.deviceId;
            input.label = device.label;
            inputs.push(input);
            return null;
          });
          setInputOptions(inputs);
        });
      });
  }, []);

  //when new input is selected
  const handleChangeSelectedInput = (selection) => {
		console.log(selection);
    navigator.mediaDevices
      .getUserMedia({
				audio: {deviceId: selection.value},
        video: false,
      })
      .then((stream) => {
				console.log(stream);
        setSelectedInput(selection);
        props.onSelect({ selection, inputOptions, stream });
      });
  };

  return (
    <Select
      value={selectedInput}
      options={inputOptions}
      onChange={(selection) => {
        handleChangeSelectedInput(selection);
      }}
    />
  );
}

export { Device, DeviceSelector };
