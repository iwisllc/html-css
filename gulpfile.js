const production = ( process.env.NODE_ENV == 'production' );

//base part
const {src, dest, parallel, series, watch} = require('gulp'),
    rename  = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    ejs = require('gulp-ejs'),
    htmlbeautify = require('gulp-html-beautify');

//css part
const sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer');

const babel = require('gulp-babel'),
    uglify = require('gulp-uglify-es').default,
    include = require("gulp-include");

const buildFolder = 'dist';

const pathFiles = {
    build: {
        html: './' + buildFolder + '/',
        css: './' + buildFolder + '/css/',
        js: './' + buildFolder + '/js/'
    },
    src: {
        html: './src/ejs/**/*.ejs',
        css: './src/scss/**/*.scss',
        js: './src/js/**/*.js'
    }
};

function swallowError(error){
    console.log(error.toString());
    this.emit('end');
}

function styles() {
    return src('./src/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .on('error', swallowError)
        .pipe(autoprefixer({
            browsers: ['last 10 versions', '> 2%', 'ie 10', 'ie 11'],
            cascade: false
        }))
        .pipe(cleanCSS({level: {1: {specialComments: false}}}))
        .pipe(rename('style.min.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(pathFiles.build.css));
}

function vendorStyles() {
    return src('./src/scss/vendor.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .on('error', swallowError)
        .pipe(autoprefixer({
            browsers: ['last 10 versions', '> 2%', 'ie 10', 'ie 11'],
            cascade: false
        }))
        .pipe(cleanCSS({level: {1: {specialComments: false}}}))
        .pipe(rename('vendor.min.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(pathFiles.build.css));
}

function scripts() {
    return src('./src/js/index.js')
        .pipe(include())
        .pipe(rename('app.min.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .on('error', swallowError)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(dest(pathFiles.build.js));
}

function vendorScripts() {
    return src('./src/js/vendor.js')
        .pipe(include())
        .pipe(rename('vendor.min.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .on('error', swallowError)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(dest(pathFiles.build.js));
}

function views() {
    return src('./src/ejs/index.ejs')
        .pipe(ejs())
        .pipe(rename({ extname: ".html" }))
        .pipe(htmlbeautify({indentSize: 2}))
        .on('error', swallowError)
        .pipe(dest(pathFiles.build.html));
}

function gulpWatch(done) {
    watch(pathFiles.src.css, styles);
    watch(pathFiles.src.js, scripts);
    watch(pathFiles.src.html, views);
    done();
}

exports.vendorStyles = vendorStyles;
exports.styles = styles;
exports.scripts = scripts;
exports.vendorScripts = vendorScripts;
exports.views = views;
exports.gulpWatch = gulpWatch;
exports.build = series(styles, vendorStyles, scripts, vendorScripts, views);
exports.default = series(styles, vendorStyles, scripts, vendorScripts, views, gulpWatch);
