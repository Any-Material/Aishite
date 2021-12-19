export class Props<C extends TextChild | SingleChild | ArrayChild | undefined> {
	public readonly id?: string;
	public readonly style?: React.CSSProperties;
	public readonly children?: C;

	constructor(args: Props<C>) {
		this.id = args.id;
		this.style = args.style;
		this.children = args.children;
	}
}

export class FlipFlop<C extends TextChild | SingleChild | ArrayChild | undefined> extends Props<C> {
	public readonly toggle: boolean;

	constructor(args: FlipFlop<C>) {
		super(args);

		this.toggle = args.toggle;
	}
}

export class Casacade {
	public readonly style?: React.CSSProperties;
	public readonly modify?: Record<string, any>;
	public readonly children: ArrayChild;

	constructor(args: Casacade) {
		this.style = args.style;
		this.modify = args.modify;
		this.children = args.children;
	}
}
