const Koa = require('koa');
const proxy = require('koa-better-http-proxy');
const koaStatic = require('koa-static');
const path = require('path');
const argv = require('yargs').argv;

const app = new Koa();
const _staticMiddle = koaStatic(path.resolve(__dirname, "src/"));
const _proxyMiddle = proxy("homo.fudan.edu.cn",{
    // parseReqBody:false,
    https: true
});



app.use( (ctx,next)=>{


    // ctx.body = "asdfadsf"


    //return _staticMiddle(ctx,next);

    const path = ctx.path;
    let url = ctx.url;


    if(path=="/"  || /\.htm/.test(path)){
        return _proxyMiddle(ctx, next);
    }else{
        if (/\?\$\$$/.test(url)) {
            url = url.replace(/\?\$\$$/, "");
            let _path = url.split("/").splice(-2).join("/");
            ctx.path = _path;
            return _staticMiddle(ctx,next);
        }else{
            return _proxyMiddle(ctx, next);
        }
    }
})

app.listen(8087);