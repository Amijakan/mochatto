import React, { useEffect, useState, useRef } from "react";

function ScreenShareWindow() {
  useEffect(() => {
    navigator.mediaDevices.getDisplayMedia().then((stream) => {
      document.getElementById("videoPlayer").srcObject = stream;
      console.log(stream);
    });
  }, []);

  return (
    <>
      <video id="videoPlayer" autoPlay></video>
    </>
  );
}

export default ScreenShareWindow;
