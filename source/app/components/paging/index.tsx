// framework
import React from "react";
// style
import "./index.scss";
// components
import Button from "@/app/components/button";
// modules
import settings from "@/modules/settings";

export interface PagingProps extends Props {
	enable: boolean;
	options: {
		size: number;
		index: number;
	};
	handler?: Record<"click", (value: number) => void>;
}

export interface PagingState {}

export class Paging extends React.Component<PagingProps, PagingState> {
	public props: PagingProps;
	public state: PagingState;

	constructor(props: PagingProps) {
		super(props);
		this.props = props;
		this.state = {};
	}
	public get_offset(value: number) {
		const breakpoint = ~~(settings.state.paging.metre / 2);
		const undeflow = (this.props.options.size > settings.state.paging.metre);
		const viewport = (this.props.options.index > breakpoint && undeflow) ? Math.abs(this.props.options.index - breakpoint) : 0;
		const overflow = (settings.state.paging.metre + viewport);

		return value + viewport + ((overflow > this.props.options.size && undeflow) ? (this.props.options.size - overflow) : 0);
	}
	static getDerivedStateFromProps(after: PagingProps, before: PagingProps) {
		return after;
	}
	public render() {
		return (
			<section data-component="paging" id={this.props.id} class={inline({ "enable": this.props.enable, "active": this.props.options.size > 1, "contrast": true, "center": true, ...this.props.class })}>
				<Button id="first" class={{ "enable": this.props.options.index !== 0 }}
					handler={{
						click: () => {
							this.props.handler?.click(0);
						}
					}}
				>{require(`@/assets/icons/first.svg`)}</Button>
				<Button id="backward" class={{ "enable": this.props.options.index !== 0 }}
					handler={{
						click: () => {
							this.props.handler?.click((this.props.options.index - 1).clamp(0, this.props.options.size - 1));
						}
					}}
				>{require(`@/assets/icons/backward.svg`)}</Button>
				{[...new Array<number>(Math.min(settings.state.paging.metre, this.props.options.size))].map((value, index) => {
					return (
						<Button class={{ "enable": true, "active": this.props.options.index === this.get_offset(index) }} key={index}
							handler={{
								click: () => {
									this.props.handler?.click(this.get_offset(index));
								}
							}}
						>{String(this.get_offset(index) + 1)}</Button>
					);
				})}
				<Button id="forward" class={{ "enable": this.props.options.index !== this.props.options.size - 1 }}
					handler={{
						click: () => {
							this.props.handler?.click((this.props.options.index + 1).clamp(0, this.props.options.size - 1));
						}
					}}
				>{require(`@/assets/icons/forward.svg`)}</Button>
				<Button id="last" class={{ "enable": this.props.options.index !== this.props.options.size - 1 }}
					handler={{
						click: () => {
							this.props.handler?.click(this.props.options.size - 1);
						}
					}}
				>{require(`@/assets/icons/last.svg`)}</Button>
			</section>
		);
	}
}

export default Paging;
