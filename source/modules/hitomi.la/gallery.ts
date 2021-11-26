// modules
import request from "@/modules/request";

export enum Category {
	ID = "id",
	TYPE = "type",
	CHARACTER = "character",
	LANGUAGE = "language",
	SERIES = "series",
	ARTIST = "artist",
	GROUP = "group",
	TAG = "tag",
	MALE = "male",
	FEMALE = "female",
	STATUS = "status"
}

export class GalleryTag {
	public readonly type: Category;
	public readonly value: string;

	constructor(args: Args<GalleryTag>) {
		this.type = args.type;
		this.value = args.value;
	}
	public url() {
		switch (this.type) {
			case Category.LANGUAGE: {
				return `https://ltn.hitomi.la/index-${this.value}.nozomi`;
			}
			case Category.MALE:
			case Category.FEMALE: {
				return `https://ltn.hitomi.la/tag/${this.type}:${this.value.replace(/_/g, "%20")}-all.nozomi`;
			}
			default: {
				return `https://ltn.hitomi.la/${this.type}/${this.value.replace(/_/g, "%20")}-all.nozomi`;
			}
		}
	}
	public toString() {
		return `${this.type}:${this.value}`;
	}
}

export class GalleryFile {
	public readonly url: string;
	public readonly name: string;
	public readonly width: number;
	public readonly height: number;

	constructor(args: Args<GalleryFile>) {
		this.url = args.url;
		this.name = args.name;
		this.width = args.width;
		this.height = args.height;
	}
}

export type GalleryBlock = {
	readonly id: number;
	readonly type: string;
	readonly title: string;
	readonly language: string;
	readonly thumbnail: [string, string];
	readonly character?: Array<string>;
	readonly artist?: Array<string>;
	readonly series?: string;
	readonly group?: string;
	readonly tags?: Array<GalleryTag>;
	readonly date: string;
}

export type GalleryScript = {
	readonly id: string;
	readonly type: string;
	readonly title: string;
	readonly language: string;
	readonly files: Array<GalleryFile>;
	readonly tags?: Array<GalleryTag>;
	readonly date: string;
}

let common_js: Nullable<string> = null;

request.GET("https://ltn.hitomi.la/common.js", { type: "text" }).then((response) => {
	common_js = response.encode.split(/\nfunction\s/g).filter((section) => /^(subdomain_from_galleryid|subdomain_from_url|url_from_url|full_path_from_hash|url_from_hash|url_from_url_from_hash)/.test(section)).map((section) => ["function", section].join("\u0020")).join(("\n"));
});

export async function GalleryBlock(id: number): Promise<GalleryBlock> {
	const response = await request.GET(`https://ltn.hitomi.la/galleryblock/${id}.html`, { type: "text" });

	switch (response.status.code) {
		case 404: {
			throw new Error();
		}
	}
	const block: Record<string, Array<string>> = {}, document = new DOMParser().parseFromString(response.encode, "text/html");

	let index = 0;

	for (const element of document.querySelectorAll("td")) {
		if (index % 2 === 0) {
			block[element.innerText.toLowerCase()] = [];
		} else {
			block[Object.keys(block).last!]!.add(...element.innerText.split(/\s\s+/).filter((fragment) => fragment.length));
		}
		index++;
	}

	for (const extractor of Object.values([
		{
			"name": "title",
			"query": "h1"
		},
		{
			"name": "thumbnail",
			"query": "img",
			"attribute": "src"
		},
		{
			"name": "artist",
			"query": ".artist-list"
		},
		{
			"name": "date",
			"query": ".date"
		}
	])) {
		block[extractor.name] = Object.values(document.querySelectorAll(extractor.query)).map((element) => {
			return extractor.attribute ? element.getAttribute(extractor.attribute) ?? "N/A" : (element as HTMLElement).innerText ?? "N/A"
		});

		switch (extractor.name) {
			case "artist": {
				block[extractor.name] = block[extractor.name].map((artist) => artist.replace(/\s\s+/g, "").replace(/\n/g, ""));
				break;
			}
			case "thumbnail": {
				block[extractor.name] = block[extractor.name].map((thumbnail) => `https:${thumbnail}`);
				break;
			}
		}
	}

	return {
		id: id,
		type: block["type"].first as string,
		title: block["title"].first as string,
		group: block["group"]?.first,
		series: block["series"]?.first,
		language: block["language"].first as string,
		thumbnail: block["thumbnail"] as [string, string],
		character: block["character"],
		artist: block["artist"],
		tags: block["tags"].map((tag) => {
			return new GalleryTag({ type: /(♂)$/.test(tag) ? Category.MALE : /(♀)$/.test(tag) ? Category.FEMALE : Category.TAG, value: tag.replace(/\s?(♂|♀)/, "").replace(/\s/g, "_") });
		}),
		date: block["date"].first as string
	};
}

export async function GalleryScript(id: number): Promise<GalleryScript> {
	const response = await request.GET(`https://ltn.hitomi.la/galleries/${id}.js`, { type: "text" });

	switch (response.status.code) {
		case 404: {
			throw new Error();
		}
	}
	const script = JSON.parse(/^var\sgalleryinfo\s=\s(.+?)(?=;)/.match(`${response.encode};`)!.group(1)!);

	await until(() => common_js !== null);

	return {
		id: script["id"],
		type: script["type"],
		title: script["title"],
		language: script["language"],
		files: Object.values(script["files"] as Array<any>).map((file) => {
			return new GalleryFile({
				//
				// DANGER ZONE!
				//
				url: eval(common_js + "url_from_url_from_hash(id, file)"),
				//
				// DANGER ZONE!
				//
				name: file["name"],
				width: file["width"],
				height: file["height"]
			});
		}),
		tags: Object.values(script["tags"] as Array<any>).map((tag) => {
			return new GalleryTag({
				type: tag["male"] ? tag["female"] ? Category.TAG : Category.MALE : Category.FEMALE,
				value: tag["tag"]
			});
		}),
		date: script["date"]
	};
}
