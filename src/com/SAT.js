import ComDLL from "../com/ComDLL.js";
import {
	sleep, valorParametro, writeTemporary
} from "../def/function.js";

export default class SAT {

	constructor(Pool){
		this.Pool = Pool;
		this.jsontoxml = require("jsontoxml");
		this.ComDLL = new ComDLL();
		this.os = window.require("os");
		this.fs = window.require("fs");

		this.error = null;
	}

	// Cancela um documento ativo
	async cancelarDocumento(iddocumento){
		// Dados do SO
		let os = window.require("os");
		let platform = os.platform();
		let arch = os.arch();

		// Carrega os parametros
		let paramSATModelo = await valorParametro(this.Pool, "SAT", "MODELO");
		let paramSATAtivacao = await valorParametro(this.Pool, "SAT", "ATIVACAO");

		// Carrega o documento
		let {documento} = await this.carregarDadosDocumento(iddocumento);

		// Cria o XML do documento fiscal a ser enviado para o SAT
		let xmlEntrada = documento.xml;
		writeTemporary("cancelamento.xml", xmlEntrada);

		// Define a DLL a ser utilizada
		let dllPath = ["lib/sat", paramSATModelo, platform, arch].join("/");

		// Carrega a biblioteca correta do fabricante
		switch(paramSATModelo){
			case "controlid":
				dllPath += "/SAT.dll";
				break;
			case "sweda":
				dllPath += "/SATDLL.dll";
				break;
			default:
				return true;
		}

		let retorno = null;
		let arrRetorno = null;
		while(retorno === null || arrRetorno[1] === "06098"){
			if(retorno !== null){
				await sleep(500);
			}
			retorno = this.ComDLL.execute(dllPath, "CancelarUltimaVenda", [paramSATAtivacao, btoa(xmlEntrada)]);
			if(retorno === false){
				return false;
			}
			arrRetorno = retorno.split("|");
		}

		if(!this.validarRetorno(retorno)){
			return false;
		}

		let xmlSaida = atob(arrRetorno[6]);
		let chave = arrRetorno[8].trim();

		if(xmlSaida.length === 0 && paramSATModelo === "sweda"){
			arrRetorno = this.fs.readFileSync("C:/Sweda/Retorno.txt").toString();
			xmlSaida = atob(arrRetorno[6]);
		}

		return {
			xmlcanc: xmlSaida,
			chavecanc: chave
		};
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
		let paramSATAmbiente = await valorParametro(this.Pool, "SAT", "AMBIENTE");
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
				"numeroCaixa": paramSATCaixa.lpad(3, "0")
				//"tpAmb": paramSATAmbiente
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
			let prod = [
				{name: "cProd", text: documentoproduto.idproduto},
				{name: "xProd", text: documentoproduto.descricao},
				{name: "NCM", text: documentoproduto.codigoncm.removeFormat()},
				{name: "CFOP", text: documentoproduto.cfop.removeFormat()},
				{name: "uCom", text: (documentoproduto.balanca === "S" ? "KG" : "UN")},
				{name: "qCom", text: documentoproduto.quantidade.format(4, ".", "")},
				{name: "vUnCom", text: documentoproduto.preco},
				{name: "indRegra", text: "T"},
				{name: "vDesc", text: documentoproduto.totaldesconto},
				{name: "vOutro", text: documentoproduto.totalacrescimo}
			];
			if(documentoproduto.cest !== null && documentoproduto.cest.length > 0){
				prod.push({
					name: "obsFiscoDet",
					attrs: {"xCampoDet": "Cod. CEST"},
					children: {
						"xTextoDet": documentoproduto.cest.removeFormat()
					}
				});
			}

			let ICMS = {};
			if(["102", "300", "400", "500"].indexOf(documentoproduto.csosn) > -1){
				ICMS = {"ICMSSN102": {"Orig": documentoproduto.origem, "CSOSN": documentoproduto.csosn}};
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
					"prod": prod,
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
		}];

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
		let xmlEntrada = await this.gerarXMLDocumento(iddocumento);
		writeTemporary("venda.xml", xmlEntrada);

		// Define a DLL a ser utilizada
		let dllPath = ["lib/sat", paramSATModelo, platform, arch].join("/");

		// Carrega a biblioteca correta do fabricante
		switch(paramSATModelo){
			case "controlid":
				dllPath += "/SAT.dll";
				break;
			case "sweda":
				dllPath += "/SATDLL.dll";
				break;
			default:
				return true;
		}

		let retorno = null;
		let arrRetorno = null;
		while(retorno === null || arrRetorno[1] === "06098"){
			if(retorno !== null){
				await sleep(500);
			}
			retorno = this.ComDLL.execute(dllPath, "EnviarDadosVenda", [paramSATAtivacao, btoa(xmlEntrada)]);
			if(retorno === false){
				return false;
			}
			arrRetorno = retorno.split("|");
		}

		if(!this.validarRetorno(retorno)){
			return false;
		}

		let xmlSaida = atob(arrRetorno[6]);
		let chave = arrRetorno[8].trim();
		let numero = chave.substr(-13, 6);

		if(xmlSaida.length === 0 && paramSATModelo === "sweda"){
			arrRetorno = this.fs.readFileSync("C:/Sweda/Retorno.txt").toString();
			xmlSaida = atob(arrRetorno[6]);
		}

		return {
			xml: xmlSaida,
			chave: chave,
			numero: numero
		};
	}

	validarRetorno(retorno){
		let arrRetorno = retorno.split("|");

		this.error = null;
		let sucesso = false;

		switch(arrRetorno[1]){
			/*
			 * Metodo: AtivarSAT
			 */
			case "04000":
				sucesso = true;
				break;
			case "04001":
				this.error = "Erro na criação do certificado. Processo de ativação foi interrompido.";
				break;
			case "04002":
				this.error = "SEFAZ não reconhece este SAT (CNPJ inválido). Verificar junto a SEFAZ o CNPJ cadastrado.";
				break;
			case "04003":
				this.error = "SAT já ativado.";
				break;
			case "04004":
				this.error = "SAT bloqueado por cessação de uso.";
				break;
			case "04005":
				this.error = "Erro de comunicação com a SEFAZ. Tente novamente.";
				break;
			case "04006": // CSR ICP-BRASIL criado com sucesso
				sucesso = true;
				break;
			case "04007":
				this.error = "Processo de criação do CSR para certificação ICP-BRASIL falhou.";
				break;
			case "04098":
				this.error = "SAT em processamento. Tente novamente.";
				break;
			case "04099":
				this.error = "Erro desconhecido na ativação.";
				break;
			/*
			 * Metodo: EnviarDadosVenda
			 */
			case "06000":
				sucesso = true;
				break;
			case "06001":
				this.error = "Código de ativação inválido.";
				break;
			case "06002":
				this.error = "SAT ainda não ativado.";
				break;
			case "06003":
				this.error = "SAT não vinculado ao AC.";
				break;
			case "06004":
				this.error = "Vinculação do AC não confere.";
				break;
			case "06005":
				this.error = "Tamanho do CF-e-SAT superior a 1,5MB. Dividir CF-e-SAT em dois ou mais documentos.";
				break;
			case "06006":
				this.error = "SAT bloqueado pelo contribuinte. Não é possível realizar venda.";
				break;
			case "06007":
				this.error = "SAT bloqueado pela SEFAZ. Não é possível realizar venda.";
				break;
			case "06008":
				this.error = "SAT bloqueado por falta de comunicação. Não é possível realizar venda até ser restabelecida a comunicação com a SEFAZ.";
				break;
			case "06009":
				this.error = "SAT bloqueado, código de ativação incorreto.";
				break;
			case "06010":
				this.error = "Erro de validação do conteúdo.";
				break;
			case "06098":
				this.error = "SAT em processamento. Tente novamente.";
				break;
			case "06099":
				this.error = "Erro desconhecido na emissão.";
				break;
			/*
			 * Metodo: CancelarUltimaVenda
			 */
			case "07000":
				sucesso = true;
				break;
			case "07001":
				this.error = "Código de ativação inválido.";
				break;
			case "07002":
				this.error = "Cupom inválido.";
				break;
			case "07003":
				this.error = "SAT bloqueado pelo contribuinte.";
				break;
			case "07004":
				this.error = "SAT bloqueado pela SEFAZ.";
				break;
			case "07005":
				this.error = "SAT bloqueado por falta de comunicação.";
				break;
			case "07006":
				this.error = "SAT bloqueado, código de ativação incorreto.";
				break;
			case "07007":
				this.error = "Erro de validação do conteúdo.";
				break;
			case "07098":
				this.error = "SAT em processamento. Tente novamente.";
				break;
			case "07099":
				this.error = "Erro desconhecido no cancelamento.";
				break;
			/*
			 * Metodo: ConsultarSAT
			 */
			case "08000":
				sucesso = true;
				break;
			case "08098":
				this.error = "SAT em processamento. Tente novamente.";
				break;
			case "08099":
				this.error = "Erro desconhecido.";
				break;
			/*
			 * Metodo: TesteFimAFim
			 */
			case "09000":
				sucesso = true;
				break;
			case "09001":
				this.error = "Código de ativação inválido.";
				break;
			case "09002":
				this.error = "SAT ainda não ativado.";
				break;
			case "09098":
				this.error = "SAT em processamento. Tente novamente.";
				break;
			case "09099":
				this.error = "Erro desconhecido.";
				break;
			/*
			 * Metodo: ConsultarStatusOperacional
			 */
			case "10000":
				sucesso = true;
				break;
			case "10001":
				this.error = "Código de ativação inválido.";
				break;
			case "10098":
				this.error = "SAT em processamento. Tente novamente.";
				break;
			case "10099":
				this.error = "Erro desconhecido.";
				break;
			default:
				this.error = "Erro desconhecido.";
				break;
		}

		if((this.error === null || this.error.length === 0) && arrRetorno[3].length > 0){
			this.error = arrRetorno[3];
		}

		this.error += " (Código " + arrRetorno[1] + ")";

		return sucesso;
	}

}
