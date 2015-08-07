/**
 * Created by: Servio on 6/1/2015.
 * Source: Communicator.js
 * Author: Servio Palacios
 * Description: The communication manager is responsible of managing all the JSpeed network
 *              operations using WebRTC. This includes, add, modify, and remove sandboxes, this is, keep
 *              track of the global state of the JSpeed sandBoxes, maintain communication with the server,
 *              and socket states. It will also manage new socket.io connections, new RTC connections,
 *              receive, and send data through the network.
 */

"use strict";
var emitter = require('events').EventEmitter; /* Event Emitter Module */
var util = require('util'); /* NodeJS Utils Module */
var easyrtc = require('easyrtc');
//var selfEasyrtcid = "";
var connectList = {};
var channelIsActive = {}; // tracks which channels are active


function Communicator() {

  //var self = this;
  this.selfEasyrtcid = "";
  this.test = "Prueba";
  //easyrtc.maverick = "maverick";
  //easyrtc.enableDebug(false);
  //this.easyrtc.enableDebug(false);
  easyrtc.enableDataChannels(true);

}

//TODO
Communicator.prototype.addToConversation = function(who, msgType, content) {

}


/**
 * Connect to a remote server s in port p.
 * @param {s, p} server, port
 */
Communicator.prototype.connect = function (server, port) {
  this.server = server;
  this.port = port;

  console.log(easyrtc, server, port);

  easyrtc.enableDebug(false);
  easyrtc.enableDataChannels(true);
  easyrtc.enableVideo(false);
  easyrtc.enableAudio(false);
  easyrtc.enableVideoReceive(false);
  easyrtc.enableAudioReceive(false);
  easyrtc.setDataChannelOpenListener(openListener);
  easyrtc.setDataChannelCloseListener(closeListener);
  easyrtc.setPeerListener(addToConversation);
  easyrtc.setRoomOccupantListener(convertListToButtons);
  easyrtc.connect("easyrtc.dataMessaging", loginSuccess, loginFailure);
  //easyrtc.setPeerListener(addToConversation);
  //easyrtc.setRoomOccupantListener(convertListToButtons);
  //              Application Name,         Success CB, Error CB
  //easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);

  //Success Callback
  function loginSuccess(easyrtcid) {
    this.selfEasyrtcid = easyrtcid;
    console.log("I am " + easyrtcid);
  }

  //Failure CallBack
  function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
  }

};

//TODO
function convertListToButtons (roomName, occupants, isPrimary) {
  var otherClientDiv = document.getElementById('otherClients');
  while (otherClientDiv.hasChildNodes()) {
    otherClientDiv.removeChild(otherClientDiv.lastChild);
  }

  for(var easyrtcid in occupants) {
    var button = document.createElement('button');
    button.onclick = function(easyrtcid) {
      return function() {
        sendStuffWS(easyrtcid);
      };
    }(easyrtcid);
    var label = document.createTextNode("Send to " + easyrtc.idToName(easyrtcid));
    button.appendChild(label);

    otherClientDiv.appendChild(button);
  }
  if( !otherClientDiv.hasChildNodes() ) {
    console.log("Nobody else logged in to talk to...");
  }
}

/* extend the EventEmitter class using our Communicator class */
//util.inherits(Communicator, emitter);
/* we specify that this module is a reference to the Communicator class */
module.exports = Communicator;
