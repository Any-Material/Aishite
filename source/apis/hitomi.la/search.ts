import client from "@/modules/node.js/request";

import { Tag } from "@/models/tag";
import { Pair } from "@/models/pair";
import { Endian } from "@/models/endian";

import { module as suggest } from "@/apis/hitomi.la/suggest";

import { Directory, mirror } from "@/apis/hitomi.la/private/version";

enum Symbol {
	//
	AND,
	PLUS,
	MINUS,
	//
	EQUAL,
	N_EQUAL,
	//
	L_PAREN,
	R_PAREN,
	//
	N_LITERAL,
	S_LITERAL,
	//
	IDENTIFIER,
	//
	EOF
}

enum Channel {
	PROPERTY,
	FUNCTION
}

class Token {
	constructor(
		public readonly type: Symbol,
		public readonly value?: unknown
	) { }

	public is(type: Symbol) {
		return this.type === type;
	}
	public toString() {
		// skip
		if (this.value) return { type: Symbol[this.type], value: this.value };

		return { type: Symbol[this.type] };
	}
}

class Parser {
	private _index: number;
	private _table: Map<string, Nullable<Set<number>>>;
	private _tokens: Array<Token>;

	constructor(unprocessed: string) {
		// clean up
		unprocessed = unprocessed.trim();

		this._index = 0;
		this._table = new Map();
		this._tokens = new Array();

		let index = 0;

		const process = (symbol: Symbol) => {
			// update
			this._tokens.push(new Token(symbol));

			switch (symbol) {
				case Symbol.N_EQUAL: {
					index += 2;
					break;
				}
				default: {
					index += 1;
					break;
				}
			}
		}
		const exception = () => {
			throw Error(`Could not parse ${unprocessed.at(index)} at position ${index}`);
		}

		while (index < unprocessed.length) {
			switch (unprocessed.at(index)) {
				case "&": { process(Symbol.AND); continue; }
				case "+": { process(Symbol.PLUS); continue; }
				case "=": { process(Symbol.EQUAL); continue; }
				case "-": { process(Symbol.MINUS); continue; }
				case "(": { process(Symbol.L_PAREN); continue; }
				case ")": { process(Symbol.R_PAREN); continue; }
				case "!": {
					if (unprocessed.at(index + 1) === "=") {
						process(Symbol.N_EQUAL);
						continue;
					}
					// nani?
					return exception();
				}
				case space: { index++; continue; }
			}
			// cache
			const chunk = unprocessed.substring(index);

			let match: Nullable<RegExpExecArray>;

			// number
			if ((match = /^[\d]+/.exec(chunk)) !== null) {
				this._tokens.push(new Token(Symbol.N_LITERAL, Number(match[0])));
				index += match[0].length;
				continue;
			}
			// string
			if ((match = /^"([^"]*)"/.exec(chunk)) !== null) {
				this._tokens.push(new Token(Symbol.S_LITERAL, match[1]));
				index += match[0].length;
				continue;
			}
			// identifier
			if ((match = /^[\w]+/.exec(chunk)) !== null) {
				this._tokens.push(new Token(Symbol.IDENTIFIER, match[0]));
				index += match[0].length;
				continue;
			}
			// nani?
			return exception();
		}
		// close
		this._tokens.push(new Token(Symbol.EOF));

		for (const token of this._tokens) {
			print(token.toString());
		}
	}
	protected peek() {
		return this._tokens[this._index];
	}
	protected skip(value: number = 1) {
		// increase
		this._index += value;

		return this.peek();
	}
	public async parse() {
		// empty
		if (this._tokens.isEmpty()) return this.fallback();

		let index = 0;

		while (index < this._tokens.length) {
			switch (this._tokens[index].type) {
				case Symbol.IDENTIFIER: {
					// cache
					const [id, unknown, value] = this._tokens.slice(index, index + 1 + 1 + 1); const namespace = id.value + (unknown.is(Symbol.N_EQUAL) ? "!" : "=") + value.value;

					const script = built_in(unknown.is(Symbol.L_PAREN) ? Channel.FUNCTION : Channel.PROPERTY);

					if (script[id.value as never] && !this._table.has(namespace)) {
						// assign key
						this._table.set(namespace, null);

						(script[id.value as never]! as Function)((value.value as string).toString().replace(/_/g, space)).then(async (response: Array<number>) => {
							// um...
							if (unknown.is(Symbol.N_EQUAL)) {
								// cache
								const value = await this.fallback();

								for (const element of new Set(response).values()) {
									value.delete(element);
								}
								// assign value
								this._table.set(namespace, value);
							} else {
								// assign value
								this._table.set(namespace, new Set(response));
							}
						});
					}
					index += unknown.is(Symbol.L_PAREN) ? 4 : 3;
					continue;
				}
				default: {
					index += 1;
					continue;
				}
			}
		}
		// wait for cache
		await until(() => Array.from(this._table.values()).every((element) => element));

		try {
			// cache
			const value = this.E();

			return value.isEmpty() ? this.fallback() : value;
		} catch {
			return this.fallback();
		}
	}
	protected E() {
		let value = new Set<number>();

		value = this.T();

		while (true) {
			switch (this.peek().type) {
				case Symbol.AND:
				case Symbol.PLUS:
				case Symbol.MINUS: {
					break;
				}
				default: {
					return value;
				}
			}
			const token = this.peek();

			this.skip();

			const _value = this.T();

			switch (token.type) {
				case Symbol.AND: {
					for (const element of value.values()) {
						if (!_value.has(element)) value.delete(element);
					}
					break;
				}
				case Symbol.PLUS: {
					for (const element of _value.values()) {
						value.add(element);
					}
					break;
				}
				case Symbol.MINUS: {
					for (const element of _value.values()) {
						value.delete(element);
					}
					break;
				}
			}
		}
	}
	protected T() {
		let value = new Set<number>();

		switch (this.peek().type) {
			case Symbol.IDENTIFIER: {
				// compute
				value = this.I();
				break;
			}
			case Symbol.L_PAREN: {
				// raise
				this.skip();
				// compute
				value = this.E();
				break;
			}
		}
		// raise
		this.skip();

		return value;
	}
	protected I() {
		const [token, unknown] = [this.peek(), this.skip()];

		switch (unknown.type) {
			case Symbol.EQUAL:
			case Symbol.N_EQUAL:
			case Symbol.L_PAREN: {
				// raise
				this.skip();

				if (!this.peek().is(Symbol.N_LITERAL) && !this.peek().is(Symbol.S_LITERAL)) throw Error();

				const value = this._table.get(token.value + (unknown.is(Symbol.N_EQUAL) ? "!" : "=") + this.peek().value) as Set<number>;

				if (unknown.is(Symbol.L_PAREN) ? !this.skip().is(Symbol.R_PAREN) : false) throw Error();

				return value ?? new Set<number>();
			}
			default: {
				throw Error();
			}
		}
	}
	protected async fallback() {
		// cache
		if (!this._table.has("language=all")) this._table.set("language=all", new Set(await unknown_0(null, new Tag({ namespace: "index", value: "all" }))));

		return this._table.get("language=all") as Set<number>;
	}
}

function built_in(channel: Channel) {
	switch (channel) {
		case Channel.PROPERTY: {
			return {
				// id
				id: async (value: string) => {
					return [value];
				},
				// tag
				male: async (value: string) => {
					return unknown_0("tag", new Tag({ namespace: "male:" + value, value: "all" }));
				},
				female: async (value: string) => {
					return unknown_0("tag", new Tag({ namespace: "female:" + value, value: "all" }));
				},
				// etc
				type: async (value: string) => {
					return unknown_0("type", new Tag({ namespace: value, value: "all" }));
				},
				group: async (value: string) => {
					return unknown_0("group", new Tag({ namespace: value, value: "all" }));
				},
				series: async (value: string) => {
					return unknown_0("series", new Tag({ namespace: value, value: "all" }));
				},
				artist: async (value: string) => {
					return unknown_0("artist", new Tag({ namespace: value, value: "all" }));
				},
				popular: async (value: string) => {
					return unknown_0("popular", new Tag({ namespace: value, value: "all" }));
				},
				character: async (value: string) => {
					return unknown_0("character", new Tag({ namespace: value, value: "all" }));
				},
				// language
				language: async (value: string) => {
					return unknown_0(null, new Tag({ namespace: "index", value: value }));
				}
			};
		}
		case Channel.FUNCTION: {
			return {
				// title
				title: async (value: string) => {
					try {
						const bundle = await suggest.unknown_3("galleries", 0);
						const digits = await suggest.unknown_5("galleries", suggest.unknown_1(value), bundle);
						return unknown_1(digits);
					} catch {
						return [];
					}
				}
			};
		}
	}
}

async function unknown_0(directory: Nullable<string>, tag: Tag) {
	const response = await client.GET(`https://${["ltn.hitomi.la", "n", directory, `${tag.namespace}-${tag.value}`].filter((element) => element).join("/")}.nozomi`, "arraybuffer");

	switch (response.status.code) {
		case 200:
		case 206: {
			const binary = new DataView(response.body);

			return new Array(Math.floor(binary.byteLength / 4)).fill(null).map((_, index) => binary.getInt32(index * 4, Endian.BIG));
		}
	}
	return [];
}

async function unknown_1(digits: Pair<number, number>) {
	// check before request
	if (!(0 < digits.second && digits.second <= 10000000 * 10)) throw Error();

	const response = await suggest.unknown_4(`https://ltn.hitomi.la/galleriesindex/galleries.${await mirror(Directory.GALLERIES)}.data`, digits.first, digits.first + digits.second - 1);

	const table = new DataView(response.buffer);
	const length = table.getInt32(0, Endian.BIG);

	if (!(0 < length && length <= 10000000)) throw Error();
	if (response.byteLength !== length * 4 + 4) throw Error();

	return new Array(length).fill(null).map((_, index) => table.getInt32((index + 1) * 4, Endian.BIG));
}

class JavaScriptModule {
	/** @alias get_galleryids_from_nozomi */
	public unknown_0(...args: Parameters<typeof unknown_0>) { return unknown_0(...args); }
	/** @alias get_galleryids_from_data */
	public unknown_1(...args: Parameters<typeof unknown_1>) { return unknown_1(...args); }
}

export const module = new JavaScriptModule();

const search = {
	query: (unprocessed: string) => {
		return (new Parser(unprocessed)).parse();
	}
};

export default search;
