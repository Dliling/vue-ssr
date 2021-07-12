const Vue = require('vue');
const server = require('express')();
const fs = require('fs');

const renderer = require('vue-server-renderer').createRenderer({
    template: fs.readFileSync('../index.template.html', 'utf-8')
});

const context = {
    title: 'hello ssr',
    meta: `
        <meta name="keywords" content="vue-ssr server-renderer">
        <meta name="description" content="vue-ssr server-renderer">
    `
}

server.get('*', (req, res) => {
    const app = new Vue({
        data: {
            url: req.url
        },
        template: `<div>hello {{url}}</div>`
    });
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
