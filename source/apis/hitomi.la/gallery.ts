import client from "@/modules/node.js/request";

import { Tag } from "@/models/tag";
import { Gallery, GalleryFile } from "@/models/gallery";

let gg_js: Nullable<string> = null;
let common_js: Nullable<string> = null;

client.GET("https://ltn.hitomi.la/gg.js", "text").then((response) => {
	// update
	gg_js = "var\u0020gg;" + response.body.split("\n").filter((section) => !/if\s\([\D\d]+\)\s{\sreturn\s[\d]+;\s}/.test(section)).join("\n");

	if (/eval|require/g.test(gg_js)) throw Error();
});

client.GET("https://ltn.hitomi.la/common.js", "text").then((response) => {
	// update
	common_js = response.body.split("\nfunction\u0020").filter((section) => /^(subdomain_from_url|url_from_url|full_path_from_hash|real_full_path_from_hash|url_from_hash|url_from_url_from_hash|rewrite_tn_paths)/.test(section)).map((section) => "function" + space + section).join("");

	if (/eval|require/g.test(common_js)) throw Error();
});

class _Gallery extends Gallery {
	public readonly characters: Array<string>;

	constructor(args: Args<_Gallery>) {
		super(args);

		this.characters = args.characters;
	}
	public getURL() {
		return `https://hitomi.la/galleries/${this.id}.html`;
	}
	public async getFiles(): Promise<Array<_GalleryFile>> {
		// cache
		const response = await client.GET(`https://ltn.hitomi.la/galleries/${this.id}.js`, "text");

		const metadata = JSON.parse(response.body.replace(/^var\sgalleryinfo\s=\s/, ""));

		const cache = Array<_GalleryFile>();

		await until(() => !!gg_js && !!common_js);

		for (const file of metadata["files"]) {
			cache.add(new _GalleryFile({
				url: eval(gg_js! + common_js! + "url_from_url_from_hash(this.id, file, \"webp\", undefined, \"a\")"),
				name: file["name"],
				width: file["width"],
				height: file["height"]
			}));
		}
		return cache;
	}
}

class _GalleryFile extends GalleryFile {
	public readonly name: string;
	public readonly width: number;
	public readonly height: number;

	constructor(args: Args<_GalleryFile>) {
		super(args);

		this.name = args.name;
		this.width = args.width;
		this.height = args.height;
	}
}

async function block(id: number) {
	// cache
	const response = await client.GET(`https://ltn.hitomi.la/galleryblock/${id}.html`, "text");

	await until(() => !!gg_js && !!common_js);

	let key = "N/A";
	let index = 0;

	const element = new DOMParser().parseFromString(eval(gg_js! + common_js! + "rewrite_tn_paths(response.body)").replace(/\s\s+/g, "").replace(/\n/g, ""), "text/html");

	const metadata = new Map<string, unknown>(Object.entries({ title: element.querySelector(".lillie a")?.textContent, date: element.querySelector(".date")?.textContent }));
	
	for (const children of element.querySelectorAll("td")) {
		switch (index % 2) {
			case 0: {
				// cache
				key = children.textContent?.toLowerCase()!;
				// assign key
				metadata.set(key, "N/A");
				break;
			}
			default: {
				if (key === "tags") {
					// cache
					const value = Array<unknown>();

					for (const node of children.querySelectorAll("a")) {
						// cache
						const text = node.textContent!;

						value.add(new Tag({ namespace: text.includes("♂") ? "male" : text.includes("♀") ? "female" : "tag", value: text.replace(/[♂♀]/, "").replace(/\s$/, "").replace(/\s/g, "_") }));
					}
					// assign value
					metadata.set(key, value);
				} else {
					// assign value
					metadata.set(key, children.textContent);
				}
				break;
			}
		}
		index++;
	}
	// cache
	const artists = Array<string>();

	for (const children of element.querySelectorAll(".artist-list a")) {
		// assign value
		artists.add(children.textContent ?? "N/A");
	}
	// update
	metadata.set("artists", artists);
	
	// cache
	const image = Array<string>();

	index = 0;

	for (const children of element.querySelectorAll("picture > *")) {
		switch (index % 2) {
			case 0: {
				for (const source of children.getAttribute("data-srcset")!.split(space)) {
					if (source.includes("//")) image.add("https:" + source);
				}
				break;
			}
			default: {
				image.add("https:" + children.getAttribute("data-src"));
				break;
			}
		}
		index++;
	}
	// update
	metadata.set("thumbnail", image);

	return new _Gallery({
		id: id,
		type: metadata.get("type"),
		title: metadata.get("title"),
		group: metadata.get("group"),
		parody: metadata.get("series"),
		artists: metadata.get("artists"),
		language: metadata.get("language"),
		thumbnail: metadata.get("thumbnail"),
		characters: metadata.get("characters"),
		tags: metadata.get("tags"),
		date: metadata.get("date")
	} as Args<_Gallery>);
}

const gallery = {
	get: block
}

export default gallery;
