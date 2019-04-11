// 加载gulp
var gulp = require('gulp');

//加载gulp-load-plugins插件，并马上运行它
var plugins = require('gulp-load-plugins')();

var rename = require('gulp-rename');

const argv = require('yargs').argv;

const package = require("./package.json");

const SRC_DIR = package["path for develop"];
const DIST_DIR = package["path for product"];

const rm = require("rimraf");

gulp.task(':pug', async function () {
    await gulp.src(`${SRC_DIR}**/*.pug`) // 传入管道的文件
        .pipe(plugins.plumber())
        .pipe(plugins.pug({
            pretty: true // 默认为false，表示是否美化HTML
        }))
        .pipe(rename(function(path){
            path.extname=".html"
        }))
        .pipe(gulp.dest(SRC_DIR))
    ; // dest:destination
});

var less = require('gulp-less');
gulp.task(":less", async function(){
    await gulp.src(`${SRC_DIR}**/*.less`)
        .pipe(less({

        }))
        .pipe(gulp.dest(SRC_DIR))
    ;
});


gulp.task("watch-less-pug", async function () {
    gulp.watch(`${SRC_DIR}**/*.pug`, gulp.series(":pug"));
    gulp.watch(`${SRC_DIR}**/*.less`, gulp.series(":less"));
});


gulp.task(":copy", async function () {
    gulp.src([
        `${SRC_DIR}**/!(*.less|*.pug)`,
    ])
        .pipe(gulp.dest(`${DIST_DIR}`))
    ;
});

gulp.task(":live-server", async function(){
    const liveServer = require("live-server");
    liveServer.start({
        port: argv.port || 6524, // Set the server port. Defaults to 8080.
        host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
        root: SRC_DIR, // Set root directory that's being served. Defaults to cwd.
        open: true, // When false, it won't load your browser by default.
        ignore: '**/*.@(less|pug)', // comma-separated string for paths to ignore
        wait: 300, // Waits for all changes, before reloading. Defaults to 0 sec.
        logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
        middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
    });
})

gulp.task(":cleanDist", async function(){
    return new Promise(resolve=>{
        rm(DIST_DIR, resolve)
    })
});


/**
 * 编译文件到设置的目录
 */
gulp.task("build", gulp.series(":cleanDist", ":pug", ":less", ":copy"));


/**
 * 调试模式
 */
gulp.task("dev", gulp.parallel("watch-less-pug",":live-server"));