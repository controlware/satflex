import Processo from "./Processo.js";

import {serialNumber, temporaryDirectory, valorParametro} from "../def/function.js";

export default class ProcessoAutomatico {

	constructor(Pool){
		this.Pool = Pool;
		this.interval = null;
		this.running = false;
	}

	async iniciar(){
		this.interval = setInterval(async () => { this.executar() }, 1000 * 60); // Cria o intervalo para executar a cada 1 minuto
		setTimeout(async () => { this.executar() }, 1000 * 10); // Executa uma primeira vez 10s depois de iniciar
	}

	pausar(){
		clearInterval(this.interval);
	}

	async executar(){
		if(this.running){
			return;
		}
		try {
			this.running = true;
			await this.executarBackup();
			await this.executarRefreshView();
		}catch(err){
			throw err;
		}finally{
			this.running = false;
		}
	}

	async executarBackup(){
		// Carrega e verifica o processo
		let processo = new Processo(this.Pool, "BACKUP");
		if(!await processo.verificarIntervalo()){
			return;
		}

		// Carrega os modulos
		if(this.fs === undefined) this.fs = window.require("fs");
		if(this.os === undefined) this.os = window.require("os");
		if(this.ftp === undefined) this.ftp = window.require("ftp");
		if(this.childProcess === undefined) this.childProcess = window.require("child_process");

		// Define a localizacao do pg_dump
		let pgDump = null;
		switch(this.os.platform()){
			case "darwin":
				pgDump = "/Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump";
				break;
			case "win32":
			default:
				pgDump = "C:/Program Files/PostgreSQL/9.6/bin/pg_dump.exe";
				break;
		}

		// Define o diretorio de trabalho
		let tempDir = temporaryDirectory();

		// Limpa os backups do diretorio temporario
		let files = this.fs.readdirSync(tempDir);
		for(let file of files){
			if(file.substr(-7) === ".backup"){
				this.fs.unlinkSync(tempDir + "/" + file);
			}
		}

		// Executa o backup via pg_dump
		let date = new Date();
		let currTimeStr = date.getFullYear() + "-" + String(date.getMonth() + 1).lpad(2, "0") + "-" + String(date.getDate()).lpad(2, "0") + "-" + String(date.getHours()).lpad(2, "0") + "-" + String(date.getMinutes()).lpad(2, "0") + "-" + String(date.getSeconds()).lpad(2, "0");
		let fileName = tempDir + "/" + currTimeStr + ".backup";
		let command = "\"" + pgDump + "\" -F c -b -U postgres -f \"" + fileName + "\" satflex";
		this.childProcess.execSync(command);

		// Caputura o numero de serie do terminal
		if(this.serialNumber === undefined){
			this.serialNumber = await serialNumber();
		}

		// Define o arquivo local e remoto
		let localFile = fileName;
		let remoteFile = "/" + this.serialNumber + "/" + currTimeStr + ".backup";

		// Copia o arquivo para o servidor de backup
		let client = new this.ftp();
		client.on("ready", () => {
			client.cwd("/", () => {
				client.mkdir(this.serialNumber, true, (err) => {
					if(err) throw err;
					client.put(localFile, remoteFile, false, (err) => {
						if(err) throw err;
						client.end();
						processo.atualizarProcesso();
					});
				});
			});
		}).connect({
			host: await valorParametro(this.Pool, "BACKUP", "HOST"),
			port: await valorParametro(this.Pool, "BACKUP", "PORTA"),
			user: await valorParametro(this.Pool, "BACKUP", "USUARIO"),
			password: await valorParametro(this.Pool, "BACKUP", "SENHA")
		});
	}

	async executarRefreshView(){
		// Carrega e verifica o processo
		let processo = new Processo(this.Pool, "REFRESH_VIEW");
		if(!await processo.verificarIntervalo()){
			return;
		}

		// Atualiza as views materializadas
		let views = ["v_vendaprodutodiario", "v_vendapagamentodiario"];
		for(let view of views){
			await this.Pool.query("REFRESH MATERIALIZED VIEW " + view);
		}

		// Atualiza o processo no banco de dados
		await processo.atualizarProcesso();
	}

}
