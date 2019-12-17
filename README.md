[![npm](https://img.shields.io/npm/v/les-utils)](https://www.npmjs.com/package/les-utils)
[![npm](https://img.shields.io/npm/dt/les-utils)](https://www.npmjs.com/package/les-utils)
[![](https://gitlab.com/richardeschloss/les-utils/badges/master/pipeline.svg)](https://gitlab.com/richardeschloss/les-utils)
[![](https://gitlab.com/richardeschloss/les-utils/badges/master/coverage.svg)](https://gitlab.com/richardeschloss/les-utils)
[![NPM](https://img.shields.io/npm/l/les-utils)](https://github.com/richardeschloss/les-utils/blob/development/LICENSE)

# Les Utils - Les Utils (Less but still powerful)

This project was originally created to help support [lesky](https://github.com/richardeschloss/les). Originally, these utils were confined to that project, but since these utils can be nifty and reusable, I thought it would be wise to separate them out into their own project. That's exactly what this is. `les-utils` is less but versatile. With any luck, `les-utils` will become even less as the ES language features improve. 

## Installation:

1. First install globally
> npm i -g les-utils

2. Then to use in a project folder link to it:
> npm link les-utils

## Usage: 
``` 
import { LangUtils, PromiseUtils, Rexter, StringUtils } from 'les-utils'
// Currently exposed utils
// Read below for further explanation

```

## Current utilities:

1. Rexter: Like a good dog, fetches and requests things...sometimes in batch. Promise-based.

a) Example: (single request)
```
const rexter = Rexter({ host: api.host.com })
const resp = await rexter.request({ path: '/some/data/123' })
```

b) Example: (batch request)
```
const rexter = Rexter({ host: api.host.com, auth: 'user:pass' }) // in case auth is needed
const userIds = ['123', '453', '897']
const resp = await rexter.requestMany({
  items: userIds
  pathTemplate: '/some/data/[ITEM]', // [ITEM] will be replaced by each userId
  outputFmt: 'json', // Can be 'json', 'string', or 'xml' (default is buffered byte stream)
  notify({ data }) { // Set up an optional per-item notification handler 
    const { item, resp } = data
    // If interested, handle each items response as it comes in
    // otherwise, it's sufficient to simply wait for the promise to resolve
  }
})
```

2. Language: 
- Gets a list of supported languages from the specified service (currently supported services are Yandex and IBM)
- Translates text using those APIs. (IBM and Yandex require free API keys, but the free limits are pretty good!)

3. String:
- ParseXML (promise-based)
- Camelcase
- Startcase 

4. Promises:
- `PromiseUtils.delay` (a promise-based delay method so you can stop calling setTimeout. Easy!)
- `PromiseUtils.each` (similar to `async.each` but promise-based and more versatile)
- `PromiseUtils.series` (similar to `async.series` but promise-based and more versatile)

a) Example:
```
const items = ['item1', 'item2']
const resp = await PromiseUtils.each({
  items,
  async handleItem() {
    await PromiseUtils.delay(100)
    return 'ok'
  },
  notify({ evt, data }) {
    const { item, resp } = data
    // do something with item's resp if you want
  }
})
// resp = { item1: 'ok', item2: 'ok' }
```


Why not just use `Promise.all`? In many cases, yes, I'm happy to use `Promise.all`. However, if there are MANY promises to be fulfilled, I like to have the option to be notified when each promise as been fulfilled. I found this to a be a relatively simple way to do what I want.