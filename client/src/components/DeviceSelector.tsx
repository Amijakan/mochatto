import React, { useEffect, useContext } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { Device, listInputDevices, selectInputDevice } from "../DeviceSelectorHelper";
import { DeviceContext } from "../contexts/DeviceContext";

// drop down menu for selecting an input device
function DeviceSelector({ onSelect }: { onSelect: (MediaStream) => void }): JSX.Element {
  const { inputOptions, setInputOptions, selectedInput, setSelectedInput } =
    useContext(DeviceContext);

  useEffect(() => {
    //triggers microphone permission
    selectInputDevice(selectedInput.value, () => {
      //list options when permission is allowed
      setInputOptions(listInputDevices());
    });
  }, []);

  //when new option is selected
  useEffect(() => {
    selectInputDevice(selectedInput.value, (stream) => {
      onSelect(stream);
    });
  }, [selectedInput]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Select
        value={selectedInput}
        options={inputOptions}
        onChange={(selection) => {
          setSelectedInput(selection);
        }}
      />
    </>
  );
}

DeviceSelector.propTypes = {
  onSelect: PropTypes.func,
};

export { Device, DeviceSelector };
