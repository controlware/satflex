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
				link: "/notafiscal"
			},
			{
				text: "Cadastros",
				icon: "stack",
				link: "/produto"
			},
			{
				text: "Relatórios",
				icon: "chart-line",
				link: "/relatorio"
			},
			{
				text: "Contador",
				icon: "suitcase",
				link: "/contador"
			},
			{
				text: "Configurações",
				icon: "cogs",
				link: "/configuracao"
			},
			{
				text: "Suporte",
				icon: "help",
				link: "/suporte"
			},
			{
				text: "Sair",
				icon: "exit",
				link: "/sair"
			},
		]
	}

	render(){
		return <div className="menu-list">
			<ul>
				{this.listItem().map(function(item, i){
					return <MenuListItem key={i} pKey={i} text={item.text} icon={item.icon} link={item.link} />
				})}
			</ul>
		</div>
	}
}

class MenuListItem extends React.Component {
	render(){
		return (
			<li>
				<Link to={this.props.link}>
					<Icon name={this.props.icon} />
					<span>{this.props.text}</span>
				</Link>
			</li>
		);
	}
}
