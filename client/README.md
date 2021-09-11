# How it works

## To start off
index.tsx includes
  App.tsx which includes
    contexts/SocketIOContext: provides a socketio connection as context
    contexts/PositionsContext: provides a function for rendering avatars as context
    pages/index.tsx which includes
      the RoomPage and JoinPage: the two main components for the application

## JoinPage
Located in pages/JoinPage.tsx
Includes
  an input box for the name
  a button for joining: the RoomPage will be loaded once joined.
  a button for clearing users (for debugging) from the server

## RoomPage
Located in pages/RoomPage.tsx
Includes
  RoomPageHelper.ts: helper functions for opening socketio listeners which includes
    User.ts: a class to hold all information necessary for a peer connection
  DeviceSelector.tsx: a drop down menu for selecting an input audio device which includes
    DeviceSelectorHelper.ts: helper functions for listing available devices and selecting a device 
  AvatarCanvas.tsx: a cavans for rendering avatars which includes:
    AvatarDOM.tsx: avatar element
  contexts/SocketIOContext: provides a socketio connection as context
  contexts/PositionsContext: provides a function for rendering avatars as context
  RTCPeerConnector.ts: creates a WebRTC network
  User.ts: a class to hold all information necessary for a peer connection
