// framework
import React from "react";
// style
import "./index.scss";
// components
import DropDown from "@/app/components/dropdown";
// modules
import suggest, { Suggestion } from "@/modules/hitomi.la/suggest";

export interface QueryProps extends Props {
	enable: boolean;
	options: {
		value: string;
	};
	handler?: Record<"confirm", (value: string) => void>;
}

export interface QueryState {
	focus: boolean;
	suggests: Array<Suggestion>;
}

export class Query extends React.Component<QueryProps, QueryState> {
	public props: QueryProps;
	public state: QueryState;
	public refer: {
		dropdown: React.RefObject<DropDown>;
	};

	constructor(props: QueryProps) {
		super(props);
		this.props = props;
		this.state = {
			focus: false,
			suggests: []
		};
		this.refer = {
			dropdown: React.createRef()
		};
	}
	public get() {
		return this.refer.dropdown.current?.get();
	}
	public set(value: string) {
		if (this.refer.dropdown.current) {
			this.refer.dropdown.current?.set(value);
		}
	}
	public query() {
		return this.get()?.toLowerCase().split(/\s+/).pop()!.split(/:/).pop()!;
	}
	static getDerivedStateFromProps(after: QueryProps, before: QueryProps) {
		return after;
	}
	public render() {
		return (
			<section data-component="query" id={this.props.id} class={inline({ ...this.props.class })}>
				<DropDown
					ref={this.refer.dropdown}
					enable={this.props.enable}
					options={{
						type: "input",
						items: this.state.suggests.map((suggestion) => {
							return [`${suggestion.field}:${suggestion.value}`, String(suggestion.count)];
						}),
						highlight: this.query(),
						placeholder: this.props.options.value
					}}
					handler={{
						click: (value) => {
							this.setState({ ...this.state, suggests: [] }, () => {
								suggest.outdate();
								this.set([...this.get()!.split(/\s+/).slice(0, -1), value.replace(/\s+/g, "_")].join("\u0020"));
							});
						},
						change: () => {
							this.setState({ ...this.state, suggests: [] }, () => {
								suggest.update(this.query()).then((suggestion) => {
									this.setState({ ...this.state, suggests: suggestion });
								});
							});
						},
						confirm: () => {
							this.props.handler?.confirm(this.get()!);
						}
					}}
				></DropDown>
			</section>
		);
	}
}

export default Query;
