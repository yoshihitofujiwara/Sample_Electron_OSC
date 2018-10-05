// const webpack = require("webpack");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

// 公開モードフラグ
const IS_PRODUCTION = (() => {
	let isProduction = false;
	if (process.argv[2]) {
		if (process.argv[2].indexOf("-pro") > -1 || process.argv[2].indexOf("-pkg") > -1) {
			isProduction = true;
		}
	}
	return isProduction;
})();

const MODE = IS_PRODUCTION ? "production" : "development";

// js file path
const JS = `${__dirname}/src/js/`;


/*--------------------------------------------------------------------------
  module
--------------------------------------------------------------------------*/
module.exports = {
	target: "electron-main",
	watch: true,
	mode: MODE,

	entry: {
		main: `${JS}/main/index.js`
	},

	output: {
		filename: "[name].js"
	},

	module: {
		rules: [
			{
				test: /\.js[x]?$/,
				use: [{
					loader: "babel-loader",
					options: {
						// exclude: /node_modules/,
						presets: [["env", {
							modules: false
						}]]
					}
				}],
				exclude: /node_modules/,
			}
		]
	},

	optimization: {
		minimizer: [
			new UglifyJSPlugin({
				uglifyOptions: {
					compress: {
						drop_console: IS_PRODUCTION
					}
				}
			})
		]
	}
};
