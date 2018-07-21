import {applicationDirectory, defaultMessageBoxError, temporaryDirectory, valorParametro} from "../def/function.js";

export default class Atualizacao {

	constructor(Pool){
		this.Pool = Pool;

		this.atualizarAplicativoParcial = this.atualizarAplicativoParcial.bind(this);
		this.atualizarBancoDeDados = this.atualizarBancoDeDados.bind(this);
		this.baixarAplicativoParcial = this.baixarAplicativoParcial.bind(this);
		this.versaoLocal = this.versaoLocal.bind(this);
		this.versaoServidor = this.versaoServidor.bind(this);
		this.verificarAtualizacao = this.verificarAtualizacao.bind(this);

		// Dados de acesso ao FTP
		this.dados = {
			host: "websac.net",
			user: "satflex-update",
			password: "automacao",
			port: 21
		};

		this.fs = window.require("fs");
	}

	atualizarAplicativoParcial(){
		if(this.path === undefined){
			this.path = window.require("path");
		}

		window.Loading.show();
		this.baixarAplicativoParcial((zipFile) => {
			let destPath = this.path.dirname(applicationDirectory());
			this.descompactarArquivo(zipFile, destPath, () => {
				this.atualizarBancoDeDados(() => {
					window.Loading.hide();
					window.MessageBox.show({
						title: "Atualizado com sucesso!",
						text: "O seu SAT-Flex foi atualizado com sucesso!<br>A aplicação será reinciada.",
						buttons: [{
							text: "Ok",
							icon: "thumbs-up",
							onClick: () => {
								if(this.electron === undefined){
									this.electron = window.require("electron");
								}
								let app = this.electron.remote.app;
								app.relaunch();
								app.exit();
							}
						}]
					});
				}, (err) => {
					window.Loading.hide();
					defaultMessageBoxError(err);
				});
			}, (err) => {
				window.Loading.hide();
				defaultMessageBoxError(err);
			}, 100000000); // 100MB
		}, (err) => {
			window.Loading.hide();
			defaultMessageBoxError(err);
		});
	}

	async atualizarBancoDeDados(success, fail){
		if(this.ftp === undefined){
			this.ftp = window.require("ftp");
		}

		// Funcao usada para ler um arquivo no FTP sem necessitar de callback
		let ftpReadSync = async (client, filename) => {
			return new Promise((resolve) => {
				client.get(filename, false, (err, stream) => {
					if(err) throw new Error(err);

					let chunks = [];
					stream.on("data", (chunk) => {
						chunks.push(chunk.toString());
					}).on("end", () => {
						resolve(chunks.join(" "));
					});
				});
			});
		};

		// Verifica ultima instrucao executada
		let paramAtualizacaoInstrucaoSQL = parseInt(await valorParametro(this.Pool, "ATUALIZACAO", "INSTRUCAOSQL"), 10);

		// Conecta no servidor FTP
		let client = new this.ftp();
		client.on("ready", () => {
			client.list("/sql", false, async (err, list) => {
				if(err) return fail(err);

				// Verifica quais instrucoes devem ser executadas
				let arrArquivoSQL = [];
				for(let file of list){
					let numeroInstrucaoSQL = parseInt(file.name.replace(".sql", ""), 10);
					if(numeroInstrucaoSQL > paramAtualizacaoInstrucaoSQL){
						arrArquivoSQL.push(file.name);
					}
				}
				arrArquivoSQL.sort();

				// Abre os arquivos e atualiza o banco de dados
				try{
					for(let i in arrArquivoSQL){
						let percent = (1 - (arrArquivoSQL.length - i) / arrArquivoSQL.length) * 100;
						window.Loading.progress(66.66 + percent / 3);

						let arquivoSQL = arrArquivoSQL[i];
						let instrucaoSQL = await ftpReadSync(client, "/sql/" + arquivoSQL);
						await this.Pool.query(instrucaoSQL);
					}
					success();
				}catch(err){
					fail(err);
				}
			});
		}).connect(this.dados);
	}

	async baixarAplicativoParcial(success, fail){
		let ftpAppPath = "/" + await this.versaoServidor() + "/app.zip";
		this.downloadFTP(ftpAppPath, (fileName) => {
			success(fileName);
		}, (err) => {
			fail(err);
		});
	}

	compararVersao(v1, v2){
	    let lexicographical = false;
		let zeroExtend = false;
		let v1parts = v1.split(".");
		let v2parts = v2.split(".");

	    let isValidPart = (x) => {
	        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
	    };

	    if(!v1parts.every(isValidPart) || !v2parts.every(isValidPart)){
	        return NaN;
	    }
	    if(zeroExtend){
	        while(v1parts.length < v2parts.length) v1parts.push("0");
	        while(v2parts.length < v1parts.length) v2parts.push("0");
	    }
	    if(!lexicographical){
	        v1parts = v1parts.map(Number);
	        v2parts = v2parts.map(Number);
	    }
	    for(let i = 0; i < v1parts.length; ++i){
	        if(v2parts.length === i){
				return 1;
	        }
	        if(v1parts[i] === v2parts[i]){
				continue;
	        }else if(v1parts[i] > v2parts[i]){
				return 1;
	        }else{
				return -1;
	        }
	    }
	    if(v1parts.length !== v2parts.length){
	        return -1;
	    }
	    return 0;
	}

	async descompactarArquivo(zipFile, destPath, success, fail, estimatedSize){
		if(this.progress === undefined){
			this.progress = window.require("progress-stream");
		}
		if(this.unzip === undefined){
			this.unzip = window.require("node-unzip-2");
		}

		let str = this.progress({
		    time: 1000
		});

		str.on("progress", (progress) => {
			let percent = (1 - (estimatedSize - progress.transferred) / estimatedSize) * 100;
			window.Loading.progress(33.33 + percent / 3);
		});

		let stream = this.fs.createReadStream(zipFile);
		stream.pipe(str).pipe(this.unzip.Extract({
			path: destPath
		})).on("close", () => {
			success(destPath);
		}).on("error", (err) => {
			fail(err);
		});
	}

	versaoLocal(){
		let filename = applicationDirectory() + "/package.json";
		let json = JSON.parse(this.fs.readFileSync(filename).toString());
		return json.version;
	}

	async versaoServidor(){
		if(this.__versaoServidor !== undefined){
			return this.__versaoServidor;
		}

		return new Promise((resolve) => {
			this.downloadFTP("/version", (fileName) => {
				let version = this.fs.readFileSync(fileName).toString();
				this.__versaoServidor = version;
				resolve(version);
			}, (err) => {
				resolve(err);
				//throw err;
			});
		});
	}

	async verificarAtualizacao(){
		window.Loading.show();
		let versaoLocal = this.versaoLocal();
		let versaoServidor = await this.versaoServidor();
		window.Loading.hide();

		if(typeof versaoServidor === "object"){ // Erro
			let error = versaoServidor.message;
			if(error.indexOf("ENOTFOUND") > -1){
				let paramRevendaTelefone = await valorParametro(this.Pool, "REVENDA", "TELEFONE");
				error = "Não foi possível estabelecer uma conexão com o servidor FTP de atualizações.<br>Verifique a conexão com a Internet e as configurações do Firewall e tente novamente.<br><br>Caso o problema persista, entre contato com o suporte no número <b>" + paramRevendaTelefone + "</b>.";
			}
			defaultMessageBoxError(error);
			return false;
		}

		let compararVersao = this.compararVersao(versaoLocal, versaoServidor);

		if(compararVersao === -1){
			window.MessageBox.show({
				title: "Atualização do SAT-Flex",
				text: "Existe uma versão mais recente do SAT-Flex disponível.<br>Deseja iniciar a atualização agora?",
				buttons: [
					{
						text: "Sim",
						icon: "thumbs-up",
						color: "green",
						onClick: () => {
							window.MessageBox.hide();
							this.atualizarAplicativoParcial();
						}
					},
					{
						text: "Não",
						icon: "thumbs-down",
						color: "red",
						onClick: () => {
							window.MessageBox.hide();
						}
					}
				]
			});
		}else{
			window.MessageBox.show({
				title: "Atualização do SAT-Flex",
				text: "Sua versão é a mais recente.<br>Não existe nenhuma atualização disponível."
			});
		}
	}

	async downloadFTP(origPath, success, fail){
		if(this.ftp === undefined){
			this.ftp = window.require("ftp");
		}
		if(this.progress === undefined){
			this.progress = window.require("progress-stream");
		}

		let destPath = await temporaryDirectory() + "/" + origPath.split("/").reverse()[0];

		let str = this.progress({
		    time: 1000
		});

		let fileSize = 0;
		str.on("progress", (progress) => {
			let percent = (1 - (fileSize - progress.transferred) / fileSize) * 100;
			window.Loading.progress(percent / 3);
		});

		let client = new this.ftp();
		client.on("ready", () => {
			client.list(origPath, false, (err, list) => {
				if(err) return fail(err);
				fileSize = list[0].size;
				client.get(origPath, false, (err, stream) => {
					if(err) return fail(err);
					stream.on("error", (err) => {
						client.end();
						fail(err);
					}).on("close", () => {
						client.end();
						success(destPath);
					});
					stream.pipe(str).pipe(this.fs.createWriteStream(destPath));
				});
			});
		}).on("error", (err) => {
			fail(err);
		}).connect(this.dados);
	}

}
