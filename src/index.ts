import buildApp from '~/api/app'
import shoppingListRoutes from '~/api/components/shopping-list/routes'

if (!(typeof process.env.AUTH_DOMAIN === 'string')) {
  throw new Error('Mis config')
}
const app = buildApp({
  allowedDomains: [process.env.AUTH_DOMAIN]
})
app.register(shoppingListRoutes, {
  prefix: 'shopping-list'
})

const start = async () => {
  try {
    await app.listen({ port: 3000 })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
