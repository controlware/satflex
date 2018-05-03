import React from "react";

export default class Image extends React.Component {
	render(){
		let props = Object.assign({}, this.props);

		if(props.src){
			let fs = window.require("fs");
			let ext = props.src.split(".").reverse()[0];
			let data = fs.readFileSync(props.src, "base64");
			props.src = "data:image/" + ext + ";base64," + data;
		}

		return (
			<img {...props} alt="" />
		);
	}
}
