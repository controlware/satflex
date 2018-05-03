export default class Email {

	constructor(){
		this.nodemailer = window.require("nodemailer");

		this._anexos = [];
		this._destinatario = null;
		this._titulo = null;
		this._remetente = null;
	}

	anexo(filename){
		this._anexos.push({
			filename: filename.split("/").reverse()[0],
			path: filename,
			cid: String(Math.random())
		});
	}

	corpo(corpo){
		this._corpo = corpo;
	}

	destinatario(destinatario){
		if(Array.isArray(destinatario)){
			destinatario = destinatario.join(", ");
		}
		this._destinatario = destinatario;
	}

	enviar(success, fail){
		let transport = this.nodemailer.createTransport({
			host: "smtplw.com.br",
			port: 587,
			secure: false,
			auth: {
				user: "controlwareemail",
				pass: "hdOyAACq7007"
			}
		});

		let message = {
			from: '"" <satflex@controlware.com.br>',
			to: this._destinatario,
			subject: this._titulo,
			html: this._corpo,
			attachments: this._anexos
		};

		transport.sendMail(message, (err, info) => {
			if(err){
				fail(err);
				return err;
			}
			success();
			return true;
		});
	}

	remetente(remetente){
		this._remetente = remetente;
	}

	titulo(titulo){
		this._titulo = titulo;
	}

}
