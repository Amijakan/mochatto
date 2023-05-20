import React, { useRef, useEffect } from "react";
import "./style.scss";

import type { UserStream } from "@/contexts/UserStreamContext";

const ScreenShareBubble = ({
  isScreenSharing,
  stream,
}: {
  isScreenSharing: boolean;
  stream: UserStream;
}) => {
  const videoPlayer = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoPlayer.current) {
      return;
    }

    if (
      isScreenSharing &&
      stream &&
      stream.getVideoTracks().length &&
      stream.getVideoTracks()[0].readyState == "live"
    ) {
      videoPlayer.current.srcObject = stream;
      videoPlayer.current.autoplay = true;
      videoPlayer.current.muted = true;
      return;
    }
  }, [isScreenSharing, stream]);

  return <div className="video-container">{isScreenSharing && <video ref={videoPlayer} />}</div>;
};

export default ScreenShareBubble;
