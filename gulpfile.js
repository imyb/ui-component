const gulp = require('gulp');
const gutil = require('gulp-util');
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const ejsMonster = require('gulp-ejs-monster');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const del = require('del');

/**
 *  PATH
 */
const DIR = {
    SRC : './src/',
    TMP : './tmp/',
    DIST : './dist/',
    SCSS : 'assets/scss/',
    CSS : 'assets/css/',
    JS : 'assets/js/',
    IMG : 'assets/img/',
    HTML : 'html/'
}

const EXT = {
    SCSS : '**/*.scss',
    JS : '**/*.js',
    IMG : '**/*.+(png|jpg|jpeg|gif|svg)',
    HTML : '**/*.html',
    EJS : '**/*.ejs'
}

const PATH = {
    SRC : {
        SCSS : [
            DIR.SRC + DIR.SCSS + EXT.SCSS
        ],
        JS : [
            DIR.SRC + DIR.JS + 'docs.js',
            DIR.SRC + DIR.JS + 'script.js'
        ],
        JS_VENDOR : [
            DIR.SRC + DIR.JS + 'vendor/jquery-1.12.4.min.js',
            DIR.SRC + DIR.JS + 'vendor/prism.js'
        ],
        JS_PRE_RENDER_POLYFILL : [
            DIR.SRC + DIR.JS + 'vendor/html5shiv-printshiv.min.js',
            DIR.SRC + DIR.JS + 'vendor/respond.min.js'
        ],
        IMG : [
            DIR.SRC + DIR.IMG + EXT.IMG
        ],
        HTML : [
            DIR.SRC + DIR.HTML + EXT.HTML,
            DIR.SRC + DIR.HTML + EXT.EJS
        ]
    },
    TMP : {
        CSS : DIR.TMP + DIR.CSS,
        JS : DIR.TMP + DIR.JS,
        IMG : DIR.TMP + DIR.IMG,
        HTML : DIR.TMP + DIR.HTML
    },
    DIST : {
        CSS : DIR.DIST + DIR.CSS,
        JS : DIR.DIST + DIR.JS,
        IMG : DIR.DIST + DIR.IMG,
        HTML : DIR.DIST + DIR.HTML
    }
}


/**
 *  STYLE task
 */
gulp.task('styles', function () {
    return gulp.src( PATH.SRC.SCSS )
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle : 'compressed' }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gutil.env.type == 'prod' ? gulp.dest( PATH.DIST.CSS ) : gulp.dest( PATH.TMP.CSS ))
});


/**
 *  SCRIPT task
 */
gulp.task('scripts', ['scripts:vendor', 'scripts:pre_render_polyfill'], function () {
    return gulp.src( PATH.SRC.JS )
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        .pipe(babel({
            presets: ['env']
        }))
        .on('error', function(e) {
            console.error(e.message);
            this.emit('end');
        })
        .pipe(gutil.env.type == 'prod' ? uglify() : gutil.noop())
        .pipe(sourcemaps.write())
        .pipe(gutil.env.type == 'prod' ? gulp.dest( PATH.DIST.JS ) : gulp.dest( PATH.TMP.JS ))
});

gulp.task('scripts:vendor', function() {
    return gulp.src( PATH.SRC.JS_VENDOR )
        .pipe(concat('vendor.js'))
        .pipe(gutil.env.type == 'prod' ? uglify() : gutil.noop())
        .pipe(gutil.env.type == 'prod' ? gulp.dest( PATH.DIST.JS ) : gulp.dest( PATH.TMP.JS ))
});

gulp.task('scripts:pre_render_polyfill', function() {
    return gulp.src( PATH.SRC.JS_PRE_RENDER_POLYFILL )
        .pipe(concat('preRender.polyfill.js'))
        .pipe(gutil.env.type == 'prod' ? uglify() : gutil.noop())
        .pipe(gutil.env.type == 'prod' ? gulp.dest( PATH.DIST.JS ) : gulp.dest( PATH.TMP.JS ))
});


/**
 *  IMAGES task
 */
gulp.task('images', function() {
    return gulp.src( PATH.SRC.IMG )
        .pipe(gutil.env.type == 'prod' ? gulp.dest( PATH.DIST.IMG ) : gulp.dest( PATH.TMP.IMG ))
});


/**
 *  HTML task
 */
gulp.task('html', function () {
    return gulp.src( PATH.SRC.HTML )
        .pipe(ejsMonster({
            widgets: DIR.SRC + DIR.HTML,
            layouts: DIR.SRC + DIR.HTML,
            includes: DIR.SRC + DIR.HTML
        }).on('error', ejsMonster.preventCrash))
        .pipe(gutil.env.type == 'prod' ? gulp.dest( PATH.DIST.HTML ) : gulp.dest( PATH.TMP.HTML ))
});


/**
 *  CLEAN task
 */
gulp.task('clean:tmp', function() {
    return del.sync( DIR.TMP );
});

gulp.task('clean:dist', function() {
    return del.sync( DIR.DIST );
});


/**
 *  WATCH task
 */
gulp.task('watch', function() {
    gulp.watch([ PATH.SRC.HTML ], ['html', browserSync.reload]);
    gulp.watch([ PATH.SRC.SCSS ], ['styles', browserSync.reload]);
    gulp.watch([ PATH.SRC.JS ], ['scripts', browserSync.reload]);
    gulp.watch([ PATH.SRC.IMG ], ['iamges', browserSync.reload]);
});


/**
 *  SERVER task
 */
gulp.task('browser-sync', function() {
    browserSync.init({
        port: 8080,
        server: {
            baseDir: DIR.TMP,
            index: DIR.HTML + 'index.html'
        },
        open: false
    });
});


/**
 *  DEV task
 */
gulp.task('dev', function(callback) {
    runSequence(
        'clean:tmp',
        ['styles', 'scripts', 'images', 'html', 'watch'],
        'browser-sync',
        callback
    );
});


/**
 *  BUILD task
 */
gulp.task('build', function(callback) {
    runSequence(
        'clean:dist',
        ['styles', 'scripts', 'images', 'html'],
        callback
    );
});