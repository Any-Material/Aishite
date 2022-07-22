export class Tag {
	readonly namespace: string;
	readonly value: any;

	constructor(args: Args<Tag>) {
		this.namespace = args.namespace;
		this.value = args.value;
	}
	public toString() {
		return `${this.namespace} = ${typeof this.value === "number" ? this.value : `"${this.value}"`}`;
	}
}
