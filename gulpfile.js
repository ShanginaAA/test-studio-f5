const { src, dest, watch, series, parallel } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer').default;
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const { deleteAsync } = require('del');

const paths = {
  pug: {
    src: 'src/pages/*.pug',
    watch: 'src/**/*.pug',
    dest: 'dist/',
  },
  scss: {
    src: 'src/scss/style.scss',
    watch: 'src/scss/**/*.scss',
    dest: 'dist/css/',
  },
  img: {
    src: 'src/img/**/*.{png,jpg,jpeg,gif,svg,ico}',
    dest: 'dist/img/',
  },
};

function clean() {
  return deleteAsync(['dist']);
}

function images() {
  return src(paths.img.src, { encoding: false })
    .pipe(plumber(notify.onError()))
    .pipe(dest(paths.img.dest))
    .pipe(browserSync.stream());
}

function pugCompile() {
  return src(paths.pug.src)
    .pipe(plumber(notify.onError()))
    .pipe(pug({ pretty: true, basedir: __dirname }))
    .pipe(dest(paths.pug.dest))
    .pipe(browserSync.stream());
}

function styles() {
  return src(paths.scss.src)
    .pipe(plumber(notify.onError()))
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: ['src/scss', 'src/img'],
      }),
    )
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: {
      baseDir: './dist',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
  });

  watch(paths.pug.watch, pugCompile);
  watch(paths.scss.watch, styles);
  watch(paths.img.src, images);
}

exports.default = series(clean, parallel(pugCompile, styles, images), serve);
