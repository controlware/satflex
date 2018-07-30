export function applicationDirectory(){
	//return window.require("electron").remote.app.getAppPath();

	let os = window.require("os");
	if(os.platform() === "win32"){
		return "C:/SAT-Flex/resources/app/";
	}else{
		return window.require("path").resolve();
	}
}

export function currentDate(){
	return currentTimestamp().split("T")[0];
}

export function currentTimestamp(){
	let timezoneOffset = (new Date()).getTimezoneOffset() * 60000;
	let localISOTimestamp = (new Date(Date.now() - timezoneOffset)).toISOString();
	return localISOTimestamp;
};

// Calcula quantas casas deve usar para formatar um valor referente a quantidade
export function decimaisQuantidade(quantidade){
	let decimal = String(quantidade).split(".")[1];
	if(decimal === undefined || decimal.length === 0 || parseInt(decimal, 10) === 0){
		return 0;
	}else{
		return 3;
	}
}

export function defaultMessageBoxError(err){
	let text = null;
	if(err === undefined || err === null){
		text = "Erro não identificado.";
	}else if(typeof err === "string"){
		text = err;
	}else{
		text = err.message;
		console.log(err.stack);
	}
	window.MessageBox.show({
		title: "Houve uma falha",
		text: text
	});
}

export async function serialNumber(){
	let os = window.require("os");
	if(os.platform() === "win32"){
		let command = "wmic diskdrive get SerialNumber";
		let stdout = window.require("child_process").execSync(command).toString();
		stdout = stdout.trim().split(" ").splice(-1)[0].trim();
		return stdout;
	}else{
		return new Promise((resolve) => {
			let serialNumber = window.require("serial-number");
			serialNumber((err, value) => {
				resolve(value);
			});
		});
	}
}

export function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function temporaryDirectory(){
	let os = window.require("os");
	let dirname = os.homedir() + "/SAT-Flex/";
	return dirname;
}

export function validarCNPJ(cnpj){
	cnpj = cnpj.replace(/[^\d]+/g, "");
	if(cnpj === ""){
		return false;
	}
	if(cnpj.length !== 14){
		return false;
	}
	if(cnpj === "00000000000000" || cnpj === "11111111111111" || cnpj === "22222222222222" || cnpj === "33333333333333" || cnpj === "44444444444444" || cnpj === "55555555555555" || cnpj === "66666666666666" || cnpj === "77777777777777" || cnpj === "88888888888888" || cnpj === "99999999999999"){
		return false;
	}
	var tamanho = cnpj.length - 2;
	var numeros = cnpj.substring(0, tamanho);
	var digitos = cnpj.substring(tamanho);
	var soma = 0;
	var pos = tamanho - 7;
	for(let i = tamanho; i >= 1; i--){
		soma += numeros.charAt(tamanho - i) * pos--;
		if(pos < 2){
			pos = 9;
		}
	}
	var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
	if(parseInt(resultado, 10) !== parseInt(digitos.charAt(0), 10)){
		return false;
	}
	tamanho = tamanho + 1;
	numeros = cnpj.substring(0, tamanho);
	soma = 0;
	pos = tamanho - 7;
	for(let i = tamanho; i >= 1; i--){
		soma += numeros.charAt(tamanho - i) * pos--;
		if(pos < 2){
			pos = 9;
		}
	}
	resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
	if(parseInt(resultado, 10) !== parseInt(digitos.charAt(1), 10)){
		return false;
	}
	return true;
}

export function validarCPF(cpf){
	cpf = cpf.replace(/[^\d]+/g, "");
	if(cpf === ""){
		return false;
	}
	if(cpf.length !== 11 || cpf === "00000000000" || cpf === "11111111111" || cpf === "22222222222" || cpf === "33333333333" || cpf === "44444444444" || cpf === "55555555555" || cpf === "66666666666" || cpf === "77777777777" || cpf === "88888888888" || cpf === "99999999999"){
		return false;
	}
	var add = 0;
	for(let i = 0; i < 9; i++){
		add += parseInt(cpf.charAt(i), 10) * (10 - i);
	}
	var rev = 11 - (add % 11);
	if(rev === 10 || rev === 11){
		rev = 0;
	}
	if(parseInt(rev, 10) !== parseInt(cpf.charAt(9), 10)){
		return false;
	}
	add = 0;
	for(let i = 0; i < 10; i++){
		add += parseInt(cpf.charAt(i), 10) * (11 - i);
	}
	rev = 11 - (add % 11);
	if(rev === 10 || rev === 11){
		rev = 0;
	}
	if(parseInt(rev, 10) !== parseInt(cpf.charAt(10), 10)){
		return false;
	}
	return true;
}

export async function valorParametro(Pool, grupo, nome, callback){
	let {rows} = await Pool.query("SELECT valor FROM parametro WHERE grupo = $1 AND nome = $2", [grupo, nome]);
	let valor = rows[0].valor;
	if(typeof callback === "function"){
		callback(valor);
	}
	return valor;
}

export function writeTemporary(filename, content){
	let fs = window.require("fs");

	let dirname = temporaryDirectory();
	if(!fs.existsSync(dirname)){
		fs.mkdirSync(dirname);
	}

	let finalName = dirname + filename;

	let encode = undefined;
	if(filename.substr(-4) === ".zip"){
		encode = "binary";
	}

	fs.writeFileSync(finalName, content, encode);
	return finalName;
}
