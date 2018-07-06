(async () => {
	let DataBase = require("../def/DataBase.js");
	let Processo = require("../def/Processo.js");

	// Verifica se deve executar o processo
	let Pool = DataBase.Pool();
	let processo = new Processo(Pool, "BACKUP");
	if(!await processo.verificarIntervalo()){
		process.exit();
	}

	// Carrega outros modulos
	let fs = require("fs");
	let os = require("os");
	let childProcess = require("child_process");

	// Define a localizacao do pg_dump
	let pgDump = null;
	switch(os.platform()){
		case "darwin":
			pgDump = "/Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump";
			break;
		case "win32":
			pgDump = "C:/Program Files/PostgreSQL/9.6/bin/pg_dump.exe";
			break;
	}

	// Define o diretorio de trabalho
	let tempDir = processo.temporaryDirectory();

	// Limpa os backups do diretorio temporario
	let files = fs.readdirSync(tempDir);
	for(let file of files){
		if(file.substr(-7) === ".backup"){
			fs.unlinkSync(tempDir + "/" + file);
		}
	}

	// Executa o backup via pg_dump
	let date = new Date();
	let currTimeStr = date.getFullYear() + "-" + String(date.getMonth() + 1).lpad(2, "0") + "-" + String(date.getDate()).lpad(2, "0") + "-" + String(date.getHours()).lpad(2, "0") + "-" + String(date.getMinutes()).lpad(2, "0") + "-" + String(date.getSeconds()).lpad(2, "0");
	let fileName = tempDir + "/" + currTimeStr + ".backup";
	let command = pgDump + " -F c -b -U postgres -f \"" + fileName + "\" satflex";
	childProcess.execSync(command);

	// Caputura o numero de serie do terminal
	serialNumber = await processo.serialNumber();

	// Define o arquivo local e remoto
	let localFile = fileName;
	let remoteFile = "/" + serialNumber + "/" + currTimeStr + ".backup";

	// Copia o arquivo para o servidor de backup
	/*
	let FTP = require("ftpimp");
	let ftp = FTP.create({
		host: '191.237.253.62',
		port: '21',
		user: 'satflex',
		pass: 'automacao'
	}, false);
	ftp.connect((err) => {
		if(err) throw err;
		console.log("connected");
		ftp.put([localFile, remoteFile], (err) => {
			if(err) throw err;
		});
	});
	*/
	let Client = require("ftp");
	let ftp = new Client();
	ftp.on("ready", () => {
		ftp.cwd("/", () => {
			ftp.mkdir(serialNumber, true, (err) => {
				if(err) throw err;
				console.log(fileName + " => " + remoteFile);
				ftp.put(fileName, remoteFile, false, (err) => {
					if(err) throw err;
					ftp.end();
					console.log("Sucesso ("+serialNumber+")");
					process.exit();
				});
			});
		});
	}).connect({
		host: await processo.valorParametro(Pool, "BACKUP", "HOST"),
		port: await processo.valorParametro(Pool, "BACKUP", "PORTA"),
		user: await processo.valorParametro(Pool, "BACKUP", "USUARIO"),
		password: await processo.valorParametro(Pool, "BACKUP", "SENHA"),
		pasvTimeout: 0
	});
})();


/*
{ host: '191.232.244.189',
  port: '21',
  user: 'satflex',
  password: 'automacao' }
 */
