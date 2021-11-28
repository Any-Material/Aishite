// framework
import React from "react";
// style
import "./index.scss";
// components
import Button from "@/app/components/button";

export interface DropDownProps extends Props {
	enable: boolean;
	options: {
		type: "input" | "select";
		items: Array<[string, string]>;
		highlight: string;
		placeholder: string;
	};
	handler?: Record<"click" | "change" | "confirm", (value: string) => void>;
}

export interface DropDownState {
	index: number;
	focus: boolean;
}

export class DropDown extends React.Component<DropDownProps, DropDownState> {
	public props: DropDownProps;
	public state: DropDownState;
	public refer: {
		input: React.RefObject<HTMLInputElement>;
	};

	constructor(props: DropDownProps) {
		super(props);
		this.props = props;
		this.state = {
			index: NaN,
			focus: false
		};
		this.refer = {
			input: React.createRef()
		};
	}
	public get() {
		return this.refer.input.current?.value;
	}
	public set(value: string) {
		if (this.refer.input.current) {
			this.refer.input.current.value = value;
		}
	}
	static getDerivedStateFromProps(after: DropDownProps, before: DropDownProps) {
		return after;
	}
	public render() {
		return (
			<section data-component="dropdown" id={this.props.id} class={inline({ ...this.props.class })}>
				<input class="contrast" ref={this.refer.input} readOnly={!this.props.enable || this.props.options.type === "select"} placeholder={this.props.options.placeholder} defaultValue={this.props.options.placeholder}
					onFocus={() => {
						this.setState({ ...this.state, focus: true });
					}}
					onBlur={() => {
						this.setState({ ...this.state, focus: false });
					}}
					onChange={(event) => {
						this.props.handler?.change(event.target.value);
					}}
					onKeyDown={(event) => {
						if (this.state.focus) {
							switch (event.key) {
								case "ArrowUp": {
									if (!this.state.index) {
										this.setState({ ...this.state, index: NaN });
									} else {
										this.setState({ ...this.state, index: (this.state.index - 1).clamp(0, this.props.options.items.length - 1) });
									}
									break;
								}
								case "ArrowDown": {
									if (isNaN(this.state.index)) {
										this.setState({ ...this.state, index: 0 });
									} else {
										this.setState({ ...this.state, index: (this.state.index + 1).clamp(0, this.props.options.items.length - 1) });
									}
									break;
								}
								case "Enter": {
									if (isNaN(this.state.index)) {
										this.props.handler?.confirm(this.get()!);
									} else {
										this.props.handler?.click(this.props.options.items[this.state.index][0]);
									}
									this.setState({ ...this.state, focus: !isNaN(this.state.index), index: NaN });
									break;
								}
							}
						}
					}}>
				</input>
				<section id="expandable" class={inline({ "active": this.state.focus && this.props.options.items.length > 0, "contrast": true })}>
					{this.props.options.items.map((item, index) => {
						return (
							<Button class={{ "center-y": true, "active": this.state.index === index }} data-description={item[1]} key={index}
								handler={{
									click: () => {
										this.props.handler?.click(item[0]);
									}
								}}
							>{[...item[0].split(this.props.options.highlight)].map((value, index, array) => { return value + (index < array.length - 1 ? `<strong key=${index}>${this.props.options.highlight}</strong>` : ""); }).join("")}</Button>
						);
					})}
				</section>
			</section>
		);
	}
}

export default DropDown;
