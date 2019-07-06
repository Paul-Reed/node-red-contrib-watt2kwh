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
module.exports = function(RED) {
    function Watt2kWhNode(config) {
        RED.nodes.createNode(this,config);
	this.maximum = config.maximum;
        var node = this;
        node.on('input', function(msg) {

	var time = Math.round((new Date()).getTime());
	var watts = msg.payload;
	var context = this.context();
	var lastms = context.get('lastms')||0;
	var interval = time - lastms;

        if (this.maximum) {
            // Convert the 'maximum' value to milliseconds (based on the selected time unit)
            switch(config.maximumunit) {
                case "secs":
                    this.maximum *= 1000;
                    break;
                case "mins":
                    this.maximum *= 1000 * 60;
                    break;
                case "hours":
                    this.maximum *= 1000 * 60 * 60;
                    break;
                default: // "msecs" so no conversion needed
            }
        }

	this.error(this.maximum);

	// Check if input msg is a number, else warn & exit
	if (isNaN (watts)){
		this.error("The input msg is not a number");
		return;
		}

	context.set('lastms',time);
	msg.payload = interval;
	node.send(msg);

        });
    }
  RED.nodes.registerType("watt2kwh",Watt2kWhNode);
}
