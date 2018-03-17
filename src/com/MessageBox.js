import React from "react";
import $ from "jquery";
import {EventEmitter} from "events";

import Button from "./Button.js";

export class MessageBoxEmitter extends EventEmitter {
	
	constructor(){
		super();

		this.data = {
			buttons: [],
			focusOnClose: null,
			size: "md",
			text: null,
			title: null,
			visible: false
		}
	}

	// Adiciona um metodo a ser executado quando houver uma mudanca
	addChangeListener(callback){
		this.on("change", callback);
	}

	// Metodo responsavel em propagar as mudancas dos dados
	commitChange(){
		this.emit("change");
	}

	// Captura os dados atuais da classe
	getData(){
		return Object.assign({}, this.data);
	}

	// Retorna o elemento modal da caixa de mensagem
	getElement(){
		if(this.element === undefined){
			this.element = $("#__messagebox").get(0);
		}
		return this.element;
	}
	
	// Remove um metodo a ser executado quando houver uma mudanca
	removeChangeListener(callback){
		this.removeListener("change", callback);
	}

	// Escone a caixa de mensagem
	hide(){
		this.data.visible = false;
		this.commitChange();
	}

	// Exibe a caixa de mensagem
	show(settings){
		settings = $.extend({
			title: null,
			text: null,
			focusOnClose: null,
			size: "md",
			visible: true,
			buttons: [
				{
					text: "Ok",
					className: "btn-primary",
					icon: null,
					onClick: () => {
						this.hide();
					}
				}
			]
		}, settings);

		this.data = $.extend(this.data, settings);
		this.commitChange();
	}
}

export class MessageBoxModal extends React.Component {

	constructor(props){
		super(props);

		this.onChangeData = this.onChangeData.bind(this);

		this.state = props.MessageBoxEmitter.getData();
	}

	componentDidMount(){
		this.props.MessageBoxEmitter.addChangeListener(this.onChangeData);
	}

	componentWillUnmount(){
		this.props.MessageBoxEmitter.removeChangeListener(this.onChangeData);
	}

	onChangeData(){
		let data = this.props.MessageBoxEmitter.getData();
		if(data.visible !== this.state.visible){
			let element = this.props.MessageBoxEmitter.getElement();
			if(data.visible){
				$(element).modal("show");
			}else{
				$(element).modal("hide");
			}
		}
		this.setState(data);
	}

	render(){
		return (
			<div id="__messagebox" className="messagebox modal fade" data-backdrop="static">
				<div className={"modal-dialog modal-" + this.state.size}>
					<div className="modal-content">
						<div className="modal-header">
							<h3 className="modal-title">{this.state.title}</h3>
						</div>
						<div className="modal-body">{this.state.text}</div>
						<div className="modal-footer">
							{this.state.buttons.map(function(button, i){
								return <Button key={i} className={button.className} text={button.text} icon={button.icon} onClick={button.onClick} />
							})}
						</div>
					</div>
				</div>
			</div>
		);
	}

}