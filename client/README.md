# Keymaker Client

### Configuration
Keymaker client depends on an environment variable `KEYMAKER_HTTP_URL` which should be set to the root of keymakers's http server, ex: `http://keymaker.runnable-gamma.com:3008/`

### Usage
```javascript
const keymakerClient = require('@runnable/keymaker-client')
keymakerClient.fetchSSHKeys({
  accessToken: '1234',
  orgId: 'orgId'
})
  .then((sshKeys) => {console.log('SSH Keys! ', sshKeys)})
```
