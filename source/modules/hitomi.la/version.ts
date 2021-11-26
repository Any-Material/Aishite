// modules
import request from "@/modules/request";

export type GalleryVersion = "tagindex" | "galleriesindex" | "languagesindex" | "nozomiurlindex";

export const GalleryVersion: {
	tagindex: Nullable<string>;
	galleriesindex: Nullable<string>;
	languagesindex: Nullable<string>;
	nozomiurlindex: Nullable<string>;
} = {
	tagindex: null,
	galleriesindex: null,
	languagesindex: null,
	nozomiurlindex: null
};

for (const directory of ["tagindex", "galleriesindex", "languagesindex", "nozomiurlindex"]) {
	request.GET(`https://ltn.hitomi.la/${directory}/version?_=${Date.now()}`, { type: "text" }).then((response) => {
		GalleryVersion[directory as GalleryVersion] = response.encode;
	});
}
