#  [![NPM version][npm-image]][npm-url] [![Build Status] [![Dependency Status][daviddm-image]][daviddm-url]

> WebRTC based communication manager.


## Install

```sh
$ npm install --save p2p-comm
```


## Usage

```js
var p2pComm = require('p2p-comm');

p2pComm('Rainbow');
```

```sh
$ npm install --global p2p-comm
$ p2p-comm --help
```

```sh
# creates a browser.js
$ npm run browser
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
* Handshake step
* RTT measure
* Heartbeat step
* Peering algorithm (K nodes)
* Basic communication between peers (e.g. broadcast, send, receive)
 
##Libraries
* https://github.com/priologic/easyrtc

###References
* ```http://en.wikipedia.org/wiki/Overlay_network```
* ```http://katemats.com/distributed-systems-basics-handling-failure-fault-tolerance-and-monitoring/```

