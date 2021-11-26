// depedencies
import { sha256 } from "js-sha256";
// modules
import request from "@/modules/request";
// modules/hitomi.la
import { GalleryVersion } from "@/modules/hitomi.la/version";

let serial: number = 0;

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

class SuggestBinary {
	public level: number;
	public readonly buffer: DataView;

	constructor(args: Args<SuggestBinary>) {
		this.level = args.level;
		this.buffer = args.buffer;
	}
}

class SuggestBundle {
	public readonly child: Array<number>;
	public readonly buffer: Array<Uint8Array>;
	public readonly digits: Array<[number, number]>;

	constructor(args: Args<SuggestBundle>) {
		this.child = args.child;
		this.buffer = args.buffer;
		this.digits = args.digits;
	}
}

class Suggestion {
	public field: string;
	public value: string;
	public count: number;

	constructor(args: Args<Suggestion>) {
		this.field = args.field;
		this.value = args.value;
		this.count = args.count;
	}
}

export function Suggest(query: string) {
	return unknown_0(query.replace(/_/g, "\u0020"));
}
/**
 * @alias search.js
 * @see get_suggestions_for_query
 */
async function unknown_0(query: string) {
	return new Promise<Array<Suggestion>>(async (resolve, reject) => {
		serial++;

		const UUID = serial;
		//
		// 0: type
		// 1: value
		//
		const fragment = /:/.test(query) ? query.split(/:/) : ["global", query];

		try {
			const bundle = await unknown_3(fragment[0] as never, 0);
			if (UUID !== serial) return resolve([]);
			const digits = await unknown_5(fragment[0], unknown_1(fragment[1]), bundle);
			if (UUID !== serial) return resolve([]);
			if (digits === null) return resolve([]);
			const result = await unknown_6(fragment[0], digits);
			if (UUID !== serial) return resolve([]);
			return resolve(result);
		} catch (error) {
			return resolve([]);
		}
	});
}
/**
 * @alias searchlib.js
 * @see hash_term
 */
function unknown_1(value: string) {
	return new Uint8Array(sha256.array(value).slice(0, 4));
}
/**
 * @alias search.js
 * @see decode_node
 */
function unknown_2(buffer: Uint8Array) {
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
 * @alias search.js
 * @see get_node_at_adress
*/
async function unknown_3(type: "global" | "galleries" | "languages" | "nozomiurl", value: number) {
	return new Promise<SuggestBundle>(async (resolve, reject) => {
		await until(() => GalleryVersion[type === "global" ? "tagindex" : (type + "index") as GalleryVersion] !== null);

		return resolve(unknown_2(await unknown_4(`https://ltn.hitomi.la/${type === "global" ? "tag" : type}index/${type}.${GalleryVersion[type === "global" ? "tagindex" : (type + "index") as GalleryVersion]}.index`, value, value + 463)));
	});
}
/**
 * @alias search.js
 * @see get_url_at_range
*/
async function unknown_4(url: string, offset: number, length: number) {
	return new Promise<Uint8Array>(async (resolve, reject) => {
		return resolve(new Uint8Array(Buffer.from((await request.GET(url, { type: "arraybuffer", options: { headers: { "range": `bytes=${offset}-${length}` } } })).encode, "binary")));
	});
}
/**
 * @alias search.js
 * @see B_search
*/
async function unknown_5(type: string, buffer: Uint8Array, bundle: SuggestBundle) {
	return new Promise<Nullable<[number, number]>>(async (resolve, reject) => {
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
			if (!bundle.buffer.empty) {
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
		if (bundle.buffer.empty) return resolve(null);

		const [exist, index] = mystery_1(buffer, bundle);

		if (exist) {
			return resolve(bundle.digits[index]);
		} else if (mystery_2(bundle)) {
			return resolve(null);
		} if (!bundle.child[index]) {
			return resolve(null);
		}
		const digits = await unknown_3(type as never, bundle.child[index]);

		unknown_5(type, buffer, digits).then((bundle) => {
			return resolve(bundle);
		});
	});
}
/**
 * @alias search.js
 * @see get_suggestions_from_data
*/
async function unknown_6(type: string, digits: [number, number]) {
	return new Promise<Array<Suggestion>>(async (resolve, reject) => {
		const response: Array<Suggestion> = [];
		//
		// 0: offset
		// 1: length
		//
		if (digits[1] > 10000 || digits[1] <= 0) {
			return resolve([]);
		}
		await until(() => GalleryVersion.tagindex !== null);

		const binary = new SuggestBinary({
			level: 0,
			buffer: new DataView((await unknown_4(`https://ltn.hitomi.la/tagindex/${type}.${GalleryVersion.tagindex}.data`, digits[0], digits[0] + digits[1] - 1)).buffer)
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

export const suggestJS = {
	get_suggestions_for_query: unknown_0,
	hash_term: unknown_1,
	decode_node: unknown_2,
	get_node_at_adress: unknown_3,
	get_url_at_range: unknown_4,
	B_search: unknown_5,
	get_suggestions_from_data: unknown_6
};
