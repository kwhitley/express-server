import mocha from 'mocha'
import { expect } from 'chai'
import { hasRequiredEnvironmentVariables } from '../test/vars'

hasRequiredEnvironmentVariables(
  ['AUTH0_AUDIENCE', 'AUTH0_CLIENT_ID', 'AUTH0_DOMAIN', 'ARUNDO_CLAIM_SPACE', 'ARUNDO_WS_SERVER'],
  'authentication/index'
)

// EXAMPLE TEST BLOCK
// describe('test name, function, etc', () => {
//   it('should do something', () => {
//     expect(1).to.equal(1)
//   })
// })
