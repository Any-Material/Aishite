// modules
import request from "@/modules/request";
// modules/hitomi
import { Endian } from "@/modules/hitomi.la/suggest";
import { Prefix, Field, Tag } from "@/modules/hitomi.la/encode";
// states
import worker from "@/states/worker";
import bookmark from "@/states/bookmark";

export class Search {
	public async get(query: Array<{ prefix: Prefix, tag: Tag }>, page: GalleryPage = new GalleryPage({ index: 0, limit: 25 })) {
		const dummy = new GalleryList({
			list: [],
			length: 0,
			singular: this.singularity(query)
		});

		function compute(prefix: Prefix, array: Array<number>) {
			switch (prefix) {
				case Prefix.AND: {
					if (!dummy.list.length) {
						dummy.list = array;
						break;
					}
				}
				case Prefix.EXCLUDE: {
					const unique = new Set(array);
					dummy.list = dummy.list.filter((id) => (prefix === Prefix.AND) === unique.has(id));
					break;
				}
				case Prefix.INCLUDE: {
					dummy.list = [...dummy.list, ...array];
				}
			}
		}
		async function retrieve(tag: Tag) {
			switch (tag.field) {
				case Field.ID: {
					return [Number(tag.value)];
				}
				case Field.STATUS: {
					if (tag.value === "bookmark") {
						return Object.keys(bookmark.state).map((id) => Number(id));
					}
					return Object.values(worker.state).filter((task) => { return task.status === tag.value; }).map((task) => { return task.id; }) ?? [];
				}
				default: {
					const response = await request.GET(tag.url(), { type: "arraybuffer", options: { headers: dummy.singular ? { "range": `bytes=${page.index * page.limit * 4}-${page.index * page.limit * 4 + page.limit * 4 - 1}` } : {} } });
					const encode = Buffer.from(response.encode);

					switch (response.status.code) {
						/// OK (full-content)
						case 200:
						/// OK (partitial-content)
						case 206: {
							if (dummy.singular) {
								length = Number(response.headers["content-range"]!.replace(/^bytes\s[0-9]+-[0-9]+\//, "")) / 4;
							}
							const buffer: DataView = new DataView((encode.buffer as ArrayBuffer).skip(encode.byteOffset).take(encode.byteLength));
							const result: Array<number> = [];

							for (let index = 0; index < buffer.byteLength / 4; index++) {
								result.add(buffer.getInt32(index * 4, Endian.BIG));
							}
							return result;
						}
					}
					return [];
				}
			}
		}

		for (const { prefix, tag } of query) {
			compute(prefix, await retrieve(tag));
		}
		if (!dummy.list.length) {
			// update
			dummy.singular = true;
			// index-all
			compute(Prefix.INCLUDE, await retrieve(new Tag({ field: Field.LANGUAGE, value: "all" })));
		}
		return new GalleryList({ list: [...new Set(dummy.list)], length: dummy.singular ? length : dummy.list.length, singular: dummy.singular });
	}
	private singularity(query: Array<{ prefix: Prefix, tag: Tag }>) {
		let singular = 0;

		for (const { prefix, tag } of query) {
			if (prefix !== Prefix.EXCLUDE && tag.field === Field.LANGUAGE && tag.value === "all") {
				singular++;
			} else {
				return false;
			}
		}
		return singular === 1;
	}
}

export class GalleryList {
	public list: Array<number>;
	public length: number;
	public singular: boolean;

	constructor(args: {
		list: GalleryList["list"];
		length: GalleryList["length"];
		singular: GalleryList["singular"];
	}) {
		this.list = args.list;
		this.length = args.length;
		this.singular = args.singular;
	}
}

export class GalleryPage {
	public readonly index: number;
	public readonly limit: number;

	constructor(args: {
		index: GalleryPage["index"];
		limit: GalleryPage["limit"];
	
	}) {
		this.index = args.index;
		this.limit = args.limit;
	}
}

export default (
	//
	// singleton
	//
	new Search()
)
