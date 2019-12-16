# Les Utils - Tiny Useful Utils Used By Lesky

Status: not exactly ready for public consumption.

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
- `PromiseUtils.each` (like `async.each` but promise-based)
- `PromiseUtils.series` (like `async.series` but promise-based)

Why not just use `Promise.all`? In many cases, yes, I'm happy to use `Promise.all`. However, if there are MANY promises to be fulfilled, I like to have the option to be notified when each promise as been fulfilled. I found this to a be a relatively simple way to do what I want.