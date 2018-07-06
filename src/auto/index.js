let fs = require("fs");

require("../def/prototype.js");

let files = fs.readdirSync("./exec");
for(let file of files){
	if(file.substr("-3") === ".js"){
		require("./exec/" + file);
	}
}
