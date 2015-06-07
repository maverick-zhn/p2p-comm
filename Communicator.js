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

function Communicator() {

  //var self = this;
  this.selfEasyrtcid = "";

  function connect(s, p) {
    this.server = s;
    this.port = p
    //easyrtc.setPeerListener(addToConversation);
    //easyrtc.setRoomOccupantListener(convertListToButtons);
    //                   Application Name,         Success CB, Error CB
    easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);

    function loginSuccess(easyrtcid) {
      this.selfEasyrtcid = easyrtcid;
      console.log("I am " + easyrtcid);
    }

    function loginFailure(errorCode, message) {
      easyrtc.showError(errorCode, message);
    }

  };


}

//TODO
Communicator.prototype.addToConversation = function(who, msgType, content) {

}


/**
 * Connect to a remote server s in port p.
 * @param {s, p} server, port
 */
Communicator.prototype.connect = function (s, p) {
  this.server = s;
  this.port = p
  easyrtc.setPeerListener(addToConversation);
  easyrtc.setRoomOccupantListener(convertListToButtons);
  //                   Application Name,         Success CB, Error CB
  easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);

  function loginSuccess(easyrtcid) {
    this.selfEasyrtcid = easyrtcid;
    console.log("I am " + easyrtcid);
  }

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

/* extend the EventEmitter class using our Communication Manager class */
util.inherits(Communicator, emitter);
/* we specify that this module is a reference to the Communication Manager class */
module.exports = Communicator;
