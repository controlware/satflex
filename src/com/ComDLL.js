export default class ComDLL {

	constructor(){
		this.appPath = window.require("electron").remote.app.getAppPath();
		this.childProcess = window.require("child_process");
		this.fs = window.require("fs");

		this.srcPath = this.appPath + "/src";
		this.comDLLPath = this.srcPath + "/lib/comdll-1.0.0";
	}

	execute(dllPath, method, args){
		let commandExec = this.comDLLPath + "/ComDLL.exe";
		let commandArgs = [
			this.srcPath + "/" + dllPath,
			method
		].concat(args);

		let returnFile = this.comDLLPath + "/retorno.txt";
		if(this.fs.existsSync(returnFile)){
			this.fs.unlinkSync(returnFile);
		}
		this.childProcess.execFileSync(commandExec, commandArgs);
		let result = this.fs.readFileSync(returnFile);

		return result.toString().trim();
	}

}
