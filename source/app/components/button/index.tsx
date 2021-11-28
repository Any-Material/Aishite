// framework
import React from "react";
// style
import "./index.scss";

export interface ButtonProps extends Props {
	handler?: Record<"click", (button: number) => void>;
}

export interface ButtonState {}

export class Button extends React.Component<ButtonProps, ButtonState> {
	public props: ButtonProps;
	public state: ButtonState;

	constructor(props: ButtonProps) {
		super(props);
		this.props = props;
		this.state = {};
	}
	public render() {
		return (
			<button data-component="button" id={this.props.id} class={inline({ "un_draggable": true, ...this.props.class })} {...typeof this.props.children === "string" ? { dangerouslySetInnerHTML: { __html: this.props.children } } : {}}
				onMouseUp={(event) => {
					this.props.handler?.click(event.button);
				}}
			>{typeof this.props.children === "string" ? undefined : this.props.children}</button>
		);
	}
}

export default Button;
