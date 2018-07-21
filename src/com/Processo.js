import {currentTimestamp} from "../def/function.js";

export default class Processo {
	constructor(Pool, referencia){
		this.Pool = Pool;
		this.referencia = referencia;
		this.dthrinicial = currentTimestamp();
	}

	async atualizarProcesso(){
		let sql = "UPDATE processo SET dthrinicial = $2, dthrfinal = $3 WHERE referencia = $1";
		let values = [this.referencia, this.dthrinicial, currentTimestamp()];
		await this.Pool.query(sql, values);
	}

	async verificarIntervalo(){
		this.dthrinicial = currentTimestamp();

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
