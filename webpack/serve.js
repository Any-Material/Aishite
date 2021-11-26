const webpack = require("webpack");
const { main, preload, renderer } = require("./webpack.config");

var reload = 0;

const compiler = {
	main: {
		state: false,
		instance: undefined
	},
	preload: {
		state: false,
		instance: undefined
	},
	renderer: {
		state: false,
		instance: undefined
	}
};

const boilerplate = {
	mode: "development",
	watch: true,
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("development")
			}
		})
	],
	devtool: "eval-cheap-module-source-map"
};

compiler["main"].instance = webpack({
	...main,
	...boilerplate,
	plugins: [
		...main.plugins,
		...boilerplate.plugins
	]
}, () => { });

compiler["preload"].instance = webpack({
	...preload,
	...boilerplate,
	plugins: [
		...preload.plugins,
		...boilerplate.plugins
	]
}, () => { });

compiler["renderer"].instance = webpack({
	...renderer,
	...boilerplate,
	plugins: [
		...renderer.plugins,
		...boilerplate.plugins
	]
}, () => { });

compiler["main"].instance.hooks.done.tap("done", () => {
	return build("main");
});

compiler["preload"].instance.hooks.done.tap("done", () => {
	return build("preload");
});

compiler["renderer"].instance.hooks.done.tap("done", () => {
	return build("renderer");
});

function build(section) {
	// update state
	compiler[section].state = true;
	// all-ready
	if (!reload && compiler["main"].state && compiler["preload"].state && compiler["renderer"].state) {
		const electron = require("child_process").spawn("npx.cmd", ["electron", "."], { args: ["--colors", "--debug=5858"], stdio: [process.stdin, process.stdout, "pipe"] });

		electron.on("close", () => {
			return process.exit();
		});
		reload++;
	}
}
