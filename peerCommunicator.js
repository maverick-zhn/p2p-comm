"use strict";
var webrtc = require('webrtcsupport');
var PeerConnection = require('rtcpeerconnection');
var WildEmitter = require('wildemitter');
var FileTransfer = require('filetransfer');
/**      In God we trust
 * Created by: Servio Palacios on 2015.07.25.
 * Source: peerCommunicator.js
 * Author: Servio Palacios
 * Description: It takes care of peer to peer communication through WebRTC
 * It establishes connection between peers connecting to a signaling server
 *
 */

/*TODO
 Signaling Server (SS)
 Secure Signaling Server (SSS) (Use TLS)
 Secure Peer to Peer connection establishment using SS
 Basic Peer to Peer communication
 Connect peers that are not within browsers
 */

/*var Enums = require('./enums'),
    SocketCluster = require("socketcluster-client");*/

/**
 * @constructor
 * @extends {EventEmitter}
 */
function PeerCommunicator(options) {

    var self = this;

    Object.defineProperty(this, "_id", {
        get: function () {
            return self._socket.id;
        }
    });

    /*Setting Signaling Server Address and port. Channels and peers which peer is connected to, and
      */
    this._ssport = ssport || null;
    this._ssaddress = ssaddress || null;
    //this._socketCluster = SocketCluster;
    this._rtcid = null;
    this._socket = null;
    this._channels = {};
    this._peers = {};
    this._debug = false;
    this._dataChannel = true;
    this._media = 'datachannel';
    this._channelIsACtive = [];
    this._peersReadyList = [];
    this._connectList = []; //Connected peers in room
    this._occupantList = []; //Occupants in room

    /* Setting events enums */
    /*this._SSEvents = Enums.signalingServerEvents;
    this._responseEvents = Enums.responseEvents;
    this._announceEvents = Enums.announceEvents;*/

    /******************************************************************************/
    /* Detecting Browser's Type */
    this.getUserMedia = null;
    this.attachMediaStream = null;
    this.reattachMediaStream = null;
    this.webrtcDetectedBrowser = null;
    this.webrtcDetectedVersion = null;

    /*****************************************************************************/
    /*******  SimpleRTC based features *******************************************/
    /*****************************************************************************/
    this.id = options.id;
    this.parent = options.parent;
    this.type = options.type || 'video';
    this.oneway = options.oneway || false;
    this.sharemyscreen = options.sharemyscreen || false;
    this.browserPrefix = options.prefix;
    this.stream = options.stream;
    this.enableDataChannels = options.enableDataChannels === undefined ? this.parent.config.enableDataChannels : options.enableDataChannels;
    this.receiveMedia = options.receiveMedia || this.parent.config.receiveMedia;
    this.channels = {};
    this.sid = options.sid || Date.now().toString();

    // Create an RTCPeerConnection
    this.pc = new PeerConnection(this.parent.config.peerConnectionConfig,
                                 this.parent.config.peerConnectionConstraints);

    //On Ice Candidate
    this.pc.on('ice', this.onIceCandidate.bind(this));

    // Offer
    this.pc.on('offer', function (offer) {
        if (self.parent.config.nick) offer.nick = self.parent.config.nick;
        self.send('offer', offer);
    });

    // Answer
    this.pc.on('answer', function (answer) {
        if (self.parent.config.nick) answer.nick = self.parent.config.nick;
        self.send('answer', answer);
    });

    // Addstream
    this.pc.on('addStream', this.handleRemoteStreamAdded.bind(this));

    // Addchannel
    this.pc.on('addChannel', this.handleDataChannelAdded.bind(this));

    // Removestream
    this.pc.on('removeStream', this.handleStreamRemoved.bind(this));

    // Just fire negotiation needed events for now
    // When browser re-negotiation handling seems to work
    // we can use this as the trigger for starting the offer/answer process
    // automatically. We will leave it be for now while this stabilizes.
    this.pc.on('negotiationNeeded', this.emit.bind(this, 'negotiationNeeded'));

    //IceConnectionStateChange
    this.pc.on('iceConnectionStateChange', this.emit.bind(this, 'iceConnectionStateChange'));

    //IceConnectionStateChange
    this.pc.on('iceConnectionStateChange', function () {
        switch (self.pc.iceConnectionState) {
            case 'failed':
                // currently, in chrome only the initiator goes to failed
                // so we need to signal this to the peer
                if (self.pc.pc.peerconnection.localDescription.type === 'offer') {
                    self.parent.emit('iceFailed', self);
                    self.send('connectivityError');
                }
                break;
        }
    });
    this.pc.on('signalingStateChange', this.emit.bind(this, 'signalingStateChange'));
    this.logger = this.parent.logger;

    // handle screensharing/broadcast mode
    if (options.type === 'screen') {
        if (this.parent.localScreen && this.sharemyscreen) {
            this.logger.log('adding local screen stream to peer connection');
            this.pc.addStream(this.parent.localScreen);
            this.broadcaster = options.broadcaster;
        }
    } else {
        this.parent.localStreams.forEach(function (stream) {
            self.pc.addStream(stream);
        });
    }

    // call emitter constructor
    WildEmitter.call(this);

    //channelOpen
    this.on('channelOpen', function (channel) {
        if (channel.protocol === INBAND_FILETRANSFER_V1) {
            channel.onmessage = function (event) {
                var metadata = JSON.parse(event.data);
                var receiver = new FileTransfer.Receiver();
                receiver.receive(metadata, channel);
                self.emit('fileTransfer', metadata, receiver);
                receiver.on('receivedFile', function (file, metadata) {
                    receiver.channel.close();
                });
            };
        }
    });

    // proxy events to parent
    this.on('*', function () {
        self.parent.emit.apply(self.parent, arguments);
    });
}//PeerCommunicator Constructor

/* Detects the type of browser and compatibility */
PeerCommunicator.prototype.detectBrowser = function () {

    var self = this;

    /*if (typeof callback !== 'function' && callback !== undefined) {
        throw new Error("Optional first parameter must be a valid function");
    }
    return this; //Makes this method chainable*/

    if (navigator.mozGetUserMedia) {

        if( self._debug === true){
            console.log("This appears to be Firefox");
        }

        self.webrtcDetectedBrowser = "firefox";

        var matches = navigator.userAgent.match(/\srv:([0-9]+)\./);
        if (matches !== null && matches.length > 1) {
            self.webrtcDetectedVersion = parseInt(matches[1]);
        }

        // The RTCPeerConnection object.
        window.RTCPeerConnection = window.mozRTCPeerConnection;
        // The RTCSessionDescription object.
        window.RTCSessionDescription = window.mozRTCSessionDescription;
        // The RTCIceCandidate object.
        window.RTCIceCandidate = window.mozRTCIceCandidate;
        // Get UserMedia (only difference is the prefix).
        // Code from Adam Barth.
        window.getUserMedia = navigator.mozGetUserMedia.bind(navigator);
        // Creates iceServer from the url for FF.
        window.createIceServer = function(url, username, password) {
            var iceServer = null;
            var url_parts = url.split(':');
            var turn_url_parts;
            if (url_parts[0].indexOf('stun') === 0) {
                // Create iceServer with stun url.
                iceServer = {'url': url};
            } else if (url_parts[0].indexOf('turn') === 0 &&
                (url.indexOf('transport=udp') !== -1 ||
                url.indexOf('?transport') === -1)) {
                // Create iceServer with turn url.
                // Ignore the transport parameter from TURN url.
                turn_url_parts = url.split("?");
                iceServer = {'url': turn_url_parts[0],
                    'credential': password,
                    'username': username};
            }
            return iceServer;
        };
        // Attach a media stream to an element.
        self.attachMediaStream = function(element, stream) {
            //        console.log("Attaching media stream");
            element.mozSrcObject = stream;
            element.play();
        };
        self.reattachMediaStream = function(to, from) {
            //        console.log("Reattaching media stream");
            to.mozSrcObject = from.mozSrcObject;
            to.play();
        };
        if (self.webrtcDetectedVersion < 23) {
            // Fake get{Video,Audio}Tracks
            MediaStream.prototype.getVideoTracks = function() {
                return [];
            };
            MediaStream.prototype.getAudioTracks = function() {
                return [];
            };
        }
    } else if (navigator.webkitGetUserMedia) {
        if( self._debug === true) {
            console.log("This appears to be Chrome");
        }

        self.webrtcDetectedBrowser = "chrome";
        self.webrtcDetectedVersion =
            parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);
        // Creates iceServer from the url for Chrome.
        window.createIceServer = function(url, username, password) {
            var iceServer = null;
            var url_turn_parts;
            var url_parts = url.split(':');
            if (url_parts[0].indexOf('stun') === 0) {
                // Create iceServer with stun url.
                iceServer = {'url': url};
            } else if (url_parts[0].indexOf('turn') === 0) {
                if (self.webrtcDetectedVersion < 28) {
                    // For pre-M28 chrome versions use old TURN format.
                    url_turn_parts = url.split("turn:");
                    iceServer = {'url': 'turn:' + username + '@' + url_turn_parts[1],
                        'credential': password};
                } else {
                    // For Chrome M28 & above use new TURN format.
                    iceServer = {'url': url,
                        'credential': password,
                        'username': username};
                }
            }
            return iceServer;
        };
        // The RTCPeerConnection object.
        window.RTCPeerConnection = window.webkitRTCPeerConnection;
        // Get UserMedia (only difference is the prefix).
        // Code from Adam Barth.
        window.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
        // Attach a media stream to an element.
        self.attachMediaStream = function(element, stream) {
            if (typeof element.srcObject !== 'undefined') {
                element.srcObject = stream;
            } else if (typeof element.mozSrcObject !== 'undefined') {
                element.mozSrcObject = stream;
            } else if (typeof element.src !== 'undefined') {
                element.src = URL.createObjectURL(stream);
            } else {
                console.log('Error attaching stream to element.');
            }
        };
        self.reattachMediaStream = function(to, from) {
            to.src = from.src;
        };


    } else {
        console.log("Browser does not appear to be WebRTC-capable");
    }

    if( self._debug === true) {
        console.log("Detected Browser: " + self.webrtcDetectedBrowser);
    }

    if (!window.createIceServer) {
        window.createIceServer = function(url, username, credential) {
            return {'url': url, 'credential': credential, 'username': username};
        };
    }

};

/* Detects the browser's type (chrome or firefox) and compatibility */
PeerCommunicator.prototype.getBrowser = function () {
    var self = this;
    if( self._debug === true) {
        console.log("Detected Browser: " + self.webrtcDetectedBrowser);
    }
    if (self.webrtcDetectedBrowser === null){
        throw new Error("You must call .detectBrowser() first.");
    }

    return self.webrtcDetectedBrowser;
};

/* Detects the version of browser and compatibility */
/* You need to call .detectBrowser to obtain this values */
PeerCommunicator.prototype.getVersion = function () {
    var self = this;

    if ( self._debug === true) {
        console.log("Detected Version: " + self.webrtcDetectedVersion);
    }

    if (self.webrtcDetectedVersion === null) {
        throw new Error("You must call .detectBrowser() first.");
    }

    return self.webrtcDetectedVersion;
};

/* Setting ICE Server */
PeerCommunicator.prototype.createICEServer = function () {

    return this;
};

/* Getting RTC id */
PeerCommunicator.prototype.getRTCid = function () {
    return this._rtcid;
};

/* Getting Signaling Server Port */
PeerCommunicator.prototype.getSSPort = function () {
    return this._ssport;
};

/* Getting Signaling Server Address */
PeerCommunicator.prototype.ssaddress = function () {
    return this._ssaddress;
};

/* Setting Debug flag to True or False */
PeerCommunicator.prototype.enableDebug = function (enabled) {

    return this._debug = enabled;
};

/* Enabling or disabling DataChannels */
PeerCommunicator.prototype.enableDataChannel = function (enabled) {
    return this._dataChannel = enabled;
};

/* Setting Signaling Server Port */
PeerCommunicator.prototype.setSSPort = function (ssport) {
    this._ssport = ssport;
};

/* Setting Signaling Server Address */
PeerCommunicator.prototype.setSSAddress = function (ssaddress) {
    this._ssaddress = ssaddress;
};

/*
 */
PeerCommunicator.prototype.connect = function (ssaddress, ssport) {

    this._ssport = ssport || this._ssport;
    this._ssaddress = ssaddress || this._ssaddress;

    if (typeof this._ssport !== 'number' || typeof this._ssaddress !== 'string') {
        throw new Error("Signaling Server Port and Address are required");
    }

    var options = {
        port: this._ssport,
        hostname: this._ssaddress
    };

    this._socket = null; //this._socketCluster.connect(options);

    /* Binding all default events */
    /*this._socket.on('error', function () {
        this.onError();
    }.bind(this));

    this._socket.on('connect', function () {
        if (this._onConnect) {
            this._onConnect();
        }
    }.bind(this));

    this._socket.on('disconnect', function () {
        this.onDisconnect();
    }.bind(this));

    this._socket.on('connectAbort', function () {
        this.onConnectAbort();
    }.bind(this));

    this._socket.on('kickOut', function () {
        this.onKickOut();
    }.bind(this));

    this._socket.on('subscribe', function () {
        this.onSubscribe();
    }.bind(this));

    this._socket.on('subscribeFail', function () {
        this.onSubscribeFail();
    }.bind(this));

    this._socket.on('unsubscribe', function () {
        this.onUnSubscribe();
    }.bind(this));

    this._socket.on('authenticate', function () {
        this.onAuthenticate();
    }.bind(this));
    */

    /* Binding Announcement events */
    /*this._socket.on(this._announceEvents.PEER_FAILURE_ANNOUNCEMENT, function () {
        this.onPeerFailureAnnouncement();
    }.bind(this));

    this._socket.on(this._announceEvents.JOB_ERROR_ANNOUNCEMENT, function () {
        this.onJobErrorAnnouncement();
    }.bind(this));

    this._socket.on(this._announceEvents.JOB_RESULT_ANNOUNCEMENT, function () {
        this.onJobResultAnnouncement();
    }.bind(this));*/
};

/* Defines if environment is compatible with P2P communications  */
PeerCommunicator.prototype.isEnvironmentCompatible = function () {

    /* If its not in a window environment, error */
    /* Review this part */
    /* Wouldn't be better to send the global object as parameter in the constructor? */
    if ( typeof window === "undefined" ) {
        throw new Error("This method must be only used in a browser environment.");
    }

    /* If web sockets, web workers, and web rtc are available, then its compatible */
    return typeof(window.WebSocket) !== "undefined"
        && typeof(window.Worker) !== "undefined"
        && (typeof(window.mozRTCPeerConnection) !== "undefined"
        || typeof(window.webkitRTCPeerConnection) !== "undefined");
};

/********************************** EVENT SECTION ***************************************/
/*   When Peer is authenticated against Signaling Server  */
PeerCommunicator.prototype.onAuthenticate = function () {

};

/*  When Peer is connected against Signaling Server  */
PeerCommunicator.prototype.onConnect = function (fn) {

    this._onConnect = fn;
};

/*  When Peer connection is aborted  */
PeerCommunicator.prototype.onConnectAbort = function () {

};

/*  When Peer is disconnected from Signaling Server  */
PeerCommunicator.prototype.onDisconnect = function () {

};

/*  When error occurs when establishing connection with Signaling Server  */
PeerCommunicator.prototype.onError = function () {

};

/*  When kick-out occurs on connection with Signaling Server  */
PeerCommunicator.prototype.onKickOut = function () {

};

/*  When on Subscribe event occurs on connection with Signaling Server  */
PeerCommunicator.prototype.onSubscribe = function () {

};

/*  When on Subscribe event fails on connection with Signaling Server  */
PeerCommunicator.prototype.onSubscribeFail = function () {

};

/*  When unSubscribe event occurs on connection with Signaling Server  */
PeerCommunicator.prototype.onUnSubscribe = function () {

};

/*  When Peer Failure occurs with Signaling Server  */
PeerCommunicator.prototype.onPeerFailureAnnouncement = function () {

};

/* Job Error occurs  */
PeerCommunicator.prototype.onJobErrorAnnouncement = function () {

};

/* Get connection status with Signaling Server and Peers  */
PeerCommunicator.prototype.getConnectionStatus = function () {
    console.log("Get connection status");
};

// Send via signalling channel
//TODO
PeerCommunicator.prototype.send = function (messageType, payload) {
    var message = {
        to: this.id,
        sid: this.sid,
        broadcaster: this.broadcaster,
        roomType: this.type,
        type: messageType,
        payload: payload,
        prefix: webrtc.prefix
    };

    if ( self._debug === true) {
        console.log("sending through SS: type[" + messageType + "] Message[" + message + "]");
    }
    this.parent.emit('message', message);
};


/* Sends data from current RTCid to other peer RTCid  */
/* TODO
  Maybe I need a wrapper for this
 */
PeerCommunicator.prototype.sendDataP2P = function ( otherPeerRTCid, messageType, payload ) {

    var message = {
        type: messageType,
        payload: payload
    };
    if ( self._debug === true) {
        console.log("sending via datachannel: channel[" + channel + " messagetype[" + messageType + "] Message[" + message + "]");
    }

    var dc = this.getDataChannel(channel);
    if (dc.readyState != 'open') return false;
    dc.send(JSON.stringify(message));
    return true;

    /*if (self.getConnectionStatus(otherPeerRTCid) === this._SSEvents.NOT_CONNECTED) {
        //rtc.sendDataP2P(otherPeerRTCid, 'msg', text);
    }
    else {
        throw new Error("NOT-CONNECTED to " + otherPeerRTCid + " yet.");
    }
    */
};

/* Sends data from current RTCid to other peer RTCid in a compressed manner */
PeerCommunicator.prototype.sendCompressedDataP2P = function ( otherPeerRTCid, DataType, Payload ) {

};

/*
 Sends broadcast message to all peers in room if room is defined, if don't then sends broadcast
 to all connected peers ._peers
 */
PeerCommunicator.prototype.sendBroadcast = function ( room ) {

};

/* Leaves room, sending broadcast message to all peers */
PeerCommunicator.prototype.leaveRoom = function (rtcid, room) {

};

/* Data Channel Open Listener between peers */
PeerCommunicator.prototype._setDataChannelOpenListener = function (openListenerCB) {

};

/* Data Channel Close Listener between peers */
PeerCommunicator.prototype._setDataChannelOpenListener = function (closeListenerCB) {

};

/* Callback Opening listeners between peers */
PeerCommunicator.prototype._openListener = function (otherParty) {
    self._channelIsActive[otherParty] = true;
    self._peersReadyList[otherParty] = otherParty;
    //keepReporting = Object.keys(readyList).length > 0;
};

/* Callback Closing listeners between peers */
PeerCommunicator.prototype._closeListener = function (otherParty) {
    self._channelIsActive[otherParty] = false;
    delete self._peersReadyList[otherParty];
    //keepReporting = Object.keys(readyList).length > 0;
};


/* Set peer listener */
/* TODO
  Change callback name
 */
PeerCommunicator.prototype._setPeerListener = function (callback) {

};

/* Set Room ocupant  listener */
/* TODO
 Change callback name
 */
PeerCommunicator.prototype._setOccupantListener = function (callback) {

};

/* Start peer call */
/* TODO
 Determine which peer should I start call with
 */
PeerCommunicator.prototype._startCall = function () {

    //Walks through the whole peers connected
    /*for (var otherPeerRTCid in self._connectList) {
        if (self.getConnectionStatus(otherPeerRTCid) === this._SSEvents.NOT_CONNECTED) {
            try {
                rtc.call(otherPeerRTCid,
                    function(caller, media) { // success callback
                        if (media === 'datachannel') {
                            // console.log("made call succesfully");
                            connectList[otherPeerRTCid] = true;

                            readyList[otherPeerRTCid] = otherPeerRTCid;
                        }
                    },
                    function(errorCode, errorText) {
                        connectList[otherPeerRTCid] = false;
                        //rtc.showError(errorCode, errorText);
                    },
                    function(wasAccepted) {

                    }
                );
            }catch( callerror ) {
                throw new Error("Saw call error.");
            }
        }//If
    }//FOR*/
};

/* we specify that this module is a reference to the Metrics Manager class */
module.exports = PeerCommunicator;