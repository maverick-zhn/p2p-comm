/**
 * Created by maverick on 7/16/15.
 */

/*var config = require("../configuration");
var PeerCommunicator =  require("../lib/peerCommunicator");*/

var p2pComm = new PeerCommunicator();

p2pComm.getConnectionStatus();

p2pComm.connect("address", 8080);

console.log( "Compatible " + p2pComm.isEnvironmentCompatible() );
p2pComm.enableDebug(true);
//p2pComm.detectBrowser();
p2pComm.getVersion();

//Maverick
console.log("one stun server from config" + config.supervisor.stunServers[1].url);

/*var SocketCluster = require('socketcluster').SocketCluster;
var socketCluster = new SocketCluster({
    balancers: 1, // Number of loadbalancer processes to launch
    workers: 1, // Number of worker processes
    stores: 1, // Number of store processes
    port: 8000, // The port number on which your server should listen
    appName: 'myapp', // A unique name for your app

    /* A JS file which you can use to configure each of your
     * workers/servers - This is where most of your backend code should go
     */
    //workerController: __dirname + config.supervisor.workerScript,

    /* Maximum number of events a single socket can be subscribed to
     * (security feature, optional, defaults to 100)
     */
    //socketEventLimit: 100,

    // Whether or not to reboot the worker in case it crashes (defaults to true)
    //rebootWorkerOnCrash: true
//});