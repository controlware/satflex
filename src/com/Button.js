import React from "react";
import Icon from "./Icon.js";
import "../css/Button.css";

export default class Button extends React.Component {
	static defaultProps = {
		block: false,
		disabled: false,
		iconPosition: "left",
		size: "md",
		color: "blue"
	}

	render(){
		var innerButton = null;
		if(this.props.icon){
			if(this.props.text){
				switch(this.props.iconPosition){
					default:
					case "left":
						innerButton = [
							<Icon name={this.props.icon} key="0" />,
							<span className="ml-2" key="1">{this.props.text}</span>
						];
						break;
					case "right":
						innerButton = [
							<span className="mr-2" key="0">{this.props.text}</span>,
							<Icon name={this.props.icon} key="1" />
						];
						break;
				}
			}else{
				innerButton = <Icon name={this.props.icon} />;
			}
		}else{
			innerButton = <span>{this.props.text}</span>;
		}

		var className = [
			"btn",
			"btn-primary",
			"btn-" + this.props.size,
			"btn-color-" + this.props.color,
		];

		if(this.props.className){
			className.push(this.props.className);
		}
		if(this.props.block){
			className.push("btn-block");
		}

		return (
			<button className={className.join(" ")} onClick={this.props.onClick} disabled={this.props.disabled}>
				{innerButton}
			</button>
		);
	}
}
