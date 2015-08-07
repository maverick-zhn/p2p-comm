/**
 * Created by: Servio on 6/5/2015.
 * Source: test.js
 * Author: Servio Palacios
 * Description: The communication manager tester.
 */

"use strict";
var Communicator = require('./Communicator'); /* Communicator Library */
var communicator = new Communicator();
//var connect = communicator.connect("https://demo-project-maverikzhn.c9.io/", "8080");
//communicator.connect("https://demo-project-maverikzhn.c9.io/", "8080");
//var selfEasyrtcid = "";
console.log("Testing Communicator");
var connect = communicator.connect("https://demo-project-maverikzhn.c9.io/", "8080");
console.log("Testing Communicator");
console.log(communicator.test);

//communicator.connect("https://demo-project-maverikzhn.c9.io/", "8080");
