// 加载gulp
var gulp = require('gulp');
const babel = require('gulp-babel');
const zip = require('gulp-zip');

//加载gulp-load-plugins插件，并马上运行它
var plugins = require('gulp-load-plugins')();

var filterSize = require('gulp-filter-size');
const filter = require('gulp-filter');
var fileinfo = require('gulp-fileinfo');


var rename = require('gulp-rename');
const path = require("path");

const argv = require('yargs').argv;



const package = require("./package.json");

const SRC_DIR = package["path for develop"];
const DIST_DIR = package["path for product"];

//目录内部文件不进行编译
const excludeDirNameLs = package["exclude dir name list"];

const golbForLess = [`${SRC_DIR}**/!($*).less`];
const golbForPug  = [`${SRC_DIR}**/!($*).pug`];
const golbForEs  =  [`${SRC_DIR}**/!($*).es`];

const golbFilterForPug = filter([
    "**",
    "!($*).pug",
    ...excludeDirNameLs.split(",").map(dirname=>`!**/${dirname}/**`)
]); //数组之间取交集


const rm = require("rimraf");

gulp.task(':pug', async function () {
    await gulp
        .src(golbForPug) // 传入管道的文件
        // .pipe(golbFilterForPug)
        .pipe(fileinfo())
        .pipe(plugins.plumber())
        .pipe(plugins.pug({
            pretty: true // 默认为false，表示是否美化HTML
        }))

        .pipe(filterSize({min:1}))
        .pipe(rename(function(path){
            path.extname=".htm"
        }))
        .pipe(gulp.dest(SRC_DIR))
    ; // dest:destination
});


gulp.task(':es', async function () {
    await gulp
        .src(golbForEs)
        .pipe(babel())
        .on("error", console.log)
        .pipe(rename(function(path){
            console.log(path,7897)
            path.extname=".js"
        }))
        .pipe(gulp.dest(SRC_DIR))
    ;
})


var less = require('gulp-less');
gulp.task(":less", async function(){
    await gulp
        .src(golbForLess)
        .pipe(fileinfo())
        .pipe(less({
            path:[
                path.join(__dirname, ""),
                path.join(__dirname, SRC_DIR),
                path.join(__dirname, "/node_modules"),
            ]
        }))
        .on("error", console.error)
        //单位bytes,{max,min} 通过文件大小过滤
        .pipe(filterSize({min:1}))
        .pipe(gulp.dest(SRC_DIR))
    ;
});


gulp.task("watch-them", async function () {
    gulp.watch(golbForPug, gulp.series(":pug"));
    gulp.watch(golbForLess, gulp.series(":less"));
    gulp.watch(golbForEs, gulp.series(":es"));
});





gulp.task(":copy", async function () {
    gulp.src([
        `${SRC_DIR}**/!(*.less|*.pug|*.es)`,
    ])
        .pipe(filterSize({min:1}))
        .pipe(gulp.dest(`${DIST_DIR}`))
    ;
});

gulp.task(":live-server", async function(){
    const liveServer = require("live-server");
    liveServer.start({
        port: 10080 || argv.port || 6524, // Set the server port. Defaults to 8080.
        //host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
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

//压缩dist
gulp.task(":zip-dist", async function(){
    gulp.src('src/**')
        .pipe(zip('template.zip'))
        .pipe(gulp.dest('./'))
})


/**
 * 编译文件到设置的目录
 */
gulp.task("build", gulp.series(":cleanDist", ":pug", ":less", ":es", ":copy", ":zip-dist"));


/**
 * 调试模式
 */
gulp.task("dev", gulp.parallel("watch-them",":live-server"));
