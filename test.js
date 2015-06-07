/**
 * Created by: Servio on 6/5/2015.
 * Source: test.js
 * Author: Servio Palacios
 * Description: The communication manager tester.
 */

"use strict";
var communicator = require('./Communicator'); /* Communicator Library */
//var communicator = new Communicator();
var connect = communicator.connect("https://demo-project-maverikzhn.c9.io/", "8080");
//var selfEasyrtcid = "";

console.log("Testing Communicator");

//communicator.connect("https://demo-project-maverikzhn.c9.io/", "8080");
