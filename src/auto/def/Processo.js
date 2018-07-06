class Processo {
	constructor(Pool, referencia){
		this.Pool = Pool;
		this.referencia = referencia;
		this.dthrinicial = this.currentTimestamp();
	}

	async atualizarProcesso(){
		await this.Pool.query("UPDATE processo SET dthrinicial, dthrfinal WHERE referencia = $1", [this.dthrinicial, this.currentTimestamp()]);
	}

	currentTimestamp(){
		let timezoneOffset = (new Date()).getTimezoneOffset() * 60000;
		let localISOTimestamp = (new Date(Date.now() - timezoneOffset)).toISOString();
		return localISOTimestamp;
	}

	async serialNumber(){
		let os = require("os");
		let childProcess = require("child_process");
		if(os.platform() === "win32"){
			let command = "wmic diskdrive get SerialNumber";
			return childProcess.execSync(command).toString().trim();
		}else{
			let command = "system_profiler SPHardwareDataType | awk '/Serial/ {print $4}'";
			return childProcess.execSync(command).toString().trim();

		}
	}

	temporaryDirectory(){
		let os = require("os");
		let dirname = os.homedir() + "/SAT-Flex/";
		return dirname;
	}

	async valorParametro(Pool, grupo, nome, callback){
		let {rows} = await Pool.query("SELECT valor FROM parametro WHERE grupo = $1 AND nome = $2", [grupo, nome]);
		let valor = rows[0].valor;
		if(typeof callback === "function"){
			callback(valor);
		}
		return valor;
	}

	async verificarIntervalo(){
		let res = await this.Pool.query("SELECT status, dthrinicial, intervalo FROM processo WHERE referencia = $1", [this.referencia]);
		let row = res.rows[0];

		if(row.status !== "A"){
			return false;
		}
		if(row.dthrinicial === null){
			return true;
		}
		if(Date.now() >= row.dthrinicial.getTime() + row.intervalo * 60000){
			return true;
		}else{
			return false;
		}
	}
}

module.exports = Processo;
