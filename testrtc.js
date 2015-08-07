/**
 * Created by: Servio on 6/5/2015.
 * Source: test.js
 * Author: Servio Palacios
 * Description: The communication manager tester.
 */

"use strict";

var easyrtc = require('easyrtc');
easyrtc.enableDebug = require('easyrtc').enableDebug;
var selfEasyrtcid = "";
var connectList = {};
var channelIsActive = {}; // tracks which channels are active
var server = "";
var port = "";

function connect(pserver, pport) {
  server = pserver;
  port = pport;

  //console.log(easyrtc, server, port);
  easyrtc.enableDebug(false);

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

}

connect("https://demo-project-maverikzhn.c9.io/", "8080");
