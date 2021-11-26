const path = require("path");

function resolve_path() {
	return path.resolve(__dirname, "..", ...arguments);
}

const boilerplate = {
	module: {
		rules: [
			{
				test: [/\.tsx?$/],
				use: [{ loader: "ts-loader" }]
			}
		]
	},
	output: {
		path: resolve_path("build")
	},
	resolve: {
		alias: {
			"@": resolve_path("source")
		},
		extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
	},
	optimization: {
		minimizer: [
			new (require("terser-webpack-plugin"))({
				terserOptions: {
					output: {
						ecma: 2020,
						comments: false
					},
					compress: {
						ecma: 2020,
						unsafe: true,
						drop_console: true
					}
				},
				parallel: true
			})
		],
		minimize: true
	},
	plugins: []
};

const main = {
	...boilerplate,
	target: "electron-main",
	entry: resolve_path("electron", "main.ts"),
	output: {
		...boilerplate.output,
		filename: "main.js"
	}
};

const preload = {
	...boilerplate,
	target: "electron-preload",
	entry: resolve_path("electron", "preload.ts"),
	output: {
		...boilerplate.output,
		filename: "preload.js"
	}
};

const renderer = {
	...boilerplate,
	target: "electron-renderer",
	entry: resolve_path("electron", "renderer.tsx"),
	output: {
		...boilerplate.output,
		filename: "renderer.js"
	},
	plugins: [
		new (require("html-webpack-plugin"))({
			filename: "index.html",
			template: resolve_path("electron", "index.html")
		})
	]
};

module.exports = {
	main: main,
	preload: preload,
	renderer: renderer
};
