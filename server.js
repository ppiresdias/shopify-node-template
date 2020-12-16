const Koa = require('koa')
const next = require('next')
const Router = require('@koa/router')
require('isomorphic-fetch')
const dotenv = require('dotenv')
const getSubscriptionUrl = require('./server/getSubscriptionUrl');
const {receiveWebhook, registerWebhook} = require('@shopify/koa-shopify-webhooks')
dotenv.config()

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const {default: createShopifyAuth} = require('@shopify/koa-shopify-auth')
const {verifyRequest } = require('@shopify/koa-shopify-auth')
const session = require('koa-session')
const json = require('koa-json')
const koaBody = require('koa-body')
const serve = require('koa-static')
const cors = require('@koa/cors')

const {SHOPIFY_API_KEY, SHOPIFY_API_SECRET_KEY, HOST} = process.env
// communicate with Shopify
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy')
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy')

let mockDB = []

app.prepare().then(() => {
  const server = new Koa()
  server.use(session({secure:true, sameSite:'none'}, server))
  server.keys = [SHOPIFY_API_SECRET_KEY]
  server.use(json())
  server.use(cors())

  const router = new Router()

  router.get('/a', async (ctx) => {
    await app.render(ctx.req, ctx.res, '/a', ctx.query)
    ctx.respond = false
  })

  // API Routes
  router.get('/api/banners', koaBody(), async (ctx) => {
    ctx.body = {
      status: 200,
      message: 'All The Banners',
      data: mockDB
    }
  })

  router.post('/api/banners', koaBody(), async (ctx) => {
    mockDB.unshift(ctx.request.body)
    console.log(ctx.request.body)
    ctx.body = {
      status: 200,
      message: 'Submitted Banner Data',
      data: mockDB
    }
  })

//   router.all('(.*)', async (ctx) => {
//     await handle(ctx.req, ctx.res)
//     ctx.respond = false
//   })

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200
    await next()
  })

  server.use(router.routes())

  server.use(
      createShopifyAuth({
          apiKey: SHOPIFY_API_KEY,
          secret: SHOPIFY_API_SECRET_KEY,
          scopes: ['read_products', 'write_products', 'read_script_tags', 'write_script_tags', 'read_analytics'],
          async afterAuth(ctx){
              const { shop, accessToken } = ctx.session
              ctx.cookies.set('shopOrigin', shop, {
                httpOnly: false,
                secure: true,
                sameSite: 'none'
              })
              const registration = await registerWebhook({
                address: `${HOST}/webhooks/products/create`,
                topic: 'PRODUCTS_CREATE',
                accessToken:accessToken,
                shop:shop,
                apiVersion: ApiVersion.October20
              })

              if(registration.success){
                console.log('Registered Webhook')
              }else{
                console.log('Failed to register WebHook')
              }

              console.log('Shop: ',`https://${shop}/admin/apps/bannerific`)
              console.log(`https://${shop}/admin/api/${ApiVersion.October20}/webhooks.json`)
              //redirect user to website if standalone app or the embedded app in admin panel
              //ctx.redirect(`https://${shop}/admin/apps/bannerific`)
              await getSubscriptionUrl(ctx, accessToken, shop);
          },
      }),
  );

  server.use(serve(__dirname + '/public')) // server public resources without shopify auth

  // webhooks
  const shopifyWebhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY})

  router.post('/webhooks/products/create', shopifyWebhook, (ctx) => {
    console.log('received webhook: ', ctx.state.webhook)
  })

  server.use(graphQLProxy({version: ApiVersion.October20}))
    // verify shop owner
  server.use(verifyRequest())
  server.use(async (ctx) => {
      await handle(ctx.req, ctx.res)
      ctx.respond = false
      ctx.res.statusCode = 200
      return
  })
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})