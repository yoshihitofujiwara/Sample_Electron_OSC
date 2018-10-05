/*--------------------------------------------------------------------------
	settings
--------------------------------------------------------------------------*/
const PATH = {
	src: "src/", // 開発コード
	htdocs: "htdocs/", // テスト表示
	package: "package/" // アプリ書き出し
};

// 公開モードフラグ
const IS_PRODUCTION = (() => {
	let isProduction = false;
	if (process.argv[2]){
		if (process.argv[2].indexOf("-pro") > -1 || process.argv[2].indexOf("-pkg") > -1){
			isProduction = true;
		}
	}
	return isProduction;
})();

const MODE = IS_PRODUCTION ? "production" : "development";
console.log(`mode: ${MODE}`);


/*--------------------------------------------------------------------------
	load modules
--------------------------------------------------------------------------*/
const $ = {
	gulp: require("gulp"),
	plugins: require("gulp-load-plugins")(),
	webpack: require("webpack"),
	webpackStream: require("webpack-stream"),
	webpackConfigMain: require("./webpack.config.main"),
	webpackConfigRenderer: require("./webpack.config.renderer"),
	electron: require("electron-connect").server.create({ path: PATH.htdocs }),
	electronPkg: require("electron-packager")
};


/*--------------------------------------------------------------------------
	default
--------------------------------------------------------------------------*/
$.gulp.task("default", ["watch"]);


/*--------------------------------------------------------------------------
	watch
--------------------------------------------------------------------------*/
$.gulp.task("watch", () => {
	$.gulp.watch([PATH.src + "css/**/*.scss"], ["sass"]);
	$.gulp.watch([PATH.src + "js/libs/**/*.js"], ["libs-js"]);
	$.gulp.watch([PATH.src + "js/renderer/**/*.js"], ["renderer-js"]);
	$.gulp.watch([PATH.src + "js/main/**/*.js"], ["main-js"]);

	$.gulp
		.watch([
			PATH.htdocs + "**/*.html",
			PATH.htdocs + "assets/js/**/*.js",
			PATH.htdocs + "assets/css/**/*.css"
		])
		.on("change", () => {
			console.log("reload");
			$.electron.reload();
		});

	$.gulp
		.watch([
			PATH.htdocs + "main.js"
		])
		.on("change", () => {
			console.log("restart");
			// $.electron.stop();
			$.electron.restart(`-${MODE}`);
		});

	// Electron起動
	$.electron.start(`-${MODE}`);
});


/*--------------------------------------------------------------------------
	sass
--------------------------------------------------------------------------*/
$.gulp.task("sass", () => {
	$.plugins
		.rubySass(PATH.src + "css/**/*.scss", {
			style: IS_PRODUCTION ? "compressed" : "expanded"
		})
		.pipe($.plugins.plumber())
		.pipe($.plugins.cssnano())
		.pipe($.gulp.dest(PATH.htdocs + "assets/css/"));
});


/*--------------------------------------------------------------------------
	js
--------------------------------------------------------------------------*/
// $.gulp.task("libs-js", () => {
// 	$.gulp
// 		.src([
// 			PATH.src + "js/libs/core/*.js",
// 			PATH.src + "js/libs/plugins/*.js"
// 		])
// 		.pipe($.plugins.plumber())
// 		.pipe($.plugins.concat("libs.js"))
// 		.pipe($.gulp.dest(PATH.htdocs + "assets/js/"));
// });

$.gulp.task("renderer-js", () => {
	$.gulp
		.src([PATH.src + "js/renderer/**/*.js"])
		.pipe($.plugins.plumber())
		.pipe($.webpackStream($.webpackConfigRenderer, $.webpack))
		.pipe($.gulp.dest(PATH.htdocs + "assets/js/"));
});

$.gulp.task("main-js", () => {
	$.gulp
		.src([PATH.src + "js/main/**/*.js"])
		.pipe($.plugins.plumber())
		.pipe($.webpackStream($.webpackConfigMain, $.webpack))
		.pipe($.gulp.dest(PATH.htdocs));
});


/*--------------------------------------------------------------------------
	$ gulp package
--------------------------------------------------------------------------*/
// for win
$.gulp.task("win-pkg", () => {
	$.electronPkg({
		dir: PATH.htdocs, // アプリケーションのパッケージとなるディレクトリ
		out: PATH.package, // .exeの出力先ディレクトリ
		platform: "win32", // OS種別. darwin or win32 or linux
		arch: "x64", // CPU種別. x64 or ia32
		overwrite: true,
	}, (err) => {
		console.log(err);
	});
});

// for mac
$.gulp.task("mac-pkg", () => {
	$.electronPkg({
		dir: PATH.htdocs,
		out: PATH.package,
		arch: "x64",
		platform: "darwin",
		overwrite: true
	}, (err) => {
		console.log(err);
	});
});
