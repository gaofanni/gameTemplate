'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')
const glob = require('glob')

let name = "gametemplate";
let year = "2018";
let plat = "game";

function getEntry(globPath) {
  var entries = {},
    basename, tmp, pathname;

  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    tmp = entry.split('/').splice(-3);
    pathname = basename; // 正确输出js和html的路径
    entries[pathname] = entry;
  });

  return entries;
}



const modulePath = './src/pages/'
// let serverReleasePath = `../../../../server/y${year}/${plat}/views/${name}/`
// let assetsReleasePath=`../../../../../release/y${year}/${plat}/${name}`

let serverReleasePath = `../../server/`
let assetsReleasePath = `../release/game/`
let assetsReleasePathWx = `../release/wxGame`
let entries = getEntry(modulePath + '/*/*.ts')


let devTemplate = [];

for (let i in entries) {
  devTemplate.push({
    filename: i + '.html',
    template: modulePath + i + '/' + i + '.html',
    inject: true,
    titleSlot: /*html*/`
      <title>开发环境title随意</title>
    `,
    /**
       * 引入自定义脚本
       * <script src="/template-vue/static/libs/laya.core.js"></script>
       */
    preSlots: ``,
    chunks: ["" + i, 'manifest', 'vendor'],
    chunksSortMode: 'dependency'
  })
}

let buildTemplate = [];

for (let i in entries) {
  buildTemplate.push({
    filename: serverReleasePath + i + '.ejs',
    template: modulePath + i + '/' + i + '.html',
    inject: true,
    titleSlot: /*html*/`
    <title><%=title%></title>
    `,
    /**
     * 引入自定义脚本，如cdn中的脚本
     * <script src="<%=cdn%>static/libs/laya.core.js"></script>
     */
    preSlots: /*html*/`
      <script>
        window.__webpack_public_path__='<%=cdn%>'
      </script>
    `,
    chunks: ["" + i, 'manifest', 'vendor'],
    chunksSortMode: 'dependency'
  })
}

module.exports = {
  entries: entries,
  dev: {
    template: devTemplate,

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},

    // Various Dev Server settings
    host: '0.0.0.0', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-


    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },
  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),
    template: buildTemplate,
    // Paths
    assetsRoot: path.resolve(__dirname, assetsReleasePath),
    assetsSubDirectory: 'static',
    assetsPublicPath: '<%=cdn%>game/',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  wxbuild: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),
    // Paths
    assetsRoot: path.resolve(__dirname, assetsReleasePathWx),
    assetsSubDirectory: 'static',
    assetsPublicPath: '',
    // assetsPublicPath: '<%=cdn%>',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
