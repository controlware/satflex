import React from "react";
import ReactDOM from "react-dom";
import {SwatchesPicker} from "react-color";
import $ from "jquery";

import "../css/ColorInput.css";

export default class ColorInput extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			picker: false,
			value: props.value
		};

		this.onChange = this.onChange.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onDocumentClick = this.onDocumentClick.bind(this);
	}

	componentWillReceiveProps(nextProps){
		this.setState({
			value: nextProps.value
		});
	}

	componentDidMount(){
		document.addEventListener("click", this.onDocumentClick);
		this.element = ReactDOM.findDOMNode(this);
	}

	componentWillUnmount(){
		document.removeEventListener("click", this.onDocumentClick);
	}

	onChange(color, event){
		event.persist();

		this.setState({
			picker: false,
			value: color.hex
		}, () => {
			if(this.props.onChange){
				let target = $(event.target).parents("[class*='-picker']").first().prev().get(0);
				event.target = target;
				this.props.onChange(event);
			}
		});
	}

	onClick(event){
		this.setState({
			picker: true
		});
		event.preventDefault();
	}

	onDocumentClick(event){
		if(this.state.picker){
			let found = false;
			$(this.element).find("*").each((i, element) => {
				if(event.target === element){
					found = true;
				}
			});
			if(!found){
				this.setState({
					picker: false
				});
			}
		}
	}

	render(){
		let props = Object.assign({}, this.props);

		delete props.value;

		return (
			<div>
				<input {...props} value={this.state.value} onClick={this.onClick} />
				<SwatchesPicker value={this.state.value} onChange={this.onChange} className={this.state.picker ? null : "d-none"} />
			</div>
		);
	}

}
