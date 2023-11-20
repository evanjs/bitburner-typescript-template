const gulp = require("gulp")
const ts = require("gulp-typescript");

const exec = require('child_process').exec;
const log = require('fancy-log');
const tsProject = ts.createProject("tsconfig.json");
const replace = require("gulp-replace");
const {concurrently} = require("concurrently");
const {error} = require("fancy-log");
const newer = require('gulp-newer');
//let changed;
// import('gulp-changed').then((gulpChanged) => {
//     changed = gulpChanged;
// });

gulp.task('xxxsinx', () => {
    return gulp.src(['external/xxxsinx/**/*'])
        .pipe(newer('external/xxxsinx'))
        .pipe(replace(/from '\/(.+?)'/g, "from 'xxxsinx/$1'"))
        .pipe(replace(/(from.*?)(\.js)/g, "$1"))
        .pipe(gulp.dest("dist" + '/xxxsinx'));
});

gulp.task('filesync', async function (cb) {
    exec('node ./node_modules/bitburner-filesync/npx/bitburner-filesync.js', function (err, stdout, stderr) {
        log(stdout);
        error(stderr);
        cb(err);
    })
});

gulp.task('mine', () => {
    return tsProject.src()
        //.pipe(newer('src'))
        .pipe(tsProject())
        .js
        .pipe(gulp.dest("dist"));
});

gulp.task('watch-me', async (cb) => {
    gulp.watch(['src/**/*.ts'])
        .on('change', gulp.series('mine'));
    cb();
})

gulp.task('watch-both', async(cb) => {
    gulp.series('watch-me', 'watch-xxxsinx');
    cb();
});

gulp.task('watch-xxxsinx', async (cb) => {
    gulp.watch(['external/xxxsinx/**/*.js'])
        .on('change', gulp.series('xxxsinx'));
    cb();
})

gulp.task('watch', async function () {
    return gulp.parallel([
        "watch-me",
        "watch-xxxsinx",
    ]);
})

gulp.task('listen', gulp.series('mine', 'watch'));
gulp.task('listen-and-serve', gulp.parallel(['watch', 'filesync']));
gulp.task('sync', gulp.series('mine', 'listen-and-serve'))

gulp.task('default', gulp.series('mine', 'xxxsinx'));
