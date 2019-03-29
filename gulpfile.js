// 加载gulp
var gulp = require('gulp');
//加载gulp-load-plugins插件，并马上运行它
var plugins = require('gulp-load-plugins')();
var rename = require('gulp-rename');

gulp.task('pug', async function () {
    gulp.src('www/**/*.pug') // 传入管道的文件
        .pipe(plugins.plumber())
        .pipe(plugins.pug({
            pretty: true // 默认为false，表示是否美化HTML
        }))
        .pipe(rename(function(path){
            path.extname=".html"
        }))
        .pipe(gulp.dest('www'))
    ; // dest:destination
});

var less = require('gulp-less');
gulp.task("less", async function(){
    gulp.src("www/**/*.less")
        .pipe(less({

        }))
        .pipe(gulp.dest("www"))
    ;
});



gulp.task("watch-less-pug", async function(){
    gulp.watch("www/**/*.pug", gulp.series("pug"))
    gulp.watch("www/**/*.less", gulp.series("less"))
})