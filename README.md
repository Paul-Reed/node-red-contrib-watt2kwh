## node-red-contrib-watt2kwh
A node specifically written to convert power (watts) to energy (kWh).
### Inputs
The node accepts a msg.payload input in the format of a number (example 6) or a string (example "6") provided that the string only contains numbers.
### Outputs
The msg.payload contains the energy output, which can be set in the node config to be;
* Joules
* Watt hour
* Kilowatt hour or
* Megawatt hour
### Details
As the calculation is dependent upon the relationship between the amount of power used, (or generated) **and** the interval between consecutive data points; **interval x power = energy** the very first value fed into the node will not produce an output, because the node requires a second value to be able to calculate the interval between the two values.  
After subsequent feed inputs, the node will output the corresponding energy used or generated within that interval.  

The Timeout setting in the node's configuration, should be set to at least the maximum interval between successive readings. This is to avoid the situation where for example, a sensor is taken off line, develops a fault or there is a communication problem, resulting in a break of several hours between readings and the calculation - **interval x power = energy** would then be inaccurate.  

A common usage is to create a barchart, to show daily energy usage or generation. Using the watt/hour setting, the msg.payload can be fed into the database, for example influx, and then queried within Grafana to produce the barchart; `SELECT sum("energyfeed") FROM "yourdatabase" WHERE $timeFilter GROUP BY time(1d)`
``` 
[{"id":"d62baedc.ded46","type":"debug","z":"31e18edc.98bdc2","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":740,"y":440,"wires":[]},{"id":"74280b50.f704a4","type":"inject","z":"31e18edc.98bdc2","name":"1 kW feed","topic":"","payload":"1000","payloadType":"str","repeat":"60","crontab":"","once":false,"onceDelay":0.1,"x":420,"y":440,"wires":[["5eb66b22.1a4de4"]]},{"id":"5eb66b22.1a4de4","type":"watt2kwh","z":"31e18edc.98bdc2","format":"kwh","maximum":"5","maximumunit":"mins","name":"","x":580,"y":440,"wires":[["d62baedc.ded46"]]}] 
```
The other common usage is to use the data within node-RED, for use in the dashboard or sending it to other devices. In these cases, you may wish to accumulate the node output, for example to calculate how many kWh's are consumed (or generated that day. The flow below, adds each subsequent value, and saves it back to flow context. An inject node then deletes the context value at each midnight.
``` 
[{"id":"74280b50.f704a4","type":"inject","z":"31e18edc.98bdc2","name":"1 kW feed","topic":"","payload":"1000","payloadType":"str","repeat":"","crontab":"*/1 0-23 * * *","once":false,"onceDelay":0.1,"x":420,"y":470,"wires":[["5eb66b22.1a4de4"]]},{"id":"5eb66b22.1a4de4","type":"watt2kwh","z":"31e18edc.98bdc2","format":"kwh","maximum":"5","maximumunit":"mins","name":"","x":586,"y":470,"wires":[["92e84adc.45c5e8"]]},{"id":"92e84adc.45c5e8","type":"function","z":"31e18edc.98bdc2","name":"Store kwh","func":"var inputVal = msg.payload;\nif (inputVal == \"reset\"){\n flow.set(\"energyVal\",0); \n } else {\nvar savedVal = flow.get('energyVal')||0;\nsavedVal += inputVal;\nflow.set(\"energyVal\",savedVal);\nmsg.payload = savedVal;\nreturn msg;\n}","outputs":1,"noerr":0,"x":740,"y":510,"wires":[["486cc458.d7051c"]]},{"id":"486cc458.d7051c","type":"debug","z":"31e18edc.98bdc2","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":900,"y":510,"wires":[]},{"id":"6a75c8e5.1ee598","type":"inject","z":"31e18edc.98bdc2","name":"reset","topic":"","payload":"reset","payloadType":"str","repeat":"","crontab":"00 00 * * *","once":false,"onceDelay":0.1,"x":600,"y":510,"wires":[["92e84adc.45c5e8"]]}]
```
