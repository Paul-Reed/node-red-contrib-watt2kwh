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
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// Many thanks to @bartbutenaers for the learning experience & support!!

module.exports = function(RED) {
    function Watt2kWhNode(config) {
        RED.nodes.createNode(this,config);
	this.maximum = config.maximum;
        var node = this;

	//Read the selected output format
	const formats = {"j":1e-3, "kj": 1, "wh": 3.6, "kwh": 3600, "mwh": (1e3*3600)};
	this.output = formats[config.format] || 0;

	//Read the selected timeout value
	const units = {"secs": 1, "mins": 60, "hours": 3600};
	this.maximum *= units[config.maximumunit] || 0;
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
