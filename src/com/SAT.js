import {
	sleep, valorParametro, writeTemporary
} from "../def/function.js";

export default class SAT {

	constructor(Pool){
		this.Pool = Pool;
		this.jsontoxml = require("jsontoxml");
	}

	async carregarDadosDocumento(iddocumento){
		let documento, documentoprodutos,documentopagamentos;

		let objectName = this.Pool.constructor.name;

		let client = null;
		if(objectName === "Pool"){
			client = await this.Pool.connect();
		}else{
			client = this.Pool;
		}

		try{
			let res = await client.query("SELECT * FROM documento WHERE iddocumento = $1", [iddocumento]);
			if(res.rows.length === 0){
				throw new Error("Nenhum documento foi encontrado.");
			}
			documento = res.rows[0];

			let queryDocumentoProduto = [
				"SELECT documentoproduto.*, produto.balanca",
				"FROM documentoproduto",
				"LEFT JOIN produto USING (idproduto)",
				"WHERE documentoproduto.iddocumento = $1",
				"ORDER BY documentoproduto.sequencial"
			].join(" ");
			res = await client.query(queryDocumentoProduto, [iddocumento]);
			documentoprodutos = res.rows;

			let queryDocumentoPagamento = [
				"SELECT documentopagamento.*, formapagamento.especie",
				"FROM documentopagamento",
				"LEFT JOIN formapagamento USING (idformapagamento)",
				"WHERE documentopagamento.iddocumento = $1"
			].join(" ");
			res = await client.query(queryDocumentoPagamento, [iddocumento]);
			documentopagamentos = res.rows;
		}catch(e){
			throw e;
		}finally{
			if(objectName === "Pool"){
				client.release();
			}
		}

		return {
			documento: documento,
			documentoprodutos: documentoprodutos,
			documentopagamentos: documentopagamentos
		};
	}

	async gerarXMLDocumento(iddocumento, success, fail){
		let {documento, documentoprodutos, documentopagamentos} = await this.carregarDadosDocumento(iddocumento);

		let paramDesenvolvedoraCNPJ = await valorParametro(this.Pool, "DESENVOLVEDORA", "CNPJ");
		let paramDesenvolvedoraAssinatura = await valorParametro(this.Pool, "DESENVOLVEDORA", "ASSINATURA");
		let paramSATCaixa = await valorParametro(this.Pool, "SAT", "CAIXA");
		let paramEmitenteCNPJ = await valorParametro(this.Pool, "EMITENTE", "CNPJ");
		let paramEmitenteIE = await valorParametro(this.Pool, "EMITENTE", "IE");
		let paramEmitenteImpostoFederal = await valorParametro(this.Pool, "EMITENTE", "IMPOSTOFEDERAL");
		let paramEmitenteImpostoEstadual = await valorParametro(this.Pool, "EMITENTE", "IMPOSTOESTADUAL");

		let ide = {
			name: "ide",
			children: {
				"CNPJ": paramDesenvolvedoraCNPJ.removeFormat(),
				"signAC": paramDesenvolvedoraAssinatura,
				"numeroCaixa": paramSATCaixa.lpad("0", 3),
			}
		};

		let emit = {
			name: "emit",
			children: {
				"CNPJ": paramEmitenteCNPJ.removeFormat(),
				"IE": paramEmitenteIE.removeFormat(),
				"cRegTribISSQN": 1,
				"indRatISSQN": "N"
			}
		};

		let destChildren = {};
		let destCPFCNPJ = (documento.cpfcnpj ? documento.cpfcnpj.removeFormat() : "");
		if(destCPFCNPJ.length > 11){
			destChildren = {"CNPJ": destCPFCNPJ};
		}else if(destCPFCNPJ.length > 9){
			destChildren = {"CPF": destCPFCNPJ};
		}
		let dest = {
			name: "dest",
			children: destChildren
		};

		let dets = documentoprodutos.map((documentoproduto) => {
			let ICMS = {};
			if(["102", "300", "400", "500"].indexOf(documentoproduto.csosn) > -1){
				ICMS = {"Orig": documentoproduto.origem, "CSOSN": documentoproduto.csosn};
			}

			let PIS = {};
			if(["01", "02"].indexOf(documentoproduto.cstpis) > -1){
				PIS = {"PISAliq": {"CST": documentoproduto.cstpis, "vBC": documentoproduto.basepis, "pPIS": documentoproduto.aliqpis.format(4, ".", "")}};
			}else if(["03"].indexOf(documentoproduto.cstpis) > -1){
				PIS = {"PISQtde": {"CST": documentoproduto.cstpis, "qBCProd": documentoproduto.quantidade, "vAliqProd": documentoproduto.aliqpis.format(4, ".", "")}};
			}else if(["04", "06", "07", "08", "09"].indexOf(documentoproduto.cstpis) > -1){
				PIS = {"PISNT": {"CST": documentoproduto.cstpis}};
			}else if(["49"].indexOf(documentoproduto.cstpis) > -1){
				PIS = {"PISSN": {"CST": documentoproduto.cstpis}};
			}else if(["99"].indexOf(documentoproduto.cstpis) > -1){
				PIS = {"PISOutr": {"CST": documentoproduto.cstpis, "vBC": documentoproduto.basepis, "pPIS": documentoproduto.aliqpis.format(4, ".", "")}};
			}

			let COFINS = {};
			if(["01", "02"].indexOf(documentoproduto.cstcofins) > -1){
				COFINS = {"COFINSAliq": {"CST": documentoproduto.cstcofins, "vBC": documentoproduto.basecofins, "pCOFINS": documentoproduto.aliqcofins.format(4, ".", "")}};
			}else if(["03"].indexOf(documentoproduto.cstcofins) > -1){
				COFINS = {"COFINSQtde": {"CST": documentoproduto.cstcofins, "qBCProd": documentoproduto.quantidade, "vAliqProd": documentoproduto.aliqcofins.format(4, ".", "")}};
			}else if(["04", "06", "07", "08", "09"].indexOf(documentoproduto.cstcofins) > -1){
				COFINS = {"COFINSNT": {"CST": documentoproduto.cstcofins}};
			}else if(["49"].indexOf(documentoproduto.cstcofins) > -1){
				COFINS = {"COFINSSN": {"CST": documentoproduto.cstcofins}};
			}else if(["99"].indexOf(documentoproduto.cstcofins) > -1){
				COFINS = {"COFINSOutr": {"CST": documentoproduto.cstcofins, "vBC": documentoproduto.basecofins, "pCOFINS": documentoproduto.aliqcofins.format(4, ".", "")}};
			}

			let det = {
				name: "det",
				attrs: {"nItem": documentoproduto.sequencial},
				children: {
					"prod": {
						"cProd": documentoproduto.idproduto,
						"xProd": documentoproduto.descricao,
						"NCM": documentoproduto.codigoncm.removeFormat(),
						"CFOP": documentoproduto.cfop.removeFormat(),
						"uCom": (documentoproduto.balanca === "S" ? "KG" : "UN"),
						"qCom": documentoproduto.quantidade.format(4, ".", ""),
						"vUncom": documentoproduto.preco,
						"indRegra": "T",
						"vDesc": documentoproduto.totaldesconto,
						"vOutro": documentoproduto.totalacrescimo
					},
					"imposto": {
						"ICMS": ICMS,
						"PIS": PIS,
						"COFINS": COFINS
					}
				}
			};

			return det;
		});

		let total = {
			name: "total"
		};

		let pgtoChildren = documentopagamentos.map((documentopagamento) => {
			return {
				name: "MP",
				children: {
					"cMP": documentopagamento.especie,
					"vMP": documentopagamento.totalpagamento
				}
			}
		});
		let pgto = {
			name: "pgto",
			children: pgtoChildren
		};

		let impostoFederal = (documento.totaldocumento * paramEmitenteImpostoFederal.toFloat() / 2).format(2, "," , ".");
		let impostoEstadual = (documento.totaldocumento * paramEmitenteImpostoEstadual.toFloat() / 2).format(2, "," , ".");
		let impostoAproximado = "Valor aprox. imposto: R$ " + impostoFederal + " Fed / R$ " + impostoEstadual + " Est / Fonte SEBRAE";

		let infAdic = {
			name: "infAdic",
			children: {
				"infCpl": impostoAproximado
			}
		}

		let infCFeChildren = [ide, emit, dest].concat(dets).concat([total, pgto, infAdic]);

		let infCFe = [{
			name: "infCFe",
			attrs: {"versaoDadosEnt": "0.07"},
			children: infCFeChildren
		}]

		let xml = [{
			name: "CFe",
			children: [infCFe]
		}];

		let finalXML = this.jsontoxml(xml);

		if(typeof success === "function"){
			success(finalXML);
		}

		return finalXML;
	}

	novoNumSessao(){
		return String(Math.round(Math.random() * Math.pow(10, 6))).lpad(6, "0");
	}

	// Transmite o documento fiscal
	async transmitirDocumento(iddocumento){
		// Dados do SO
		let os = window.require("os");
		let platform = os.platform();
		let arch = os.arch();

		// Carrega os parametros
		let paramSATModelo = await valorParametro(this.Pool, "SAT", "MODELO");
		let paramSATAtivacao = await valorParametro(this.Pool, "SAT", "ATIVACAO");

		// Cria o XML do documento fiscal a ser enviado para o SAT
		let xml = await this.gerarXMLDocumento(iddocumento);
		writeTemporary("venda.xml", xml);

		// Carrega a biblioteca correta do fabricante
		console.log("1");
		let ffi = window.require("ffi");
		console.log("2");
		switch(paramSATModelo){
			case "sweda":
				let libname = (platform === "window" ? "SATDLL.dll" : "libSATDLL.so");
				let filename = "../lib/sat/sweda/" + platform + "/" + arch + "/" + filename;
				console.log(filename);
				let libSAT = ffi.Library(filename, {
					"ConsultarSAT": ["string", ["int"]]
				});
				console.log('ConsultarSAT:\n' + libSAT.ConsultarSAT(this.novoNumSessao()) + '\n');
				break;
			default:
				return true;
		}
		/*
		let libSAT = null;

		// Tratamento para o erro "SAT em processamento"
		let retorno = null;
		let retornoValores = [];
		while(retorno === null || retornoValores[1] === "06098"){
			if(retorno !== null){
				await sleep(500);
			}

			// Envia os dados de venda
			retorno = libSAT.enviarDadosVenda(this.novoNumSessao(), paramSATAtivacao, xml);
			retornoValores = retorno.split("|");
		}
		*/
	}

}
