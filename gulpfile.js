const project_folder = "build";
const source_folder = "src";

const path = {
    build: {
        css: project_folder + "/css",
        favicon: source_folder + '/img/favicon',
        fonts: project_folder + "/fonts",
        html: project_folder + "/",
        img: project_folder + "/img",
        js: project_folder + "/js",
        png: source_folder + "/img/sprite",
        pug_css: source_folder + "/scss",
        pug: project_folder + "/",
    },
    clean: {
        favicon: [source_folder + '/img/favicon/*.*'],
        project: [project_folder],
    },
    src: {
        css: "./" + source_folder + "/scss/style.scss",
        fonts: "./" + source_folder + "/fonts/*.ttf",
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        img: source_folder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp,}",
        js: "./" + source_folder + "/js/script.js",
        png: "./" + source_folder + "/img/sprite/png/**/*.png",
        pug: [source_folder + "/pug/*.pug", "!" + source_folder + ["/pug/template/*.pug", "/pug/section/*.pug", "/pug/mixin/*.pug"]],
        svg: "./" + source_folder + "/img/sprite/svg/**/*.svg",
    },
    watch: {
        css: "./" + source_folder + "/scss/**/*.scss",
        favicon: source_folder + '/img/**/favicon.png',
        html: project_folder + "/**/*.html",
        img: "./" + source_folder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        js: "./" + source_folder + "/js/**/*.js",
        png: source_folder + "/img/sprite/png/**/*.png",
        pug: source_folder + "/pug/**/*.pug",
        pug_css: + source_folder + "/pug/**/*.scss",
        svg: source_folder + "/img/sprite/svg/**/*.svg",
    },
};

const { src, dest } = require('gulp'),
    gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    bemValidator = require('gulp-html-bem-validator'),
    browsersync = require('browser-sync').create(),
    del = require("del"),
    csso = require('gulp-csso'),
    favicons = require("favicons").stream,
    log = require("fancy-log"),
    group_media = require("gulp-group-css-media-queries"),
    htmlmin = require('gulp-htmlmin'),
    inject = require("gulp-inject-string"),
    imagemin = require('gulp-imagemin'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    Pug = require('gulp-pug'),
    pugLinter = require('gulp-pug-linter'),
    rename = require("gulp-rename"),
    sass = require('gulp-sass'),
    shorthand = require('gulp-shorthand'),
    sourcemaps = require('gulp-sourcemaps'),
    spritesmith = require('gulp.spritesmith'),
    stylelint = require('stylelint'),
    svgsprite = require("gulp-svg-sprite"),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch');

/* browser-sync
=========================*/
async function browserSync(callback) {
    return browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        notify: false
    });
    callback();
}

/* html:build
====================================================*/
function html(callback) {
    return src(path.src.html)
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
            })
        }))
        // .pipe(dest(path.build.html))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        // .pipe(
        //     rename({
        //         extname: ".min.html"
        //     })
        // )
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
    callback();
}

/* BEM validate – welcome to hell
====================================================*/
function validateBem(callback) {
    return src(path.watch.html)
        .pipe(bemValidator())
        .pipe(dest(path.build.html))
    callback();
}

/* pug
====================================================*/
async function pug(callback) {
    return src(path.src.pug)
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
            })
        }))
        .pipe(Pug({
            pretty: true
        }))
        .pipe(dest(path.build.pug))
        .pipe(browsersync.stream());
    callback();
}

/* pug Linter
====================================================*/

function PugLinter() {
    return src(path.src.pug)
        .pipe(pugLinter({ failAfterError: true }))
}

/* css:build
====================================================*/
function css(callback) {
    return src(path.src.css)
        .pipe(
            sass({
                outputStyle: ["expanded", "nested"],
                precision: 10,
                includePaths: ['.'],
                onError: console.error.bind(console, 'Sass error:')
            })
        )
        .pipe(
            group_media()
        )
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'Styles',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 4 version"],
            cascade: true
        })
        )
        .pipe(sourcemaps.write())
        .pipe(shorthand())
        .pipe(dest(path.build.css))
        .pipe(csso())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
    callback();
}

/* scss lint
====================================================*/
function lintScss(callback) {
    return gulp.src(path.watch.css).pipe(stylelint({
        reporters: [
            {
                failAfterError: true,
                formatter: 'string',
                console: true,
            },
        ],
    }));
    callback();
}

/* js build
====================================================*/
function js(callback) {
    return src(path.src.js)
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
            })
        }))
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
    callback();
}

/* image build
====================================================*/
function images() {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}
/* image min
====================================================*/
function imagesMin() {
    return src(path.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ],
            {
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 // 0 to 7
            }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

/* sprite
====================================================*/
async function imgSprite(callback) {
    let spriteData = gulp.src(path.src.png)
        .pipe(plumber())
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.scss',
            cssFormat: 'scss',
            algorithm: 'top-down',
            imgPath: '../img/sprite/sprite.png',
            padding: 10
        }));
    spriteData.img.pipe(gulp.dest(path.build.png));
    spriteData.css.pipe(gulp.dest(path.build.css));
    callback();
}

/* SVG sprite
====================================================*/
svgconfig = {
    shape: {
        dimension: { // Set maximum dimensions
            maxWidth: 32,
            maxHeight: 32
        },
        spacing: { // Add padding
            padding: 10
        },
    },
    mode: {
        stack: {
            sprite: "../icons.svg",  //sprite file name
            example: true
        },
        view: { // Activate the «view» mode
            bust: false,
            render: {
                scss: true // Activate Sass output (with default options)
            }
        },
        symbol: true // Activate the «symbol» mode
    },
};

function svgSprite(callback) {
    return gulp.src(path.src.svg)
        .pipe(svgsprite())
        .pipe(svgsprite(svgconfig))
        .pipe(dest(path.build.img));
    callback();
}

/* favicon:clean
====================================================*/
function delfavicon() {
    return del(path.clean.favicon)
}

/* favicon:build  / generate
====================================================*/
favconfig = {
    path: "/img/favicon/",                    // Path for overriding default icons path. `string`
    appName: 'CodeTime',                      // Your application's name. `string`
    appShortName: null,                       // Your application's short_name. `string`. Optional. If not set, appName will be used
    appDescription: null,                     // Your application's description. `string`
    developerName: null,                      // Your (or your developer's) name. `string`
    developerURL: null,                       // Your (or your developer's) URL. `string`
    dir: "auto",                              // Primary text direction for name, short_name, and description
    lang: "en-US",                            // Primary language for name and short_name
    background: "#fff",                       // Background colour for flattened icons. `string`
    theme_color: "#fff",                      // Theme color user for example in Android's task switcher. `string`
    appleStatusBarStyle: "black-translucent", // Style for Apple status bar: "black-translucent", "default", "black". `string`
    display: "standalone",                    // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
    orientation: "any",                       // Default orientation: "any", "natural", "portrait" or "landscape". `string`
    scope: "/",                               // set of URLs that the browser considers within your app
    start_url: "/?homescreen=1",              // Start URL when launching the application from a device. `string`
    version: "1.0",                           // Your application's version string. `string`
    logging: false,                           // Print logs to console? `boolean`
    pixel_art: false,                         // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
    loadManifestWithCredentials: false,       // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
    url: null,
    html: null,
    pipeHTML: true,
    replace: true,
    icons: {
        // Platform Options:
        // - offset - offset in percentage
        // - background:
        //   * false - use default
        //   * true - force use default, e.g. set background for Android icons
        //   * color - set background for the specified icons
        //   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
        //   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
        //   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
        //
        android: true,              // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        appleIcon: true,            // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        appleStartup: true,         // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        coast: true,                // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        favicons: true,             // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        firefox: true,              // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        windows: true,              // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
        yandex: true                // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    }
};

async function faviconGenerate() {
    return src(path.watch.favicon)
        .pipe(favicons(favconfig))
        .on("error", log)
        .pipe(dest(path.build.favicon));
}

/* clean
====================================================*/
const clean = () => del(path.clean.project);

/* default
====================================================*/
const build = gulp.series(clean, gulp.parallel(html, js, css, images, pug));
const watching = gulp.series(build, gulp.parallel(watchPug, browserSync));
const junior = gulp.series(build, gulp.parallel(watchHtml, browserSync));
const validate = gulp.series(validateBem);
const favicon = gulp.series(delfavicon, faviconGenerate);

/* watch pug
====================================================*/
async function watchPug(callback) {
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.svg], svgSprite);
    gulp.watch([path.watch.png], imgSprite);
    gulp.watch([path.watch.pug], pug);
    gulp.watch([path.watch.pug_css], css);
    gulp.watch([path.watch.favicon], favicon);
    callback();
}

/* watch html
====================================================*/
async function watchHtml(callback) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.svg], svgSprite);
    gulp.watch([path.watch.png], imgSprite);
    gulp.watch([path.watch.pug_css], css);
    gulp.watch([path.watch.favicon], favicon);
    callback();
}


/* =================================================*/

exports.favicon = favicon;
exports.faviconGenerate = faviconGenerate;
exports.delfavicon = delfavicon;
exports.PugLinter = PugLinter;
exports.pug = pug;
exports.validate = validate;
exports.validateBem = validateBem;
exports.svgSprite = svgSprite;
exports.imgSprite = imgSprite;
exports.lintScss = lintScss;
exports.watch = watch;
exports.watchPug = watchPug;
exports.watchHtml = watchHtml;
exports.clean = clean;
exports.imagesMin = imagesMin;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.junior = junior;
exports.watching = watching;
exports.default = watching;
