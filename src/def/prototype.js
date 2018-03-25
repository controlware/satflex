// Metodo para formatar um numero
// Ex: (999999.9999).format(2,",",".")  =>  "1.000.000,00"
Number.prototype.format = function(c, d, t){
	var n = this;

	c = (isNaN(c = Math.abs(c)) ? 2 : c);
	d = (d === undefined ? "," : d);
	t = (t === undefined ? "." : t);

	var s = (n < 0 ? "-" : "");
	var i = String(parseInt(n = Math.abs(+n || 0).toFixed(c)));
	var j = ((j = i.length) > 3 ? j % 3 : 0);

	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

// Metodo para substituir todas as ocorrencias em uma string
String.prototype.replaceAll = function(find, replace){
	return this.split(find).join(replace);
};

// Executa o "format" do tipo Number, porem esse metodo ja identifica a formatacao do numero
String.prototype.format = function(c, d, t){
	return this.toFloat().format(c, d, t);
};

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
