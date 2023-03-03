import { createSigner } from 'fast-jwt'
import nock from 'nock'
import { createPublicKey, generateKeyPairSync } from 'node:crypto'
import { beforeEach } from 'vitest'
import buildApp from '~/api/app'

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

const signer = createSigner({
  kid: '0',
  algorithm: 'RS256',
  iss: 'https://auth',
  aud: 'some-audience',
  key: privateKey,
  expiresIn: 1000 * 60 * 10
})

const publicKeyJwk = createPublicKey(publicKey).export({ format: 'jwk' })

nock('https://auth')
  .get('/.well-known/jwks.json')
  .reply(200, {
    keys: [{
      alg: 'RS256',
      kty: 'RSA',
      use: 'sig',
      n: publicKeyJwk.n,
      e: publicKeyJwk.e,
      kid: '0'
    }]
  })

beforeEach((ctx) => {
  ctx.getToken = (scope: string[] = []) => {
    return signer({ first_name: 'Test', last_name: 'User', scope: scope.join(' ') })
  }
  ctx.app = buildApp({
    allowedDomains: ['https://auth']
  })
})
