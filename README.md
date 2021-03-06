#  [![NPM version][npm-image]][npm-url] [![Build Status] [daviddm-image]][![Dependency Status][daviddm-image]][daviddm-url]

> WebRTC based communication manager.


## Install

```sh
$ npm install --save p2p-comm
```


## Usage

```js
var p2pComm = require('p2p-comm');

p2pComm.connect('server', 'port');
```

```sh
$ npm install --global p2p-comm
$ p2p-comm --help
```

## License

MIT © [Servio Palacios](http://www.maverick-z.com)

[npm-image]: https://badge.fury.io/js/p2p-comm.svg
[npm-url]: https://npmjs.org/package/p2p-comm
[travis-image]: https://travis-ci.org/maverick-zhn/p2p-comm.svg?branch=master
[travis-url]: https://travis-ci.org/maverick-zhn/p2p-comm
[daviddm-image]: https://david-dm.org/maverick-zhn/p2p-comm.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/maverick-zhn/p2p-comm
=======
# p2p-comm
NodeJS Communication Manager, Peer to Peer Basic communication

##TODO
* ~~Read related papers~~
* ~~Get started with infrastructure and related repositories~~
* ~~Define basic handshake protocol using STUN/ICE, and RTP stack (Transport/Session)~~
* ~~Read ( - easyRTC signaling server details, - API http://www.easyrtc.com/docs/browser/easyrtc.php)~~
* ~~Implement Basic data channel communication between peers~~
* Implement a data channel communication between peers using nodejs
* ~~connect() method implementation using EasyRTC~~
* ~~Implement connect method~~
* ~~Implement send method~~
* ~~Implement receive method~~
* ~~Implement dataChannel on client Javascript App~~
* ~~Implement Signaling Server on SocketCluster~~
* Design and Implement Network Topology Actualization Algorithm
* Create Benchmarking Module to measure the effectiveness of new updated topology
* Document progress up to this checkpoint
* Design and Implement K-Peer Communication Manager Algorithm
* Define variables that are shared along all clients in a room
* Implement connectivity between peers using rooms
* Implement security using rooms' concept
* Implement K-Peering algorithm using rooms' concept
* Implement Broadcast, Send and Receive using Data Channel
* Document progress up to this checkpoint
* ~~Create Module Template~~
* Comply Google style guide, code revision
* Create module, document module, upload to npm
* Write this part of the paper
* Verify with Writing Lab

###TODO  
* RTCIceServer.url is deprecated! Use urls instead. 
* Use of getPreventDefault() is deprecated.  Use defaultPrevented instead.

###Signaling Server
* http://blog.sococo.com/product/news-and-events/webrtc-signaling-here-be-dragons.html
* Here are some problems with Socket.IO at high scale level.
* https://github.com/spromano/WebRTC_Book
* http://stackoverflow.com/questions/24153053/listing-all-the-clients-connected-to-a-room-in-socket-io-version-1

###Testing
* https://ide.c9.io/maverikzhn/demo-project
* https://golang.org/doc/install/source
* https://gist.github.com/isaacs/579814
* http://pouchdb.com/getting-started.html
 
##Libraries
* https://github.com/priologic/easyrtc
* http://lynckia.com/licode/index.html
* http://sourcey.com/symple/

###Spark
* http://www.cs.berkeley.edu/~rxin/
* https://databricks.com/blog/2015/01/15/improved-driver-fault-tolerance-and-zero-data-loss-in-spark-streaming.html
* https://spark-summit.org/2014/training
* https://spark-summit.org/2014/talk/sparkling-identification-of-task-skew-and-speculative-partition-of-data-for-spark-applications

###References
* http://en.wikipedia.org/wiki/Overlay_network
* http://katemats.com/distributed-systems-basics-handling-failure-fault-tolerance-and-monitoring/
* https://github.com/yeoman/generator-node/blob/master/README.md
* http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
* http://en.wikipedia.org/wiki/Distributed_hash_table
* http://nms.csail.mit.edu/ron/
* https://github.com/yang/sron
* http://www.smashingmagazine.com/2014/01/23/understanding-javascript-function-prototype-bind/
* http://oboejs.com/why
* http://phantomjs.org/
* http://dcg.ethz.ch/lectures/podc_allstars/
* https://google.github.io/lovefield/
* http://cci.drexel.edu/bigdata/bigdata2014/big-data-stream-mining-tutorial.pdf
* https://cwiki.apache.org/confluence/display/FLINK/Stateful+Stream+Processing
* https://docs.google.com/document/d/15Ome_2bAzARNeZMJLkUSoLWn-kPISzW0N2yLOXz4Zvw/edit#heading=h.3byjyuxpqscc

###Javascript
* https://www.udemy.com/understand-javascript/#/lecture/2573912
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence#Table
* http://underscorejs.org/
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
* http://www.typescriptlang.org/
* https://github.com/google/traceur-compiler
* https://google.github.io/traceur-compiler/demo/repl.html#
* https://github.com/lukehoban/es6features
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
* http://www.sitepoint.com/understanding-module-exports-exports-node-js/
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
* http://www.linfo.org/rule_of_silence.html
* http://stackoverflow.com/questions/29387286/how-to-communicate-with-socket-cluster-server-with-python-as-client
* http://javascriptissexy.com/javascript-apply-call-and-bind-methods-are-essential-for-javascript-professionals/
* http://javascriptissexy.com/understand-javascripts-this-with-clarity-and-master-it/
* http://www.javascriptkata.com/2007/03/29/how-to-use-javascript-hashes/
* https://webrtc.github.io/samples/src/content/datachannel/filetransfer/
* http://peerjs.com/docs/#api
* http://rundeck.org

###Code, Stilying
* http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml#Internet_Explorer_s_Conditional_Comments

###WebRTC
* https://webrtchacks.com/
* http://webrtc.github.io/samples/
* http://www.w3.org/TR/webrtc/
* http://www.html5rocks.com/en/tutorials/webrtc/datachannels/
* http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/#how-can-i-build-a-signaling-service
* http://chimera.labs.oreilly.com/books/1230000000545/ch18.html#_audio_and_video_engines
* https://github.com/vmolsa/webrtc-native
* http://socket.io/docs/rooms-and-namespaces/
* ```https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socket.io/PeerConnection.js```
* [Reserving Bandwidth] https://www.webrtcexample.com/blog/?go=all/reserving-bandwidth/
* https://webrtchacks.com/
* https://github.com/otalk/filetransfer/blob/master/filetransfer.js
* https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel
* [BUGS FIXED] https://bugzilla.mozilla.org/show_bug.cgi?id=1064247
* https://fosterelli.co/getting-started-with-webrtc-data-channels.html
* https://simplewebrtc.com/notsosimple.html
* http://peerjs.com/
* https://simplewebrtc.com/

###Security
* https://webrtc-security.github.io/

###Issues with WebRTC and EasyRTC
* https://groups.google.com/forum/#!topic/easyrtc/XMsCpDMgaX4

###Module exports
* http://stackoverflow.com/questions/10462223/call-a-local-function-within-module-exports-from-another-function-in-module-ex
* http://stackoverflow.com/questions/22005002/node-js-typeerror-object-object-has-no-method-existssync
* http://www.hacksparrow.com/node-js-exports-vs-module-exports.html

###Network and Javascript assesments
* http://code.jpardanaud.com/speedtest/
* https://github.com/ddsol/speedtest.net

###Trello
https://trello.com/b/9vMdqkI1/trueno-io

https://www.usenix.org/conference/osdi14/technical-sessions
http://riteshkr.com/embed.js/
https://github.com/mindeavor/es-pipeline-operator
