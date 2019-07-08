/**
 * Copyright 2019 Paul Reed
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/ module.exports = function(RED) {
    function Watt2kWhNode(config) {
        RED.nodes.createNode(this,config);
	this.maximum = config.maximum;
        var node = this;
            switch(config.format) {
		case 'j': // joule
                   this.output=1e-3;
                    break;
                case 'kj': // kilojoule
                   this.output=1;
                    break;
                case 'wh': // watthours
                   this.output=3.6;
                    break;
                case 'kwh': // kilowatt-hour
                   this.output=3600;
                    break;
                case 'mwh': // megawatt-hour
                    this.output=(1e3*3600);
                    break;
                default:
            }

            switch(config.maximumunit) {
                case "secs":
                    this.maximum *= 1;
                    break;
                case "mins":
                    this.maximum *= 60;
                    break;
                case "hours":
                    this.maximum *= 3600;
                    break;
                default:
            }
		// Overule if left blank or negative values selected
		if (this.maximum <= 0) {
		   this.maximum = 3600;
		   }

        node.on('input', function(msg) {

	var kwatts = (msg.payload / 1000);
	var hrtime = process.hrtime();
	var secsnow = ((hrtime[0]) + (hrtime[1] / 1e9));
	var lastms = node.lastms||secsnow;
	var interval = secsnow - lastms;

	// Check if input msg is a number, else warn & exit
	if (isNaN (kwatts)){
		this.error("The input msg is not a number");
		return;
		}
	node.lastms = secsnow;

        // Calculate kilojoules from energy - if interval is OK
        if ((interval < this.maximum)&&(interval !== 0)) {
            msg.payload = (interval*kwatts)/this.output;
            node.send(msg);
        } else {
		return;
               }
         });
    }
  RED.nodes.registerType("watt2kwh",Watt2kWhNode);
}
