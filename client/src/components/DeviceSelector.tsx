import React, { useEffect, useContext } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { Device, listInputDevices, selectInputDevice } from "./DeviceSelectorHelper";
import { DeviceContext } from "../contexts";
import { Checkbox, Div } from "atomize";
import { Label } from "../components/atomize_wrapper";

// drop down menu for selecting an input device
function DeviceSelector({ onSelect }: { onSelect: (MediaStream) => void }): JSX.Element {
  const { inputOptions, setInputOptions, selectedInput, setSelectedInput, options, setOptions } =
    useContext(DeviceContext);

  useEffect(() => {
    //triggers microphone permission
    selectInputDevice(
      selectedInput.value,
      () => {
        //list options when permission is allowed
        listInputDevices().then((devices) => {
          setInputOptions(devices);
          setSelectedInput(devices[0]);
        });
      },
      options
    );
  }, []);

  //when new option is selected
  useEffect(() => {
    selectInputDevice(
      selectedInput.value,
      (stream) => {
        onSelect(stream);
      },
      options
    );
  }, [selectedInput, options]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Select
        value={selectedInput}
        options={inputOptions}
        onChange={(selection) => {
          setSelectedInput(selection);
        }}
      />
      <Div p={{ t: "1rem" }}>
        <Label align="center" m={{ r: "0.5rem" }}>
          <Checkbox
            onChange={() => setOptions({ ...options, autoGainControl: !options.autoGainControl })}
            checked={options.autoGainControl}
          />
          Auto-gain control
        </Label>
        <Label align="center" m={{ r: "0.5rem" }}>
          <Checkbox
            onChange={() => setOptions({ ...options, echoCancellation: !options.echoCancellation })}
            checked={options.echoCancellation}
          />
          Echo cancellation
        </Label>
        <Label align="center" m={{ r: "0.5rem" }}>
          <Checkbox
            onChange={() => setOptions({ ...options, noiseSuppression: !options.noiseSuppression })}
            checked={options.noiseSuppression}
          />
          Noise suppression
        </Label>
      </Div>
    </>
  );
}

DeviceSelector.propTypes = {
  onSelect: PropTypes.func,
};

export { Device, DeviceSelector };
