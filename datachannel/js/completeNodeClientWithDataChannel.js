'use strict';

// Look after different browser vendors' ways of calling the getUserMedia() API method:
// Opera --> getUserMedia
// Chrome --> webkitGetUserMedia
// Firefox --> mozGetUserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
							|| navigator.mozGetUserMedia;

// Clean-up function:
// collect garbage before unloading browser's window
window.onbeforeunload = function(e){
	hangup();
}

//Datachannel options
var dataChannelOptions = {reliable: true};
var firefoxICEServers = {'iceServers':[{'url':'stun:23.21.150.121'}]};
var googleICEServers = {'iceServers':[{'url':'stun:23.21.150.121'}]};
var sampleTime = 6000; // one minute
var sampleCounter = 0;
var firstTime = true;

// Data channel information
var sendChannel, receiveChannel;
var sendButton = document.getElementById("sendButton");
var sendTextarea = document.getElementById("dataChannelSend");
var receiveTextarea = document.getElementById("dataChannelReceive");
var sendFile = document.getElementById("click");
var fileinput = document.getElementById("browseFile");

//Disabling Sending File button
sendFile.disabled = true;
sendFile.onclick = sendFileP2P;

// HTML5 <video> elements
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

// Handler associated with 'Send' button
sendButton.onclick = sendData;

// Flags...
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;

// WebRTC data structures
// Streams
var localStream;
var remoteStream;

// Peer Connection
var pc;

// Peer Connection ICE protocol configuration (either Firefox or Chrome)
/*var pc_config = webrtcDetectedBrowser === 'firefox' ?
  {'iceServers':[{'url':'stun:23.21.150.121'}]} : // IP address
  {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
  */
var pc_config = webrtcDetectedBrowser === 'firefox' ?  firefoxICEServers : googleICEServers;

/* The DTLS handshake is used to establish keying material,
   algorithms, and parameters for SRTP.
   Servers that receive an extended hello containing a "use_srtp"
   extension can agree to use SRTP by including an extension of type
   "use_srtp", with the chosen protection profile in the extended server
   hello.  This process is shown below.
   Client                                               Server

   ClientHello + use_srtp       -------->
   ServerHello + use_srtp
   Certificate*
   ServerKeyExchange*
   CertificateRequest*
   <--------      ServerHelloDone
   Certificate*
   ClientKeyExchange
   CertificateVerify*
   [ChangeCipherSpec]
   Finished                     -------->
   [ChangeCipherSpec]
   <--------             Finished
   SRTP packets                 <------->      SRTP packets
*/
var pc_constraints = {
  'optional': [
                {'DtlsSrtpKeyAgreement': true}
              ]};

//--------------------------------------------------------------------
// Session Description Protocol constraints:
//--------------------------------------------------------------------
var sdpConstraints = {};

//--------------------------------------------------------------------
/* room name */
//--------------------------------------------------------------------
var room = "Servio";

//--------------------------------------------------------------------
// Connect to signalling server
//--------------------------------------------------------------------
var socket = io.connect("http://128.10.120.157:8181");

/*
*   Send 'Create or join' message to signaling server
*/
if (room !== '') {
  console.log('Create or join room', room);
  socket.emit('create or join', room);
}

//--------------------------------------------------------------------
// Set getUserMedia constraints
// We just need DataChannel, therefore video and audio are turned off
//--------------------------------------------------------------------
var constraints = {video: false, audio: false};

//--------------------------------------------------------------------
// Asynchronous events
// getUserMedia() handlers...
//Not used with datachannels, use handleUserMedia2 instead
//--------------------------------------------------------------------
function handleUserMedia(stream) {
	localStream = stream;
	attachMediaStream(localVideo, stream);
	console.log('Adding local stream.');
	sendMessage('got user media');
}

//--------------------------------------------------------------------
// Send negotiation message to prepare connections
//--------------------------------------------------------------------
function handleUserMedia2(stream) {
	console.log('Adding local fake stream.');
	sendMessage('got user media');
}

//--------------------------------------------------------------------
// Error handler
//--------------------------------------------------------------------
function handleUserMediaError(error){
	console.log('navigator.getUserMedia error: ', error);
}

// <<<<<<<<<< Message exchange through Signaling Server >>>>>>>>>>>>>>
// 1. Server-->Client
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// Handle 'created' message coming back from server:
// this peer is the initiator
//--------------------------------------------------------------------
socket.on('created', function (room){
  console.log('Created room ' + room);
  isInitiator = true;

  handleUserMedia2() ;
  console.log(' Getting user media with constraints ', constraints);

  checkAndStart();
});

//--------------------------------------------------------------------
// Handle 'full' message coming back from server:
//--------------------------------------------------------------------
socket.on('full', function (room){
  console.log('Room ' + room + ' is full');
});

//--------------------------------------------------------------------
// Handle 'join' message coming back from server:
// another peer is joining the channel
//--------------------------------------------------------------------
socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

//--------------------------------------------------------------------
// Handle 'joined' message coming back from server:
// this is the second peer joining the channel
//--------------------------------------------------------------------
socket.on('joined', function (room){
  console.log('This peer has joined room ' + room);
  isChannelReady = true;

  // Call getUserMedia()
  //navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
	handleUserMedia2() ;
  console.log(' <<2>>Not Getting user media with constraints ', constraints);
});

//--------------------------------------------------------------------
// Server-sent log message
//--------------------------------------------------------------------
socket.on('log', function (array){
  console.log.apply(console, array);
});

//--------------------------------------------------------------------
// Receive message from the other peer via the signalling server
//--------------------------------------------------------------------
socket.on('message', function (message){
  console.log('Received message:', message);
  if (message === 'got user media') {
		  isChannelReady = true;
      checkAndStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      checkAndStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
      candidate:message.candidate});
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

//--------------------------------------------------------------------
// receiving an incoming filetransfer
//--------------------------------------------------------------------
socket.on('fileTransfer', function (metadata, receiver) {
    console.log('incoming filetransfer', metadata);
    var item = document.createElement('li');
    item.className = 'receiving';

    // make a label
    var span = document.createElement('span');
    span.className = 'filename';
    span.appendChild(document.createTextNode(metadata.name));
    item.appendChild(span);

    span = document.createElement('span');
    span.appendChild(document.createTextNode(metadata.size + ' bytes'));
    item.appendChild(span);
});

//--------------------------------------------------------------------
// 2. Client-->Server
//--------------------------------------------------------------------
// Send message to the other peer via the signalling server
function sendMessage(message){
  console.log('Sending message: ', message);
  socket.emit('message', message);
}

//--------------------------------------------------------------------
// Channel negotiation trigger function
//--------------------------------------------------------------------
function checkAndStart() {
  console.log("Before IF " + isStarted + " localStream " + localStream + "  isChannelReady " + isChannelReady);
  //if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
	if (!isStarted && isChannelReady) {
	createPeerConnection();
    isStarted = true;
    if (isInitiator) {
      doCall();
    }
  }
}

//--------------------------------------------------------------------
// Peer Connection management
//--------------------------------------------------------------------
function createPeerConnection() {
  try {

    console.log("Creating Peer Connection");
    pc = new RTCPeerConnection(pc_config, pc_constraints);

    console.log("Calling pc.addStream(localStream)! Initiator: " + isInitiator);
    //pc.addStream(localStream);

    pc.onicecandidate = handleIceCandidate;
    console.log('Created RTCPeerConnnection with:\n' +
                '  config: \'' + JSON.stringify(pc_config) + '\';\n' +
                '  constraints: \'' + JSON.stringify(pc_constraints) + '\'.');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
      return;
  }

  if (isInitiator) {
    try {
      // Create a reliable data channel
      sendChannel = pc.createDataChannel("sendDataChannel", dataChannelOptions);
      trace('Created send data channel');
    } catch (e) {
      alert('Failed to create data channel. ');
      trace('createDataChannel() failed with exception: ' + e.message);
    }
    sendChannel.onopen = handleSendChannelStateChange;
    sendChannel.onmessage = handleMessage;
    sendChannel.onclose = handleSendChannelStateChange;
  } else { // Joiner
    pc.ondatachannel = gotReceiveChannel;
  }
}

//--------------------------------------------------------------------
// Data channel management
//--------------------------------------------------------------------
function sendData() {
  var data = sendTextarea.value;

  if(isInitiator)
      sendChannel.send(data);
  else
      receiveChannel.send(data);

    trace('Sent data: ' + data);
}

function sendDataAuto(data) {

  if(isInitiator)
      sendChannel.send(data);
  else
      receiveChannel.send(data);

    trace('Sent data auto: ' + data);
}

//--------------------------------------------------------------------
// Sending file
//--------------------------------------------------------------------
function sendFileP2P() {

    trace('Sent File Chunk: ' + data);

    console.log("Sending file ...");
    var file = fileinput.files[0];
    console.log("Filename to send: " + file.name);
    var sender = peer.sendFile(file);

    // create a file item
    var item = document.createElement('li');
    item.className = 'sending';

    // make a label
    var span = document.createElement('span');
    span.className = 'filename';
    span.appendChild(document.createTextNode(file.name));
    item.appendChild(span);

    span = document.createElement('span');
    span.appendChild(document.createTextNode(file.size + ' bytes'));
    item.appendChild(span);

    // create a progress element
    var fileSize = file.size;
    var chunkSize = 60000;

    // hook up send progress
    sender.on('progress', function (bytesSent) {
        sendProgress.value = bytesSent;
    });
    // sending done
    sender.on('sentFile', function () {
        item.appendChild(document.createTextNode('sent'));

        // we allow only one filetransfer at a time
        fileinput.removeAttribute('disabled');
    });
    // receiver has actually received the file
    sender.on('complete', function () {
        // safe to disconnect now
    });
    //filelist.appendChild(item);
    //bar.setPercentage(85);


  var data = file.name;
  if (isInitiator)
      sendChannel.send(data);
  else
      receiveChannel.send(data);

}

//--------------------------------------------------------------------
// Handlers
//--------------------------------------------------------------------
function gotReceiveChannel(event) {
  trace('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = handleMessage;
  receiveChannel.onopen = handleReceiveChannelStateChange;
  receiveChannel.onclose = handleReceiveChannelStateChange;
}

//--------------------------------------------------------------------
// Handle message
//--------------------------------------------------------------------
function handleMessage(event) {
  trace('Received message: ' + event.data);
  receiveTextarea.value += event.data + '\n';
}

//--------------------------------------------------------------------
// handle Send Channel State Change
//--------------------------------------------------------------------
function handleSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Send channel state is: ' + readyState);
  // If channel ready, enable user's input
  if (readyState == "open") {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    dataChannelSend.placeholder = "";
    sendButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
  }
}

//--------------------------------------------------------------------
// handle Receive Channel State Change
//--------------------------------------------------------------------
function handleReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  trace('Receive channel state is: ' + readyState);

  // If channel ready, enable user's input
  if (readyState == "open") {
	    dataChannelSend.disabled = false;
	    dataChannelSend.focus();
	    dataChannelSend.placeholder = "";
	    sendButton.disabled = false;
	  } else {
	    dataChannelSend.disabled = true;
	    sendButton.disabled = true;
	  }
}

//--------------------------------------------------------------------
// ICE candidates management
//--------------------------------------------------------------------
function handleIceCandidate(event) {
  console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
  } else {
    console.log('End of candidates.');
  }
}

//--------------------------------------------------------------------
// Create Offer
//--------------------------------------------------------------------
function doCall() {
  console.log('Creating Offer...');
  pc.createOffer(setLocalAndSendMessage, onSignalingError, sdpConstraints);
}

//--------------------------------------------------------------------
// Signalling error handler
//--------------------------------------------------------------------
function onSignalingError(error) {
	console.log('Failed to create signaling message : ' + error.name);
}

//--------------------------------------------------------------------
// Create Answer
//--------------------------------------------------------------------
function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer(setLocalAndSendMessage, onSignalingError, sdpConstraints);
}

//--------------------------------------------------------------------
// Success handler for both createOffer()
// and createAnswer()
//--------------------------------------------------------------------
function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  sendMessage(sessionDescription);
}

//--------------------------------------------------------------------
// Remote stream handlers...
//--------------------------------------------------------------------
function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  attachMediaStream(remoteVideo, event.stream);
  console.log('Remote stream attached!!.');
  remoteStream = event.stream;
}

//--------------------------------------------------------------------
// Handle event when Remote Stream is removed
//--------------------------------------------------------------------
function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}


//--------------------------------------------------------------------
// Clean-up functions
//--------------------------------------------------------------------
function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

//--------------------------------------------------------------------
// Remote Session Terminated
//--------------------------------------------------------------------
function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

//--------------------------------------------------------------------
// Stopping
//--------------------------------------------------------------------
function stop() {
  isStarted = false;
  if (sendChannel) sendChannel.close();
  if (receiveChannel) receiveChannel.close();
  if (pc) pc.close();
  pc = null;
  sendButton.disabled=true;
}

function getCharacters(nCharacters){
  var data16 = "0123456789ABCDEF";
  var strResult = "";
  var i = 0;
  for(i=0; i < nCharacters/data16.length; i++){
    strResult += data16;
  }
  console.log("Result length: " + strResult.length);

  return strResult;
}

//--------------------------------------------------------------------
//Sending data
//--------------------------------------------------------------------
setInterval(function () {
    var readyStateSendChannel = "close";
    var readyStateReceiveChannel = "close";
    var readyState = "close";
    var bar = new ProgressBar();
    var dataToSend = getCharacters(1024);
    sendTextarea.value = dataToSend;

    if(typeof sendChannel !== 'undefined'){
      readyStateSendChannel = sendChannel.readyState;
    }
    if(typeof receiveChannel !== 'undefined'){
      readyStateReceiveChannel = receiveChannel.readyState;
    }

    if(readyStateSendChannel === "open" || readyStateReceiveChannel === "open"){
      readyState = "open";
    }

    if(sampleCounter >= sampleTime && firstTime) {
      firstTime = false;
      bar.setPercentage(100);
      hangup();
    }
    else {
      if(readyState === "open") {
        bar.setPercentage((sampleCounter / sampleTime) * 100);
        sampleCounter++;
        console.log(dataToSend);
        sendData();
      }
    }
}, 10);

//--------------------------------------------------------------------
