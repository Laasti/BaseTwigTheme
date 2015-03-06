var gulp = require('gulp'),
browserSync = require('browser-sync'),
reload = browserSync.reload,
beeper = require('beeper'),
inject = require('gulp-inject'),
autoprefixer = require('gulp-autoprefixer'),
mainBowerFiles = require('main-bower-files'),
twig = require('gulp-twig'),
filter = require('gulp-filter');

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./public"
        }
    });
});

gulp.task('compile-html', ['compile-css'], function () {
    'use strict';
    var twig_data = require('./viewdata.json');
    var twig_config = {
        data: twig_data,
        errorLogToConsole: true,
        extend: function(Twig) {
            Twig.token.definitions.unshift({
            type: Twig.token.type.output,
            open: '{{-',
            close: '-}}'
        });
            Twig.token.definitions.unshift({
            type: Twig.token.type.logic,
            open: '{%-',
            close: '-%}'
        });
            Twig.filter.extend('trans', function (value) {
                return value;
            });
            return Twig;
        }
        
    };
    return gulp.src(['./views/*.twig', '!./views/_*.twig']).pipe(twig(twig_config)).pipe(gulp.dest('./public')).pipe(reload({stream: true}));
});

gulp.task('compile-bower', function() {
    return gulp.src(mainBowerFiles()).pipe(gulp.dest('./public/assets/vendor'));
});

gulp.task('inject-bower', ['compile-bower'], function() {
   return gulp.src('./views/**/*.twig').pipe(inject(gulp.src(['./public/assets/vendor/jquery.js','./public/assets/vendor/underscore.js', './public/assets/vendor/*.js'], {read: false}), {name: 'bower', transform: function (filepath, file, i, length) {
        return '<script type="text/javascript" src="'+filepath.replace('/public/assets/', '{{ assets_path }}')+'"></script>';
   }}))
           .pipe(inject(gulp.src('./public/assets/vendor/*.css', {read: false}), {name: 'bower', transform:function (filepath, file, i, length) {
        return '<link rel="stylesheet" href="'+filepath.replace('/public/assets/', '{{ assets_path }}')+'">';
   }})).pipe(gulp.dest('./views'));
});

gulp.task('compile-css', function () {
    'use strict';
    var sass = require('gulp-sass');
    return gulp.src('./scss/*.scss').pipe(sass()).pipe(autoprefixer({browsers: ['last 2 versions', '> 5%', 'ie 8', 'safari 5']})).pipe(gulp.dest('./css')).pipe(reload({stream: true}));
});

gulp.task('compile-img', function () {
    'use strict';
    var imagemin = require('gulp-smushit');
    return gulp.src('./images/*').pipe(imagemin()).pipe(gulp.dest('./public/images')).pipe(reload({stream: true}));
});

gulp.task('default', ['compile-css', 'compile-html']);

gulp.task('watch', ['browser-sync'], function() {
    beeper('***-*-*');
    gulp.watch('images/*', ['compile-img']);
    gulp.watch('scss/*.scss', ['compile-css']);
    gulp.watch(['views/*.twig', './views/parts/*.twig'], ['compile-html']);
});
