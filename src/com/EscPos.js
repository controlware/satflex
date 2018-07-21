const LF = "\x0a";
const ESC = "\x1b";
const GS = "\x1d";

export default class EscPos {

	// Metodo construtor
	// O parametro "font" representa a fonte a ser utilizada (vem dos parametros do sistema)
	constructor(font){
		this.font = font;
		this.content = [];
	}

	// Imprime um codigo de barras
	barcode(barcode, height, width){
		height = (height === undefined ? 50 : height);
		width = (width === undefined ? 1 : width);

		// Descobre o tipo de codigo de barras
		let type = null;
		switch(barcode.length){
			case 7: // EAN7
			case 8: // EAN8
				type = 68;
				break;
			case 12: // EAN12
			case 13: // EAN13
				type = 67;
				break;
			default: // ITF
				type = 70;
				break;
		}

		// Define a altura do codigo de barras
		this.content.push(GS + "h" + String.fromCharCode(height));

		// Define a largura das barras do codigo de barras
		this.content.push(GS + "w" + String.fromCharCode(width));

		// Centraliza a impressao
		this.content.push(ESC + "a" + String.fromCharCode(1));

		// Imprime o codigo de barras
		this.content.push(GS + "k" + String.fromCharCode(type) + String.fromCharCode(barcode.length) + barcode);

		// Alinha a impressao a esquerda
		this.content.push(ESC + "a" + String.fromCharCode(0));

	}

	// Liga ou desliga o texto em negrito
	bold(bool){
		this.content.push(ESC + "G" + String.fromCharCode(bool ? 1 : 0));
	}

	// Aciona a guilhotina
	cut(){
		this.content.push(GS + "V" + String.fromCharCode(1));
	}

	// Abre gaveta
	drawer(){
		this.content.push(ESC + "p" + String.fromCharCode(0) + String.fromCharCode(13) + String.fromCharCode(10));
	}

	// Alimenta o papel (medida em linhas)
	feed(lines){
		this.content.push(ESC + "d" + String.fromCharCode(lines));
	}

	// Retorna o conteudo a ser impresso
	getContent(){
		return this.content.join("");
	}

	// Reinicia as configuracoes para os valores padroes
	reset(){
		this.content = [];
		this.content.push(ESC + String.fromCharCode(0)); // Espaco entre linhas no tamanho padrao
		this.content.push(ESC + " " + String.fromCharCode(0)); // Espaco entre os caracteres
		this.content.push(ESC + "M" + String.fromCharCode(this.font)); // Estilo da fonte
		this.content.push(GS + "!" + String.fromCharCode(0)); // Tamanho da fonte
		this.content.push(ESC + "t" + String.fromCharCode(3)); // Tabela de codigo de caracter (Portugues)
		this.content.push(ESC + "R" + String.fromCharCode(12)); // Caracteres internacionais (America Latina)
		this.content.push(GS + "B" + String.fromCharCode(0)); // Desliga o fundo pintado (cores invertidas)
		this.content.push(ESC + "G" + String.fromCharCode(0)); // Desliga o negrito
		this.content.push(ESC + "a" + String.fromCharCode(0)); // Alinha a impressao a esquerda
	}

	// Imprime um QR Code
	qrcode(qrcode){
		let len = qrcode.length + 3;
		let pl = len % 256;
		let ph = len / 256;

		// Centraliza a impressao
		this.content.push(ESC + "a" + String.fromCharCode(1));

		// Columns function (65)
		this.content.push(GS + "(k" + String.fromCharCode(4) + String.fromCharCode(0) + String.fromCharCode(49) + String.fromCharCode(65) + String.fromCharCode(50) + String.fromCharCode(0))

		// Size function (67)
		this.content.push(GS + "(k" + String.fromCharCode(3) + String.fromCharCode(0) + String.fromCharCode(49) + String.fromCharCode(67) + String.fromCharCode(3));

		// Error correction function (69)
		this.content.push(GS + "(k" + String.fromCharCode(3) + String.fromCharCode(0) + String.fromCharCode(49) + String.fromCharCode(69) + String.fromCharCode(51));

		// Save data function (80)
		this.content.push(GS + "(k" + String.fromCharCode(pl) + String.fromCharCode(ph) + String.fromCharCode(49) + String.fromCharCode(80) + String.fromCharCode(48) + qrcode);

		// Print function (81)
		this.content.push(GS + "(k" + String.fromCharCode(3) + String.fromCharCode(0) + String.fromCharCode(49) + String.fromCharCode(81) + String.fromCharCode(48));

		// Alinha impressao a esquerda
		this.content.push(ESC + "a" + String.fromCharCode(0));
	}

	// Imprime um texto
	text(text, bold){
		text = text.removeSpecial();
		text = text.replaceAll("|", String.fromCharCode(179));
		if(bold) this.bold(true);
		this.content.push(text + LF);
		if(bold) this.bold(false);
	}

}
