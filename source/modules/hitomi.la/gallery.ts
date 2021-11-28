// modules
import request from "@/modules/request";
// modules/hitomi
import { Field, Tag } from "@/modules/hitomi.la/encode";

const selector = [
	{
		"key": "title",
		"query": ".lillie a"
	},
	{
		"key": "thumbnail",
		"query": "img",
		"attribute": "src"
	},
	{
		"key": "artist",
		"query": ".artist-list a"
	},
	{
		"key": "date",
		"query": ".date"
	}
];

export class Gallery {
	private common_js?: string;

	constructor() {
		request.GET("https://ltn.hitomi.la/common.js", { type: "text" }).then((response) => {
			this.common_js = response.encode.split(/\nfunction\s/g)
			.filter((section) => {
				return new RegExp(`^(${[
					"subdomain_from_galleryid",
					"subdomain_from_url",
					"url_from_url",
					"full_path_from_hash",
					"url_from_hash",
					"url_from_url_from_hash"].join("|")})`
				).test(section);
			}).map((section) => {
				return `function ${section}`;
			}).join(("\n"));
		});
	}
	public async block(id: number) {
		const response = await request.GET(`https://ltn.hitomi.la/galleryblock/${id}.html`, { type: "text" });

		switch (response.status.code) {
			case 404: {
				throw new Error("request failed");
			}
		}
		const block: Record<string, Array<string>> = {}, document = new DOMParser().parseFromString(response.encode, "text/html");

		let index = 0;

		for (const element of document.querySelectorAll("td")) {
			if (index % 2 === 0) {
				block[element.innerText.toLowerCase()] = [];
			} else {
				block[Object.keys(block).last!]!.add(...element.innerText.split(/\s\s+/).filter((array) => array.length));
			}
			index++;
		}
		for (const extractor of Object.values(selector)) {
			block[extractor.key] = Object.values(document.querySelectorAll(extractor.query)).map((element) => {
				return extractor.attribute ? element.getAttribute(extractor.attribute)! : (element as HTMLElement).innerText ?? "N/A"
			});

			switch (extractor.key) {
				case "thumbnail": {
					block[extractor.key] = block[extractor.key]!.map((url) => `https:${url}`);
					break;
				}
			}
		}
		return new GalleryBlock({
			id: id,
			type: block["type"].first!,
			title: block["title"].first!,
			group: block["group"]?.first,
			series: block["series"]?.first,
			language: block["language"].first!,
			thumbnail: block["thumbnail"] as [string, string],
			character: block["character"],
			artist: block["artist"],
			tags: block["tags"],
			date: block["date"].first!
		});
	}
	public async script(id: number) {
		const response = await request.GET(`https://ltn.hitomi.la/galleries/${id}.js`, { type: "text" });

		switch (response.status.code) {
			case 404: {
				throw new Error("request failed");
			}
		}
		const script = JSON.parse(/var\sgalleryinfo\s=\s(.+?)(?=;)/.match(`${response.encode};`)!.group(1)!);

		await until(() => Boolean(this.common_js));

		return new GalleryScript({
			id: script["id"],
			type: script["type"],
			title: script["title"],
			language: script["language"],
			files: Object.values(script["files"] as Array<Record<string, any>>).map((item) => {
				return new GalleryFile({
					//
					// danger zone
					//
					url: eval(this.common_js + "url_from_url_from_hash(id, item)"),
					//
					// danger zone
					//
					name: item["name"],
					width: item["width"],
					height: item["height"]
				});
			}),
			tags: Object.values(script["tags"] as Array<Record<string, any>>).map((item) => {
				return new Tag({
					field: item["male"] === 1 ? item["female"] === 1 ? Field.TAG : Field.MALE : Field.FEMALE,
					value: item["tag"]
				});
			}),
			date: script["date"]
		});
	}
}

export class GalleryFile {
	public readonly url: string;
	public readonly name: string;
	public readonly width: number;
	public readonly height: number;

	constructor(args: {
		url: GalleryFile["url"];
		name: GalleryFile["name"];
		width: GalleryFile["width"];
		height: GalleryFile["height"];
	}) {
		this.url = args.url;
		this.name = args.name;
		this.width = args.width;
		this.height = args.height;
	}
}

export class GalleryBlock {
	public readonly id: number;
	public readonly type: string;
	public readonly title: string;
	public readonly language: string;
	public readonly thumbnail: [string, string];
	public readonly character?: Array<string>;
	public readonly artist?: Array<string>;
	public readonly series?: string;
	public readonly group?: string;
	public readonly tags?: Array<string>;
	public readonly date: string;

	constructor(args: {
		id: GalleryBlock["id"];
		type: GalleryBlock["type"];
		title: GalleryBlock["title"];
		language: GalleryBlock["language"];
		thumbnail: GalleryBlock["thumbnail"];
		character?: GalleryBlock["character"];
		artist?: GalleryBlock["artist"];
		series?: GalleryBlock["series"];
		group?: GalleryBlock["group"];
		tags?: GalleryBlock["tags"];
		date: GalleryBlock["date"];
	}) {
		this.id = args.id;
		this.type = args.type;
		this.title = args.title;
		this.language = args.language;
		this.thumbnail = args.thumbnail;
		this.character = args.character;
		this.artist = args.artist;
		this.series = args.series;
		this.group = args.group;
		this.tags = args.tags;
		this.date = args.date;
	}
}

export class GalleryScript {
	public readonly id: string;
	public readonly type: string;
	public readonly title: string;
	public readonly language: string;
	public readonly files: Array<GalleryFile>;
	public readonly tags?: Array<Tag>;
	public readonly date: string;

	constructor(args: {
		id: GalleryScript["id"];
		type: GalleryScript["type"];
		title: GalleryScript["title"];
		language: GalleryScript["language"];
		files: GalleryScript["files"];
		tags?: GalleryScript["tags"];
		date: GalleryScript["date"];
	}) {
		this.id = args.id;
		this.type = args.type;
		this.title = args.title;
		this.language = args.language;
		this.files = args.files;
		this.tags = args.tags;
		this.date = args.date;
	}
}

export default (
	new Gallery()
)
