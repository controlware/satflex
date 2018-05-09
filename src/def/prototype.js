// Metodo para formatar um numero
// Ex: (999999.9999).format(2,",",".")  =>  "1.000.000,00"
Number.prototype.format = function(c, d, t){
	let n = this;

	c = (isNaN(c = Math.abs(c)) ? 2 : c);
	d = (d === undefined ? "," : d);
	t = (t === undefined ? "." : t);

	let s = (n < 0 ? "-" : "");
	let i = String(parseInt(n = Math.abs(+n || 0).toFixed(c), 10));
	let j = (i.length > 3 ? i.length % 3 : 0);

	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

// Retorna um array com o codigo de cada caracter do texto
String.prototype.byteList = function(text){
	return text.split("").map(function(c){
		return c.charCodeAt(0);
	});
};


// Preenche com o caracter desejado centralizando o texto
String.prototype.cpad = function(length, char){
    let value = this;
	let i = 0;
    while(value.length < length){
		if(i++ % 2 === 0){
			value = value + char;
		}else{
			value = char + value;
		}
	}
    return String(value);
}

// Executa o "format" do tipo Number, porem esse metodo ja identifica a formatacao do numero
String.prototype.format = function(c, d, t){
	return this.toFloat().format(c, d, t);
};

// Preenche com o caracter desejado a esquerda do texto
String.prototype.lpad = function(length, char){
    let value = this;
    while(value.length < length){
		value = char + value;
	}
    return String(value);
}

// Remove a formatacao de textos
// Ex: ("(11) 99565-3470").removeFormat() => "11995653470"
String.prototype.removeFormat = function(){
	let value = this;
	let symbols = [" ", ".", ",", "-", "/", "\\", "(", ")"];
	symbols.forEach((symbol) => {
		value = value.replaceAll(symbol, "");
	});
	return value;
};

// Remove caracteres especiais
String.prototype.removeSpecial = function(){
	let oldChars = ["á", "à", "ã", "â", "é", "è", "ê", "í", "ì", "î", "ó", "ò", "õ", "ô", "ú", "ù", "û", "ü", "ç", "Á", "À", "Ã", "Â", "É", "È", "Ê", "Í", "Ì", "Î", "Ó", "Ò", "Õ", "Ô", "Ú", "Ù", "Û", "Ü", "Ç", "ª", "º"];
	let newChars = ["a", "a", "a", "a", "e", "e", "e", "i", "i", "i", "o", "o", "o", "o", "u", "u", "u", "u", "c", "A", "A", "A", "A", "E", "E", "E", "I", "I", "I", "O", "O", "O", "O", "U", "U", "U", "U", "C", "a", "o"];
	let value = this;
	for(let i = 0; i < oldChars.length; i++){
		value = value.replaceAll(oldChars[i], newChars[i]);
	}
	return value;
};

// Metodo para substituir todas as ocorrencias em uma string
String.prototype.replaceAll = function(find, replace){
	return this.split(find).join(replace);
};

// Preenche com o caracter desejado a direita do texto
String.prototype.rpad = function(length, char){
    let value = this;
    while(value.length < length){
		value = value + char;
	}
    return String(value);
}

// Tranforma uma string em um numero
// Exemplo: 1.200,85 => 1200.85
String.prototype.toFloat = function(){
	var value = this;
	if(value.indexOf(".") === -1 && value.indexOf(",") > -1){ // 1200,85
		value = value.replace(",", ".");
	}else if(value.indexOf(".") > -1 && value.indexOf(",") > -1){ // 1.200,85 ou 1,200.85
		if(value.indexOf(".") < value.indexOf(",")){ // 1.200,85
			value = value.replace(".", "").replace(",", ".");
		}else if(value.indexOf(".") > value.indexOf(",")){ // 1,200.85
			value = value.replace(",", "");
		}
	}
	return parseFloat(value);
};
