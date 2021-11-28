// framework
import React from "react";
// style
import "./index.scss";

export interface TerminalProps extends Props {
	options: Record<string, (args: Args, flags: Flags) => void>;
}

export interface TerminalState {
	index: number;
	history: Message[];
}

export interface Args {
	[key: string]: string;
}

export interface Flags {
	[key: string]: boolean;
}

export interface Message {
	value: string;
	color?: string;
	style?: "normal" | "bold" | "italic";
}

export class Terminal extends React.Component<TerminalProps> {
	public props: TerminalProps;
	public state: TerminalState;

	constructor(props: TerminalProps) {
		super(props);
		this.props = props;
		this.state = {
			index: 0,
			history: [{ value: "Breaking changes are within our grasp...", color: "coral" }]
		};
	}
	public write(message: Array<Message>) {
		this.setState({ ...this.state, index: this.state.index + message.length, history: [...this.state.history, ...message] });
	}
	public error(value: string) {
		this.write([{ value: `(Error) ${value}`, color: "red", style: "italic" }]);
	}
	public parse(value: string) {
		const parsed = {
			args: {} as Args,
			flags: {} as Flags,
			command: ""
		};
		const scope = {
			string: "",
			number: 0
		};
		for (const [index, fragment] of (value + "\u0020").split(/\s+/).entries()) {
			if (!index) {
				parsed.command = fragment.toLowerCase();
			} else if (fragment.length) {
				//
				// 0: unused
				// 1: prefix
				// 2: value
				const match = /^([-]*)([\D\d]+)$/.match(fragment)!;

				switch (match.group(1)!.length) {
					case 0: {
						if (scope.string.length) {
							parsed.args[scope.string] = match.group(2)!;
							scope.string = "";
						} else {
							parsed.args[scope.number] = match.group(2)!;
							scope.number++;
						}
						break;
					}
					case 1: {
						scope.string = match.group(2)!;
						parsed.args[scope.string] = "";
						break;
					}
					case 2: {
						parsed.flags[match.group(2)!] = true;
						break;
					}
				}
			}
		}
		return parsed;
	}
	static getDerivedStateFromProps(after: TerminalProps, before: TerminalProps) {
		return after;
	}
	public render() {
		return (
			<section data-viewport="terminal" id={this.props.id} class={inline({ "scroll-y": true, ...this.props.class })}>
				<section id="history">
					{this.state.history.map((written, index) => {
						return (
							<output class={inline({ [written.style ? written.style : "normal"]: true })} style={{ color: written.color }} key={index}>{written.value}</output>
						);
					})}
					<input placeholder="Type /help for a list of commands"
						onKeyDown={(event) => {
							switch (event.key) {
								case "Enter": {
									const parsed = this.parse((event.target as HTMLInputElement).value);
									// empty string
									if (!parsed.command.length) {
										break;
									}
									// built-in
									const command: TerminalProps["options"] = {
										"say": (args: Args, flags: Flags) => {
											if (!Object.values(args).length) {
												return this.error("Invalid arguments");
											}
											this.write([{ value: Object.values(args).join("\u0020"), color: "grey", style: "italic" }]);
										},
										"clear": (args: Args, flags: Flags) => {
											this.setState({ ...this.state, index: 0, history: [{ value: "Outshining even with a glance...", color: "coral" }] });
										},
										"help": (args: Args, flags: Flags) => {
											this.write([
												{ value: "List of commands:", style: "bold", color: "grey" },
												...["say", "clear", "help", ...Object.keys(this.props.options)].map((command) => {
													return { value: `-${command}` };
												})
											]);
										},
										...this.props.options
									};
									if (command[parsed.command]) {
										// execute
										command[parsed.command](parsed.args, parsed.flags);
									} else {
										this.error("Invalid command");
									}
									// reset
									(event.target as HTMLInputElement).value = "";
									break;
								}
							}
						}}
					></input>
				</section>
			</section>
		);
	}
}

export default Terminal;
