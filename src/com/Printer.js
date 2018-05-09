//import RNFS from "react-native-fs";

import EscPos from "./EscPos.js";
import {valorParametro, writeTemporary} from "../def/function.js";

export default class Printer {

	constructor(Pool){
		this.Pool = Pool;

		// Usar o metodo "carregarEscPos" para utilizar essa variavel
		// Nunca usar assim:   let escpos = this.escpos
		// Sempre usar assim:  let escpos = await this.carregarEscPos()
		this.escpos = null;

		this.colunas = null;
		this.nome = null;
		this.modelo = null;

		this.documento = null;
		this.documentoprodutos = null;
		this.documentopagamentos = null;
	}

	// Alimenta o papel (medida em linhas)
	async alimentar(linhas){
		let escpos = await this.carregarEscPos();
		escpos.feed(linhas);
	}

	// Imprime um codigo de barras
	async barcode(barcode){
		let escpos = await this.carregarEscPos();
		escpos.barcode(barcode);
	}

	async carregarEscPos(){
		if(this.escpos === null){
			let paramImpressoraFonte = await valorParametro(this.Pool, "IMPRESSORA", "FONTE");
			this.escpos = new EscPos(paramImpressoraFonte);
		}
		return this.escpos;
	}

	async carregarDadosDocumento(iddocumento){
		let documento, documentoprodutos,documentopagamentos;

		const client = await this.Pool.connect();

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
				"SELECT documentopagamento.*, formapagamento.descricao AS formapagamento",
				"FROM documentopagamento",
				"LEFT JOIN formapagamento USING (idformapagamento)",
				"WHERE documentopagamento.iddocumento = $1"
			].join(" ");
			res = await client.query(queryDocumentoPagamento, [iddocumento]);
			documentopagamentos = res.rows;
		}catch(e){
			throw e;
		}finally{
			client.release();
		}

		this.documento = documento;
		this.documentoprodutos = documentoprodutos;
		this.documentopagamentos = documentopagamentos;
	}

	// Retorna o conteudo a ser enviado para a impressora
	async conteudo(){
		let escpos = await this.carregarEscPos();
		return escpos.getContent();
	}

	// Abre gaveta
	async gaveta(){
		let escpos = await this.carregarEscPos();
		escpos.drawer();
	}

	// Aciona a guilhotina
	async guilhotina(){
		let escpos = await this.carregarEscPos();
		escpos.cut();
	}

	// Imprime um texto em uma impressora
	async imprimir(texto, nome){
		if(texto === undefined || texto === null){
			texto = await this.conteudo();
		}
		nome = (nome === undefined ? this.nome : nome).toUpperCase();

		let filename = writeTemporary("printer.txt", texto);

		if(this.modelo === null){
			this.modelo = await valorParametro(this.Pool, "IMPRESSORA", "MODELO");
		}
		if(this.modelo === "nenhum"){
			return true;
		}



		/*
		let SerialPort = window.require("serialport");

		let port = new SerialPort(nome, {
			baudRate: 2400,
			dataBits: 8,
			parity: "none",
			stopBits: 1
		}, (err) => {
			if(err) throw err;
		});

		port.on("open", function(){
			port.write(texto.byteList, (err) => {
				if(err) throw err;
			});
		});
		*/
		return true;
	}

	// Imprimir o cabecalho nos documentos
	async imprimirCabecalho(){
		// Nome da loja
		let nomefantasia = await valorParametro(this.Pool, "EMITENTE", "NOMEFANTASIA");
		await this.texto(nomefantasia, "center", true);

		// Razao social
		let razaosocial = await valorParametro(this.Pool, "EMITENTE", "RAZAOSOCIAL");
		if(razaosocial !== nomefantasia){
			await this.texto(razaosocial, "center", true);
		}

		// Endereco
		let paramEmitenteEndereco = await valorParametro(this.Pool, "EMITENTE", "ENDERECO");
		let paramEmitenteNumero = await valorParametro(this.Pool, "EMITENTE", "NUMERO");
		await this.texto(paramEmitenteEndereco + ", " + paramEmitenteNumero, "center");

		// Bairro, cidade e estado
		let paramEmitenteBairro = await valorParametro(this.Pool, "EMITENTE", "BAIRRO");
		let paramEmitenteMunicipio = await valorParametro(this.Pool, "EMITENTE", "MUNICIPIO");
		let paramEmitenteUF = await valorParametro(this.Pool, "EMITENTE", "UF");
		await this.texto(paramEmitenteBairro + " - " + paramEmitenteMunicipio + " - " + paramEmitenteUF, "center");

		// CNPJ e IE
		let paramEmitenteCNPJ = await valorParametro(this.Pool, "EMITENTE", "CNPJ");
		let paramEmitenteIE = await valorParametro(this.Pool, "EMITENTE", "IE");
		await this.texto("CNPJ " + paramEmitenteCNPJ + " IE " + paramEmitenteIE, "center");

		// Linha
		await this.linha();
	}

	// Imprime um documento
	async imprimirDocumento(iddocumento, success, fail){
		await this.reiniciar();
		await this.carregarDadosDocumento(iddocumento);

		let result = false;

		if(this.documento.operacao === "CU"){
			if(this.documento.status === "A"){
				result = await this.imprimirDocumentoAtivo();
			}
		}

		if(result && typeof success === "function"){
			success();
		}else if(!result && typeof fail === "function"){
			fail();
		}
	}

	// Imprime um documento ativo
	async imprimirDocumentoAtivo(numerovias){
		numerovias = (numerovias === undefined ? 1 : numerovias);

		let informacoes  = null;
		let qrcode = null;

		// Carrega o XML do documento
		if(this.documento.operacao === "CU" && this.documento.xml){
			let xml = require("xml-js").xml2json(this.documento.xml, {compact: true});
			xml = JSON.parse(xml);
			informacoes = xml.CFe.infCFe.infAdic.infCpl._text;
			if(xml.CFe.infCFe.ide.assinaturaQRCODE){
				qrcode = xml.CFe.infCFe.ide.assinaturaQRCODE._text;
			}
		}

		// Cria o cabecalho
		await this.imprimirCabecalho();

		// Identificacao do documento
		let numero = null;
		let dthrcriacao = this.documento.dthrcriacao.toLocaleString().split(" ");
		let dtcriacao = dthrcriacao[0];
		let hrcriacao = dthrcriacao[1];
		switch(this.documento.operacao){
			case "CU":
				numero = String(this.documento.numero).lpad(6, "0");
				await this.texto("CUPOM FISCAL ELETRÔNICO - SAT", "center", true);
				await this.texto("COO: " + numero + "  Data: " + dtcriacao + "  Hora: " + hrcriacao, "center");
				break;
			case "NC":
				numero = String(this.documento.numero).lpad(6, "0");
				await this.texto("NOTA FISCAL A PARTIR DE CUPOM", "center", true);
				await this.texto("Número: " + numero + "  Data: " + dtcriacao + "  Hora: " + hrcriacao, "center");
				break;
			case "OR":
				numero = String(this.documento.iddocumento).lpad(6, "0");
				await this.texto("ORÇAMENTO - SEM VALOR FISCAL", "center", true);
				await this.texto("Número: " + numero + "  Data: " + dtcriacao + "  Hora: " + hrcriacao, "center");
				break;
			case "RE":
				numero = String(this.documento.numero).lpad(6, "0");
				await this.texto("NOTA FISCAL DE REMESSA", "center", true);
				await this.texto("Número: " + numero + "  Data: " + dtcriacao + "  Hora: " + hrcriacao, "center");
				break;
			default:
				break;
		}

		// Linha
		await this.linha();

		// Identificacao do consumidor
		let cpfcnpj = null;
		switch(this.documento.operacao){
			case "CU":
				cpfcnpj = (this.documento.cpfcnpj ? this.documento.cpfcnpj : "não informado");
				await this.texto("CPF/CNPJ do consumidor: " + cpfcnpj);
				break;
			case "OR":
				cpfcnpj = (this.documento.cpfcnpj ? this.documento.cpfcnpj : "não informado");
				let nomeorcamento = (this.documento.nomeorcamento ? this.documento.nomeorcamento : "não informado");
				await this.texto("Nome do cliente: " + nomeorcamento);
				await this.texto("CPF/CNPJ do cliente: " + cpfcnpj);
				break;
			case "NC":
			case "RE":
				let query = [
					"SELECT parceiro.nome, parceiro.tipopessoa, parceiro.cpfcnpj,",
					"  parceiro.inscricaoestadual, cidade.nome AS cidade, estado.sigla AS estado,",
					"  parceiro.cep, parceiro.bairro, parceiro.endereco, parceiro.numero,",
					"  parceiro.complemento",
					"FROM parceiro",
					"LEFT JOIN cidade USING (idcidade)",
					"LEFT JOIN estado USING (idestado)",
					"WHERE parceiro.idparceiro = $1"
				].join(" ");

				let res = await this.Pool.query(query, [this.documento.idparceiro]);
				let parceiro = res.rows[0];

				await this.texto("DADOS DO DESTINATARIO", "center", true);
				await this.texto("Nome: " + parceiro.nome);
				await this.texto((parceiro.tipopessoa === "F" ? "CPF" : "CNPJ") + ": " + parceiro.cpfcnpj);
				if(parceiro.inscricaoestadual){
					await this.texto("Inscricao estadual: " + parceiro.inscricaoestadual);
				}
				await this.texto("Cidade: " + parceiro.cidade  + " - " + parceiro.estado);
				await this.texto("CEP: " + parceiro.cep + "   Bairro: " + parceiro.bairro);
				await this.texto("Endereço: " + parceiro.endereco + ", " + parceiro.numero);
				if(parceiro.complemento){
					await this.texto("Complemento: " + this.complemento);
				}
				break;
			default:
				break;
		}

		// Linha
		await this.linha();

		// Cabecalho dos produtos
		await this.texto("#   Descrição" + " ".repeat(this.colunas - 44) + "       Qtde X Preço       Total");

		// Linha
		await this.linha();

		// Imprime os produtos
		await this.documentoprodutos.forEach(async (documentoproduto) => {
			// Sequencial do produto
			let sequencial = String(documentoproduto.sequencial).lpad(3, "0");

			// Total do item
			let totalproduto = (documentoproduto.quantidade * documentoproduto.preco).format(2, ",", ".");

			// Calculo (preco x quantidade)
			let decimais = (documentoproduto.balanca === "S" ? 3 : 0);
			let unidade = (documentoproduto.balanca === "S" ? "KG" : "UN");
			let quantidade = documentoproduto.quantidade.format(decimais, ",", ".") + " " + unidade;
			let calculo = quantidade.lpad(10, " ") + " X " + documentoproduto.preco.format(2, ",", ".").rpad(8, " ") + " " + totalproduto.lpad(8, " ");

			// Calcula o tamanho maximo da descricao do produto
			let descricaoLength = this.colunas - (sequencial.length + calculo.length + 2);

			// Descricao do produto
			let descricao = documentoproduto.descricao.removeSpecial().substr(0, descricaoLength).rpad(descricaoLength, " ");

			// Monta o texto final e envia para impressora
			await this.texto(sequencial + " " + descricao + " " + calculo);

			// Verifica se houve desconto no item
			if(documentoproduto.totaldesconto){
				let totaldesconto = "-" + documentoproduto.totaldesconto.format(2, ",", ".");
				let texto = "    Desconto" + " ".repeat(this.colunas - (12 + totaldesconto.length)) + totaldesconto;
				await this.texto(texto);
			}

			// Verifica se houve acrescimo no item
			if(documentoproduto.totalacrescimo){
				let totalacrescimo = "-" + documentoproduto.totalacrescimo.format(2, ",", ".");
				let texto = "    Acrescimo" + " ".repeat(this.colunas - (13 + totalacrescimo.length)) + totalacrescimo;
				await this.texto(texto);
			}
		});

		// Total dos itens
		let totaldocumento = this.documento.totaldocumento.format(2, ",", ".");
		await this.texto("TOTAL" + " ".repeat(this.colunas - (5 + totaldocumento.length)) + totaldocumento, "left", true);
		this.alimentar(1);

		// Imprime os pagamentos
		await this.documentopagamentos.forEach(async (documentopagamento, i) => {
			let totalpagamento = 0;

			// Captura os valores
			let descricao = documentopagamento.formapagamento.removeSpecial();
			if(i + 1 === this.documentopagamentos.length){
				totalpagamento = documentopagamento.totalpagamento + this.documento.totaltroco;
			}else{
				totalpagamento = documentopagamento.totalpagamento;
			}
			totalpagamento = totalpagamento.format(2, ",", ".");

			// Imprime o pagamento no cupom
			await this.texto(descricao + " ".repeat(this.colunas - descricao.length - totalpagamento.length) + totalpagamento);
		});

		// Imprime o troco
		if(this.documento.totaltroco > 0){
			let descricao = "Troco";
			let totaltroco = this.documento.totaltroco.format(2, ",", ".");
			await this.texto(descricao + " ".repeat(this.colunas - descricao.length - totaltroco.length) + totaltroco);
		}

		// Verifica se eh um documento fiscal
		if(this.documento.chave){
			// Linha
			await this.linha();

			// Verifica se eh cupom
			if(this.documento.operacao === "CU"){
				// Observacoes do contribuinte
				await this.texto("OBSERVAÇÕES DO CONTRIBUINTE", "center");
				await this.texto("ICMS a se recolhido conforme LC 123/2006 - Simples Nacional.");
				await this.texto(informacoes);

				// Linha
				await this.linha();

				// Numero do SAT
				let paramSatSerie = await valorParametro(this.Pool, "SAT", "SERIE");
				await this.texto("SAT No. " + paramSatSerie, "center");
				await this.texto(dtcriacao + " - " + hrcriacao, "center");
			}

			// Imprime a chave CFe
			let chave = this.documento.chave.substr(-44);
			await this.alimentar(1);
			await this.texto(chave, "center");
			await this.barcode(chave.substr(0, 22));
			await this.alimentar(1);
			await this.barcode(chave.substr(22));

			// Imprime o QR Code
			if(qrcode){
				await this.alimentar(1);
				await this.qrcode(qrcode);
			}

			// Cria uma margem no cupom
			await this.alimentar(3);
		}

		// Cria uma margem no cupom
		await this.alimentar(3);

		// Cria uma margem no cupom
		await this.guilhotina();

		// Imprime o documento
		for(let i = 0; i < numerovias; i++){
			if(!this.imprimir()){
				return false;
			}
		}
	}

	// Imprime uma linha de separacao
	async linha(){
		await this.texto("-".repeat(this.colunas));
	}

	// Imprime um QR Code
	async qrcode(qrcode){
		let escpos = await this.carregarEscPos();
		escpos.qrcode(qrcode);
	}

	// Reinicia as configuracoes da impressora para os valor padroes
	async reiniciar(){
		let escpos = await this.carregarEscPos();

		if(this.colunas === null){
			this.colunas = await valorParametro(this.Pool, "IMPRESSORA", "COLUNAS");
		}
		if(this.nome === null){
			this.nome = await valorParametro(this.Pool, "IMPRESSORA", "NOME");
		}
		if(this.modelo === null){
			this.modelo = await valorParametro(this.Pool, "IMPRESSORA", "MODELO");
		}
		escpos.reset();
	}

	// Imprime um texto com opcao de alinhamento e negrito
	async texto(texto, align, bold){
		align = (align === undefined ? "left" : align);
		bold = (bold === undefined ? false : bold);

		let escpos = await this.carregarEscPos();

		switch(align){
			case "center":
				texto.cpad(this.colunas, " ");
				break;
			case "left":
				texto.lpad(this.colunas, " ");
				break;
			case "right":
				texto.rpad(this.colunas, " ");
				break;
			default:
				break;
		}

		texto = texto.substr(0, this.colunas);

		escpos.text(texto, bold);
	}

}
