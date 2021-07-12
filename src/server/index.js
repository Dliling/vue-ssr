const Vue = require('vue');
const server = require('express')();
const fs = require('fs');
const path = require('path')
const expressStaic  = require('express-static')
const {createBundleRenderer} = require('vue-server-renderer')

const resolve = (file) => path.resolve(__dirname, file)
const file = fs.readFileSync(resolve('../index.template.html', 'utf-8'))

// 开放dist/client目录，客户端访问时可被访问到
server.use(expressStaic(resolve('../../dist/client')))

const serverBundle = require('../../dist/server/vue-ssr-server-bundle.json')
const clientManifest = require('../../dist/client/vue-ssr-client-manifest.json')

const renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false, // 推荐
    template: file, // （可选）页面模板
    clientManifest, // （可选）客户端构建 manifest
    shouldPreload: (file, type) => {
        // 基于文件扩展名的类型推断。
        // https://fetch.spec.whatwg.org/#concept-request-destination
        if (type === 'script' || type === 'style') {
          return true
        }
        if (type === 'font') {
          // 只预加载 woff2 字体
          return /\.woff2$/.test(file)
        }
        if (type === 'image') {
          // 只预加载重要 images
          return file === 'hero.jpg'
        }
    }
})

const context = {
    title: 'hello ssr',
    meta: `
        <meta name="keywords" content="vue-ssr server-renderer">
        <meta name="description" content="vue-ssr server-renderer">
    `
}

server.get('*', (req, res) => {
    // 这里无需传入一个应用程序，因为在执行 bundle 时已经自动创建过。
    // 现在我们的服务器与应用程序已经解耦！
    // context上下文对象，可选，callback不传时，返回Promise对象
    renderer.renderToString(app, context, (err, html) => {
        if (err) {
            if (err.code === 404) {
                res.status(404).end('Not Found');
            }
            if (err.code === 500) {
                res.status(500).end('Internal Server Error');
            }
        }
        else {
            res.end(html);
        }
    });
});

server.listen(8090);
