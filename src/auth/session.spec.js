import mocha from 'mocha'
import { expect } from 'chai'
import { hasRequiredEnvironmentVariables } from '../test/vars'

hasRequiredEnvironmentVariables(
  ['AUTH0_CLIENT_SECRET', 'REDIS_HOST', 'REDIS_PASSWORD'],
  'authentication/session'
)

// EXAMPLE TEST BLOCK
// describe('test name, function, etc', () => {
//   it('should do something', () => {
//     expect(1).to.equal(1)
//   })
// })
