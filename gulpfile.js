const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const del = require("del");
const htmlreplace = require('gulp-html-replace');
const minify = require('gulp-minifier');

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/js/**", gulp.series("js"));
  gulp.watch("source/*.html", gulp.series("html")).on("change", sync.reload);
}

exports.default = gulp.series(
  styles, server, watcher
);

// ImageMin

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(imagemin([
  imagemin.optipng({optimizationLevel: 3}),
  imagemin.jpegtran({progressive:true}),
  imagemin.svgo()
  ]))
  }

  exports.images = images;

//Sprite

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
  .pipe(svgstore())
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"))
  }

exports.sprite = sprite;

//Html

const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmlreplace({
    'css': 'css/styles.min.css'
  }))
  .pipe(minify({
    minify: true,
    minifyHTML: {
      collapseWhitespace: true,
      conservativeCollapse: true,
    }
  }))
  .pipe(gulp.dest('build/'));
};

exports.html = html;

const js = () => {
  return gulp.src("source/js/**", {base: "source"})
  .pipe(minify({
    minify: true,
    minifyJS: {
      sourceMap: true
    }
  }))
  .pipe(gulp.dest('build'));
};

exports.js = js;

//Copy

const copy = () => {
  return gulp.src([
  "source/fonts/**/*.{woff,woff2}",
  "source/img/**",
  "source/*.ico"
], {
  base: "source"
  })
  .pipe(gulp.dest("build"));
};

  exports.copy = copy;

//Delete

const clean = () => {
  return del("build");
  };

const build = gulp.series(clean, copy, styles, sprite, html, js);
exports.build = build;
