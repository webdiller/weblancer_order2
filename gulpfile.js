const
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    groupmq = require('gulp-group-css-media-queries'); // not required

/* Sass, cжимаем и переименовываем CSS файлы  NEW*/
gulp.task('sass', ['cleanapp'], function () {
    return (gulp.src('app/sass/**/*.+(sass|scss)'))
        .pipe(sass())
        .pipe(groupmq()) // Group media queries!
        .pipe(autoprefixer(['last 15 version', '>1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({ stream: true })) /* добавляем после установки browserSync, чтобы обновлялись стили*/
});


/* Таск очитки папки app/css */
gulp.task('cleanapp', function () {
    return del.sync('app/css');
});

/* 40:00 browserSync */
gulp.task('browserSync', function () {
    browserSync({
        // proxy: "test.ru",
        server: { baseDir: 'app' },
        notify: false // отключаем уведомления
    })
});

gulp.task('scripts', function () {
    return gulp.src([
        'app/libs/jquery-3.3.1/jquery.min.js',
        'app/libs/mypopper.js',
        'app/libs/bootstrap-4.1.3/js/bootstrap.min.js',
        'app/libs/owl-carousel/owl.carousel.min.js',
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
});

/* Сжимаем и переименовываем CSS файлы */
gulp.task('css-libs', ['sass'], function () {
    return gulp.src('app/css/**/*.css')
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/css'))
});

gulp.task('img', function () {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            une: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});


/* Таск для продакшена */
gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function () {
    var buildCss = gulp.src([
        'app/css/*.css'
    ])
        .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*.')
        .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/*')
        .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));

    return gulp.src(['app/libs/**/*'])
        .pipe(gulp.dest('dist/libs'));
});

/* Таск очитки папки dist */
gulp.task('clean', function () {
    return del.sync('dist');
});

/* Таск очистки кеша */
gulp.task('clear', function () {
    return cache.clearAll();
});

/* 35:00 Watch */
gulp.task('watch', ['browserSync', 'sass', 'scripts'], function () {     /* 2 параметр: указываем что методы, которые выполняются до запуска команды watch */
    gulp.watch(['app/sass/**/*.+(sass|scss)'], ['sass']);             /* 1 параметр: указываем файлы за которымы нужно следить
                                                            2 параметр: указываем команду для выполнения */
    gulp.watch(['app/**/*.html'], browserSync.reload);            /* следим за html файлами */
    gulp.watch(['app/**/*.php'], browserSync.reload);           /* следим за php файлами */
    gulp.watch(['app/js/**/*.js'], browserSync.reload);          /* следим за js файлами */
});

gulp.task('default', ['watch'], function () { });