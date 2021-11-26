const node_fs = require("fs");
const webpack = require("webpack");
const package = require("../package");
const builder = require("electron-builder");
const { main, preload, renderer } = require("./webpack.config");

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
	devtool: "inline-nosources-cheap-module-source-map",
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("production")
			}
		})
	]
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
	// close compiler
	compiler[section].instance.close(() => {
		// all-ready
		if (compiler["main"].state && compiler["preload"].state && compiler["renderer"].state) {
			node_fs.writeFile("./build/package.json",
				JSON.stringify({
					name: package.name,
					main: package.main,
					version: package.version,
					description: package.description
				}), { }, () => {
					builder.build({
						targets: builder.Platform.WINDOWS.createTarget("portable"),
						config: {
							appId: "any.material.org.aishite",
							files: [
								"build/*.js",
								"build/*.json",
								"build/*.html",
							],
							directories: {
								output: "releases"
							},
							icon: "../source/assets/aishite.ico",
						}
					});
				}
			);
		}
	});
}
