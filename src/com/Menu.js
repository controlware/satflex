import React from "react";
import {Link} from "react-router-dom";
import Icon from "./Icon.js";

import "../css/Menu.css";

export default class Menu extends React.Component {
	render(){
		return(
			<div id="menu">
				<MenuList />
			</div>
		)
	}
}

class MenuList extends React.Component {

	constructor(props){
		super(props)

		this.state = {
			activeItem: "Vender"
		};

		this.changeActiveItem = this.changeActiveItem.bind(this);
	}

	changeActiveItem(text){
		this.setState({
			activeItem: text
		});
	}

	listItem(){
		return [
			{
				text: "Vender",
				icon: "shop",
				link: "/"
			},/*
			{
				text: "Notas fiscais",
				icon: "clipboard",
				link: "/notafiscal",
				active: false
			},*/
			{
				text: "Cadastros",
				icon: "stack",
				link: "/produto",
				active: false
			},
			{
				text: "Relatórios",
				icon: "chart-line",
				link: "/relatorio",
				active: false
			},
			{
				text: "Contador",
				icon: "suitcase",
				link: "/contador",
				active: false
			},
			{
				text: "Configurações",
				icon: "cogs",
				link: "/configuracao",
				active: false
			},
			{
				text: "Suporte",
				icon: "help",
				link: "/suporte",
				active: false
			},
			{
				text: "Sair",
				icon: "exit",
				active: false,
				action: () => {
					window.MessageBox.show({
						title: "Sair do SAT-Flex",
						text: "Você tem certeza que deseja encerrar o SAT-Flex agora?",
						buttons: [
							{
								text: "Sim",
								color: "green",
								icon: "thumbs-up",
								onClick: () => {
									window.close();
								}
							},
							{
								text: "Não",
								color: "red",
								icon: "thumbs-down",
								onClick: () => {
									window.MessageBox.hide();
								}
							}
						]
					});
				}
			},
		]
	}

	render(){
		return <div className="menu-list">
			<ul>
				{this.listItem().map((item, i) => {
					return <MenuListItem key={i} pKey={i} item={item} activeItem={this.state.activeItem} changeActiveItem={this.changeActiveItem} />
				})}
			</ul>
		</div>
	}
}

class MenuListItem extends React.Component {

	constructor(props){
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	onClick(){
		if(this.props.item.link){
			this.props.changeActiveItem(this.props.item.text);
		}
		if(this.props.item.action){
			this.props.item.action();
		}
	}

	render(){
		let className = null;
		if(this.props.activeItem === this.props.item.text){
			className = "active";
		}

		if(this.props.item.link){
			return (
				<Link to={this.props.item.link} onClick={this.onClick} className={className}>
					<Icon name={this.props.item.icon} />
					<span>{this.props.item.text}</span>
				</Link>
			);
		}else{
			return (
				<a onClick={this.onClick} className={className}>
					<Icon name={this.props.item.icon} />
					<span>{this.props.item.text}</span>
				</a>
			);
		}
	}
}
