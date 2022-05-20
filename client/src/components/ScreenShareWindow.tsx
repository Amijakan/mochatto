import React, { useEffect, useState, useRef } from "react";

function ScreenShareWindow({
  videoPlayer,
  onStart,
  onEnd,
  onFailed,
}: {
  videoPlayer: HTMLVideoElement;
  onStart: (stream) => void;
  onEnd: () => void;
  onFailed: (e) => void;
}): JSX.Element {
  useEffect(() => {
    navigator.mediaDevices
      // @ts-ignore getDisplayMedia is not defined in TypeScript
      .getDisplayMedia()
      .then((stream) => {
        onStart(stream);
        videoPlayer.srcObject = stream;
        stream.getVideoTracks()[0].onended = () => {
          onEnd();
        };
      })
      .catch((e) => {
        onFailed(e);
      });
  }, []);

  return <></>;
}

export default ScreenShareWindow;
