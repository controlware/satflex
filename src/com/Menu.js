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
				link: "/venda"
			},
			{
				text: "Notas fiscais",
				icon: "clipboard",
				link: "/notafiscal",
				active: false
			},
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
				link: "/sair",
				active: false
			},
		]
	}

	render(){
		return <div className="menu-list">
			<ul>
				{this.listItem().map((item, i) => {
					return <MenuListItem key={i} pKey={i} text={item.text} icon={item.icon} link={item.link} activeItem={this.state.activeItem} changeActiveItem={this.changeActiveItem} />
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
		this.props.changeActiveItem(this.props.text);
	}

	render(){
		let className = null;
		if(this.props.activeItem === this.props.text){
			className = "active";
		}

		return (
			<Link to={this.props.link} onClick={this.onClick} className={className}>
				<Icon name={this.props.icon} />
				<span>{this.props.text}</span>
			</Link>
		);
	}
}
