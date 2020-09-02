const project_folder = "build";
const source_folder = "src";
const project_app_folder = "app";

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css",
    js: project_folder + "/js",
    img: project_folder + "/img",
    fonts: project_folder + "/fonts",
    app_html: project_app_folder + "/",
  },

  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    // html: "**/*.html", 
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {  //What need to waching
    html: source_folder + "/**/*html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: [project_folder, project_app_folder],
};

const { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  watch = require('gulp-watch'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  sourcemaps = require('gulp-sourcemaps'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  fileinclude = require('gulp-file-include'),
  del = require("del"),
  favicons = require("favicons").stream,
  log = require("fancy-log"),
  inject = require("gulp-inject-string");





function browserSync(params) {
  return browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    notify: false
  });
};


function html() {
  return src(path.src.html)
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
      })
    }))

    .pipe(fileinclude({ prefix: '@@' }))
    .pipe(dest(path.build.html))
    .pipe(dest(path.build.app_html))
    .pipe(browsersync.stream())
    .pipe(gulp.dest(path.src.html));
};


function css() {
  return src(path.src.css)
    .pipe(
      sass({
        outputStyle: "expanded"
      })
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
      overrideBrowserslist: ["last 4 version"]
    })
    )
    .pipe(dest(path.build.css))
    .pipe(sourcemaps.write())
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
};

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
};

function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
};

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
};


gulp.task("delfavicon", function () {
  return del([source_folder + '/img/favicon/*.{png,xml,ico,json,webapp,html}'])
});

gulp.task("favicon", function () {
  return gulp.src([source_folder + '/img/favicon.{png, jpg, svg}'])
    .pipe(favicons({
      path: "/img/favicon/",                                // Path for overriding default icons path. `string`
      appName: 'CodeTime',                            // Your application's name. `string`
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
      html: "_favicon.html",
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
    }))
    .on("error", log)
    .pipe(dest([source_folder + '/img/favicon/']));
});


gulp.task('faviconAddMeta', function (callback) {
  gulp.src(path.src)
    .pipe(inject.beforeEach('</head>', '<link rel="shortcut icon" href="/img/favicon/favicon.ico">' +
      '            <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon/favicon-16x16.png">' +
      '        <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon/favicon-32x32.png">' +
      '        <link rel="icon" type="image/png" sizes="48x48" href="/img/favicon/favicon-48x48.png">' +
      '        <link rel="manifest" href="/img/favicon/manifest.json">' +
      '        <meta name="mobile-web-app-capable" content="yes">' +
      '        <meta name="theme-color" content="#fff">' +
      '        <meta name="application-name" content="CodeTime">' +
      '        <link rel="apple-touch-icon" sizes="57x57" href="/img/favicon/apple-touch-icon-57x57.png">' +
      '        <link rel="apple-touch-icon" sizes="60x60" href="/img/favicon/apple-touch-icon-60x60.png">' +
      '        <link rel="apple-touch-icon" sizes="72x72" href="/img/favicon/apple-touch-icon-72x72.png">' +
      '        <link rel="apple-touch-icon" sizes="76x76" href="/img/favicon/apple-touch-icon-76x76.png">' +
      '        <link rel="apple-touch-icon" sizes="114x114" href="/img/favicon/apple-touch-icon-114x114.png">' +
      '        <link rel="apple-touch-icon" sizes="120x120" href="/img/favicon/apple-touch-icon-120x120.png">' +
      '        <link rel="apple-touch-icon" sizes="144x144" href="/img/favicon/apple-touch-icon-144x144.png">' +
      '        <link rel="apple-touch-icon" sizes="152x152" href="/img/favicon/apple-touch-icon-152x152.png">' +
      '        <link rel="apple-touch-icon" sizes="167x167" href="/img/favicon/apple-touch-icon-167x167.png">' +
      '        <link rel="apple-touch-icon" sizes="180x180" href="/img/favicon/apple-touch-icon-180x180.png">' +
      '        <link rel="apple-touch-icon" sizes="1024x1024" href="/img/favicon/apple-touch-icon-1024x1024.png">' +
      '        <meta name="apple-mobile-web-app-capable" content="yes">' +
      '        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">' +
      '        <meta name="apple-mobile-web-app-title" content="CodeTime">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"    href="/img/favicon/apple-touch-startup-image-640x1136.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"    href="/img/favicon/apple-touch-startup-image-750x1334.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"    href="/img/favicon/apple-touch-startup-image-828x1792.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"    href="/img/favicon/apple-touch-startup-image-1125x2436.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"    href="/img/favicon/apple-touch-startup-image-1242x2208.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"    href="/img/favicon/apple-touch-startup-image-1242x2688.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"   href="/img/favicon/apple-touch-startup-image-1536x2048.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"   href="/img/favicon/apple-touch-startup-image-1668x2224.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"   href="/img/favicon/apple-touch-startup-image-1668x2388.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"  href="/img/favicon/apple-touch-startup-image-2048x2732.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"  href="/img/favicon/apple-touch-startup-image-1620x2160.png">' +
      '    <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"   href="/img/favicon/apple-touch-startup-image-1136x640.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"   href="/img/favicon/apple-touch-startup-image-1334x750.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"   href="/img/favicon/apple-touch-startup-image-1792x828.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"   href="/img/favicon/apple-touch-startup-image-2436x1125.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"   href="/img/favicon/apple-touch-startup-image-2208x1242.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"   href="/img/favicon/apple-touch-startup-image-2688x1242.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"  href="/img/favicon/apple-touch-startup-image-2048x1536.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"  href="/img/favicon/apple-touch-startup-image-2224x1668.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"  href="/img/favicon/apple-touch-startup-image-2388x1668.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/img/favicon/apple-touch-startup-image-2732x2048.png">' +
      '        <link rel="apple-touch-startup-image" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"  href="/img/favicon/apple-touch-startup-image-2160x1620.png">' +
      '        <link rel="icon" type="image/png" sizes="228x228" href="/img/favicon/coast-228x228.png">' +
      '        <meta name="msapplication-TileColor" content="#fff">' +
      '        <meta name="msapplication-TileImage" content="/img/favicon/mstile-144x144.png">' +
      '        <meta name="msapplication-config" content="/img/favicon/browserconfig.xml">' +
      '        <link rel="yandex-tableau-widget" href="/img/favicon/yandex-browser-manifest.json"></link>')),
    callback();
});

const clean = () => del(path.clean);

let build = gulp.series(clean, gulp.parallel(html, js, css, images));
let watching = gulp.parallel(build, browserSync, watchFiles);


// exports.delfavicon = delfavicon;
// exports.favicon = favicon;
// exports.watchFiles = watchFiles;
// exports.index = index;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watching = watching;
exports.default = watching;
exports.faviconAddMeta = faviconAddMeta;