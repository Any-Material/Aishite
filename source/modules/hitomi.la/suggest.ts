// depedencies
import { sha256 } from "js-sha256";
// modules
import request from "@/modules/request";

export namespace Endian {
	export const BIG = false;
	export const LITTLE = true;
}
export type Endian = (typeof Endian)[keyof typeof Endian];

DataView.prototype.getUint64 = function (offset: number, endian: boolean) {
	const bytes: Array<number> = [
		this.getUint32(offset, endian),
		this.getUint32(offset + 4, endian),
	];
	return endian ? bytes[0] + 2 ** 32 * bytes[1] : 2 ** 32 * bytes[0] + bytes[1];
}

export class Suggest {
	public serial: number;
	public versions: Versions;

	constructor() {
		this.serial = 0;
		this.versions = new Versions({
			/*
			tagindex: undefined,
			galleries: undefined,
			languages: undefined,
			nozomiurl: undefined
			*/
		});
		for (const key of ["tagindex"]) {
			request.GET(`https://ltn.hitomi.la/${key}/version?_=${Date.now()}`, { type: "text" }).then((response) => {
				this.versions[key as keyof Versions] = response.encode;
			});
		}
	}
	public update(query: string) {
		return this.unknown_0(query.replace(/_/g, "\u0020"));
	}
	public outdate() {
		this.serial++;
	}
	/**
	 * @memberof search.js
	 * @see get_suggestions_for_query
	*/
	private async unknown_0(query: string) {
		return new Promise<Array<Suggestion>>(async (resolve, reject) => {
			this.serial++;

			const UUID = this.serial;
			///
			/// 0: type
			/// 1: value
			///
			const fragment = /:/.test(query) ? query.split(/:/) : ["global", query];

			try {
				const bundle = await this.unknown_3(fragment[0], 0);
				if (UUID != this.serial) return resolve([]);
				const digits = await this.unknown_5(fragment[0], this.unknown_1(fragment[1]), bundle);
				if (UUID != this.serial) return resolve([]);
				const result = await this.unknown_6(fragment[0], digits);
				if (UUID != this.serial) return resolve([]);
				return resolve(result);
			} catch (error) {
				return resolve([]);
			}
		});
	}
	/**
	 * @memberof searchlib.js
	 * @see hash_term
	 */
	private unknown_1(value: string) {
		return new Uint8Array(sha256.array(value).slice(0, 4));
	}
	/**
	 * @memberof search.js
	 * @see decode_node
	*/
	private unknown_2(buffer: Uint8Array) {
		const bundle = new SuggestBundle({ child: [], buffer: [], digits: [] }), binary = new SuggestBinary({ level: 0, buffer: new DataView(buffer.buffer) });

		const _level = binary.buffer.getInt32(binary.level, Endian.BIG);
		binary.level += 4;
		// buffer
		for (let index = 0; index < _level; index++) {
			const _key = binary.buffer.getInt32(binary.level, Endian.BIG);

			if (_key === 0 || _key > 32) throw new RangeError(`[_key] should range between 0 to 32, but received ${_key}`);

			binary.level += 4;
			bundle.buffer.add(buffer.slice(binary.level, binary.level + _key));
			binary.level += _key;
		}
		const _value = binary.buffer.getInt32(binary.level, Endian.BIG);
		binary.level += 4;
		// digits
		for (let index = 0; index < _value; index++) {
			const _offset = binary.buffer.getUint64(binary.level, Endian.BIG);
			binary.level += 8;

			const _length = binary.buffer.getInt32(binary.level, Endian.BIG);
			binary.level += 4;

			bundle.digits.add([_offset, _length]);
		}
		// child
		for (let index = 0; index < 17; index++) {
			bundle.child.add(binary.buffer.getUint64(binary.level, Endian.BIG));
			binary.level += 8;
		}
		return bundle;
	}
	/**
	 * @memberof search.js
	 * @see get_node_at_adress
	*/
	private async unknown_3(type: string, value: number) {
		return new Promise<SuggestBundle>(async (resolve, reject) => {
			await until(() => this.versions["tagindex"] !== null);
			
			return resolve(this.unknown_2(await this.unknown_4(`https://ltn.hitomi.la/${type === "global" ? "tag" : type}index/${type}.${this.versions[(type === "global" ? "tagindex" : type) as keyof Versions]}.index`, value, value + 463)));
		});
	}
	/**
	 * @memberof search.js
	 * @see get_url_at_range
	*/
	private async unknown_4(url: string, offset: number, length: number) {
		return new Promise<Uint8Array>(async (resolve, reject) => {
			return resolve(new Uint8Array(Buffer.from((await request.GET(url, { type: "arraybuffer", options: { headers: { "range": `bytes=${offset}-${length}` } } })).encode, "binary")));
		});
	}
	/**
	 * @memberof search.js
	 * @see B_search
	*/
	private async unknown_5(type: string, buffer: Uint8Array, bundle: SuggestBundle) {
		return new Promise<[number, number]>(async (resolve, reject) => {
			function mystery_0(buffer_0: Uint8Array, buffer_1: Uint8Array): [boolean, boolean] {
				for (let index = 0; index < (buffer_0.byteLength < buffer_1.byteLength ? buffer_0.byteLength : buffer_1.byteLength); index++) {
					if (buffer_0[index] < buffer_1[index]) {
						return [true, false];
					} else if (buffer_0[index] > buffer_1[index]) {
						return [false, false];
					}
				}
				return [true, true];
			}
			function mystery_1(buffer: Uint8Array, bundle: SuggestBundle): [boolean, number] {
				const fragment: [boolean, boolean] = [true, false];

				for (let index = 0; index < bundle.buffer.length; index++) {
					for (const [key, value] of mystery_0(buffer, bundle.buffer[index]).entries()) {
						fragment[key] = value;
					}
					if (fragment[0]) {
						return [fragment[1], index];
					}
				}
				if (bundle.buffer.length) {
					return [fragment[1], bundle.buffer.length];
				}
				return [true, 0];
			}
			function mystery_2(bundle: SuggestBundle) {
				for (let index = 0; index < bundle.child.length; index++) {
					if (bundle.child[index]) {
						return false;
					}
				}
				return true;
			}
			if (!bundle.buffer.length) throw new RangeError("[buffer] should not be empty");

			const [exist, index] = mystery_1(buffer, bundle);

			if (exist) {
				return resolve(bundle.digits[index]);
			} else if (mystery_2(bundle)) {
				throw new Error();
			}
			if (!bundle.child[index]) {
				return reject();
			}
			const digits = await this.unknown_3(type, bundle.child[index]);
			
			this.unknown_5(type, buffer, digits).then((bundle) => {
				return resolve(bundle);
			});
		});
	}
	/**
	 * @memberof search.js
	 * @see get_suggestions_from_data
	*/
	private async unknown_6(type: string, digits: [number, number]) {
		return new Promise<Array<Suggestion>>(async (resolve, reject) => {
			const response: Array<Suggestion> = [];
			/// 0: offset
			/// 1: length
			if (digits[1] > 10000 || digits[1] <= 0) {
				return resolve([]);
			}
			const binary = new SuggestBinary({
				level: 0,
				buffer: new DataView((await this.unknown_4(`https://ltn.hitomi.la/tagindex/${type}.${this.versions.tagindex}.data`, digits[0], digits[0] + digits[1] - 1)).buffer)
			});
			const _suggest = binary.buffer.getInt32(binary.level, Endian.BIG);
			binary.level += 4;
	
			if (_suggest > 100 || _suggest <= 0) {
				return [];
			}
			for (let index = 0; index < _suggest; index++) {
				response.add(new Suggestion({ field: "", value: "", count: 0 }));
	
				const _field = binary.buffer.getInt32(binary.level, Endian.BIG);
				binary.level += 4;
	
				for (let _index = 0; _index < _field; _index++) {
					response[response.length - 1].field += String.fromCharCode(binary.buffer.getUint8(binary.level));
					binary.level += 1;
				}
				const _value = binary.buffer.getInt32(binary.level, Endian.BIG);
				binary.level += 4;
	
				for (let _index = 0; _index < _value; _index++) {
					response[response.length - 1].value += String.fromCharCode(binary.buffer.getUint8(binary.level) === 32 ? 95 : binary.buffer.getUint8(binary.level));
					binary.level += 1;
				}
				response[response.length - 1].count = binary.buffer.getInt32(binary.level, Endian.BIG);
				binary.level += 4;
			}
			return resolve(response);
		});
	}
}

export class Versions {
	public tagindex?: string;
	public galleries?: string;
	public languages?: string;
	public nozomiurl?: string;

	constructor(args: {
		tagindex?: Versions["tagindex"];
		galleries?: Versions["galleries"];
		languages?: Versions["languages"];
		nozomiurl?: Versions["nozomiurl"];
	}) {
		this.tagindex = args.tagindex;
		this.galleries = args.galleries;
		this.languages = args.languages;
		this.nozomiurl = args.nozomiurl;
	}
}

export class SuggestBinary {
	public level: number;
	public readonly buffer: DataView;

	constructor(args: {
		level: SuggestBinary["level"];
		buffer: SuggestBinary["buffer"];
	}) {
		this.level = args.level;
		this.buffer = args.buffer;
	}
}

export class SuggestBundle {
	public readonly child: Array<number>;
	public readonly buffer: Array<Uint8Array>;
	public readonly digits: Array<[number, number]>;

	constructor(args: {
		child: SuggestBundle["child"];
		buffer: SuggestBundle["buffer"];
		digits: SuggestBundle["digits"];
	}) {
		this.child = args.child;
		this.buffer = args.buffer;
		this.digits = args.digits;
	}
}

export class Suggestion {
	public field: string;
	public value: string;
	public count: number;

	constructor(args: {
		field: Suggestion["field"];
		value: Suggestion["value"];
		count: Suggestion["count"];
	}) {
		this.field = args.field;
		this.value = args.value;
		this.count = args.count;
	}
}

export default (
	//
	// singleton
	//
	new Suggest()
)
