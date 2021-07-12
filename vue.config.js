const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const RUN_ENV = process.env.VUE_APP_RUN_ENV
const isServer = RUN_ENV === 'server'
console.log('isServer', isServer)

module.exports = {
    lintOnSave: false,
    outputDir: `dist/${RUN_ENV}`,
    configureWebpack: {
        entry: `./src/entry-${RUN_ENV}.js`,
        target: isServer ? 'node' : 'web',
        devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
        output: {
            libraryTarget: isServer ? 'commonjs2' : undefined
        },
        plugins: [
            isServer ? new VueSSRServerPlugin() : new VueSSRClientPlugin()
        ],
        externals: isServer ? nodeExternals({
                        allowlist: /\.css$/
                    }) : undefined
    },
    // 覆盖默认的webpack配置，建议写在这里，configureWebpack权重最低
    chainWebpack: config => {
        // server编译时，关闭自动分块，否则会被警告有多个入口文件
        isServer
            ? config.optimization.splitChunks(undefined)
            : config.optimization.splitChunks({
                minSize: 10000
            })
    },
    devServer: {
        open: true
    }
}

// todo 热更新 不能使用build --watch，否则会阻塞后面命令的执行
