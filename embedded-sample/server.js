require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');
// add routing middleware
const Router = require('koa-router')

dotenv.config();

Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SHOPIFY_API_SCOPES.split(),
    HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//,),
    API_VERSION: ApiVersion.October20,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
})

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// add app to server file
app.prepare().then(() => {
    // add koa server
    const server = new Koa()
    const router = new Router()
    server.keys = [Shopify.Context.API_SECRET_KEY]

    const handleRequest = async (ctx) => {
        await handle(ctx.req, ctx.res)
        ctx.respond = false
        ctx.res.statusCode = 200
    }

    router.get('(.*)', handleRequest)

    server.use(router.allowedMethods())
    server.use(router.routes())
})
