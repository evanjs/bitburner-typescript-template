const {gulp, series, src, dest} = require("gulp");

const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const replace = require("gulp-replace");

const paths = {
  xxxsinx: ["src/xxxsinx/*.js"]
}

exports.default = series(build);
// exports.replaceTemplate = replaceTemplate(); 

function build() {
  return tsProject.src()
    .pipe(tsProject())
    .js
    .pipe(replace(/from '(.+?)'/g, "from 'xxxsinx/$1'"))
    .pipe(dest("dist")
    )
}

// function replaceTemplate() {
//   return src(paths.xxxsinx)
//     .pipe(replace('hack-once', 'nonono'))
//     .pipe(dest('dist'))
// }
