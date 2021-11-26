// modules
import request from "@/modules/request";
// modules/hitomi.la
import { Endian } from "@/modules/hitomi.la/suggest";
import { suggestJS } from "@/modules/hitomi.la/suggest";
import { GalleryVersion } from "@/modules/hitomi.la/version";

class Instruction {
	public readonly type: boolean;
	public readonly value: Array<number>;

	constructor(args: Args<Instruction>) {
		this.type = args.type;
		this.value = args.value;
	}
}
/**
 * @alias result.js
 * @see do_search
*/
export async function SearchQuery(query: string) {
	return new Promise<Array<number>>(async (resolve, reject) => {
		// result
		let sigma: Array<number> = [];
		// tokens
		const token: Array<Instruction> = [];
		// keywords
		const keyword: Array<string> = query.toLowerCase().trim().split(/\s+/);

		for (let index = 0; index < keyword.length; index++) {
			// save instruction
			unknown_1(keyword[index].replace(/^-/, "")).then(async (response) => {
				//
				// true: positive
				// false: negative
				//
				token[index] = new Instruction({ type: !/^-/.test(keyword[index]), value: response });

				if (Object.keys(token).length === keyword.length) {
					for (const segment of token) {
						// initial
						if (sigma.empty && segment.type) {
							sigma = segment.value;
							continue;
						}
						// for optimization
						const range = new Set(segment.value);
						// include or exclude
						sigma = sigma.filter((id) => range.has(id) === segment.type);
					}
					// fallback
					if (sigma.empty) {
						// language:all
						return resolve(await unknown_0(null, "index", "all"));
					}
					return resolve(sigma);
				}
			});
		}
	});
}
/**
 * @alias search.js
 * @see get_galleryids_from_nozomi
*/
async function unknown_0(region: Nullable<string>, type: string, value: string) {
	return new Promise<Array<number>>((resolve, reject) => {
		request.GET(`https://${["ltn.hitomi.la", "n", region, `${type}-${value}`].filter((_) => _).join("/")}.nozomi`, { type: "arraybuffer" }).then((response) => {
			switch (response.status.code) {
				case 200: {
					const array: Buffer = Buffer.from(response.encode);
					const table: DataView = new DataView((array.buffer as ArrayBuffer).skip(array.byteOffset).take(array.byteLength));

					return resolve(new Array(table.byteLength / 4).fill(null).map((_, x) => table.getInt32(x * 4, Endian.BIG)));
				}
			}
			return resolve([]);
		});
	});
}
/**
 * @alias search.js
 * @see get_galleryids_for_query
*/
async function unknown_1(query: string) {
	return new Promise<Array<number>>(async (resolve, reject) => {
		if (/:/.test(query)) {
			//
			// 0: key
			// 0: value
			//
			const fragment = query.replace(/_/g, "\u0020").split(/:/) as [string, string];

			switch (fragment[0]) {
				case "id": {
					return resolve([Number(fragment[1])]);
				}
				case "male":
				case "female": {
					return resolve(unknown_0("tag", fragment.join(":"), "all"));
				}
				case "language": {
					return resolve(unknown_0(null, "index", fragment[1]));
				}
				default: {
					return resolve(unknown_0(fragment[0], fragment[1], "all"));
				}
			}
		}
		const bundle = await suggestJS.get_node_at_adress("galleries", 0);
		if (bundle === null) return resolve([]);
		const digits = await suggestJS.B_search("galleries", suggestJS.hash_term(query.replace(/_/g, "\u0020")), bundle);
		if (digits === null) return resolve([]);

		return resolve(await unknown_2(digits));
	});
}
/**
 * @alias search.js
 * @see get_galleryids_from_data
*/
async function unknown_2(digits: [number, number]) {
	return new Promise<Array<number>>(async (resolve, reject) => {
		//
		// 0: offset
		// 1: length
		//
		if (digits[1] > 100000000 || digits[1] <= 0) {
			return resolve([]);
		}
		await until(() => GalleryVersion.galleriesindex !== null);

		suggestJS.get_url_at_range(`https://ltn.hitomi.la/galleriesindex/galleries.${GalleryVersion.galleriesindex}.data`, digits[0], digits[0] + digits[1] - 1).then((response) => {
			const table = new DataView(response.buffer);
			const length = table.getInt32(0, Endian.BIG);

			if (length > 10000000 || 10000000 <= 0) {
				return resolve([]);
			} else if (response.byteLength !== length * 4 + 4) {
				return resolve([]);
			}
			return resolve(new Array(length).fill(null).map((_, x) => table.getInt32((x + 1) * 4, Endian.BIG)));
		});
	});
}

export const searchJS = {
	get_galleryids_from_nozomi: unknown_0,
	get_galleryids_from_query: unknown_1,
	get_galleryids_from_data: unknown_2
};
