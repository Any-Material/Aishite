import ReactDOM from "react-dom/client";

import App from "@/app";

import client from "@/modules/node.js/request";
import filesystem from "@/modules/node.js/filesystem";

const element = document.getElementById("app");

if (!element) throw Error();

window.addEventListener("keydown", (event) => {
	switch (event.key) {
		case "F12": {
			chromium.development();
			break;
		}
	}
});

if (!process.env.NODE_ENV) {
	// https://github.com/Any-Material/{repo}/releases/download/{version}/{artifact}
	client.GET("https://api.github.com/repos/Any-Material/Aishite/releases?per_page=100", "json").then((response) => {
		// parse version string to number
		function version(value: string) {
			return Number((value.match(/-?\d+/g) ?? []).join(""));
		}
		// compare version
		if (version(response.body[0]["tag_name"]) > version(JSON.parse(filesystem.read("resources/app.asar/package.json"))["version"])) {
			// update available
			chromium.open_url(response.body[0]["html_url"]);
			// close app
			chromium.close("update");
		}
	});
}

ReactDOM.createRoot(element).render(<App></App>);
