import { writeFileSync } from 'fs'
import test from 'ava'
import { Svc } from '@/src/rexters/instagram'

/* 
Notes: process for getting a user's photos and info

1. Add that user to "Instagram Test Users" (their profile must be public)

2. They must accept the invite on the *web* interface: (not avail in mobile)
 Settings --> Apps and Websites --> Tester invites --> Accept

3. Youre website presents the authorization window...you format the url based on YOUR app's
"Instagram app ID" and YOUR redirect uri (i.e., need a server, https; http won't work)

4. On their end, they click the link and continue / accept that invite and then they'll be
redirected to your redirect uri. The redirect uri will contain the auth code. Your server's
request handler can get that code from "req.query.code"

5. Use that auth code to create/get an *access token* (use svc.createAccessToken).
NOTE: that auth code can only be used once per successful auth.

6. If you need access longer than 1-2 hours, you need to exchange that token for a longer lived token
--> Ok, works. Before it wasn't. After exchanging for the new token, only use that token...trash the old
short-lived one. Don't accidentally use the old short one for subsequent requests. (duh)

7. That token is probably best stored in a database rather than as env vars. Then you can look up the token by user
Just don't let it leak into client-side code.

*/

const svc = Svc({})

let authResp = {
  access_token: process.env.IG_ACCESS_TOKEN,
  access_token_long: process.env.IG_ACCESS_TOKEN_LONG,
  user_id: process.env.IG_USER_ID
}

test('Authorize', async (t) => {
  // Manual process in browser (you would have the user click this link to open the auth window...)
  // Auth window would redirect to your "/login" route on success. you'd have to capture the "code" in the
  // url params that get sent
  await svc.authorize({
    client_id: process.env.IG_APP_ID,
    redirect_uri: process.env.IG_AUTH_REDIRECT
  })
  t.pass()
})

test('Create access token', async (t) => {
  // IG_AUTH_CODE is only good once per successful auth
  authResp = await svc.createAccessToken({
    client_id: process.env.IG_APP_ID,
    client_secret: process.env.IG_APP_SECRET,
    code: process.env.IG_AUTH_CODE,
    redirect_uri: process.env.IG_AUTH_REDIRECT
  })
  console.log(authResp)
  t.pass()
})

test('Exchange Token', async (t) => {
  authResp = await svc.exchangeToken({
    client_secret: process.env.IG_APP_SECRET,
    access_token: process.env.IG_ACCESS_TOKEN
  })
  console.log(authResp)
  t.pass()
})

test('Get Me', async (t) => {
  const r = await svc.getMe({ access_token: authResp.access_token_long })
  console.log('r', r)
  t.pass()
})

test('Get User', async (t) => {
  const r = await svc.getUser({
    user_id: authResp.user_id,
    access_token: authResp.access_token_long,
    fields: 'id,username,media_count'
  })
  console.log('user info', r)
  t.pass()
})

test('Get User Media', async (t) => {
  const resp = await svc.getUserMedia({
    user_id: authResp.user_id,
    access_token: authResp.access_token_long,
    fields: 'id,caption,timestamp,media_url,thumbnail_url,permalink'
  })
  const igCache = '/tmp/igMedia.json'
  writeFileSync(igCache, JSON.stringify(resp))
  console.log('user media', resp)
  t.pass()
})

test.only('Get All User Media', async (t) => {
  const resp = await svc.geAllUserMedia({
    user_id: authResp.user_id,
    access_token: authResp.access_token_long,
    fields: 'id,caption,timestamp,media_url,thumbnail_url,permalink'
  })
  const igCache = '/tmp/igMedia_all.json'
  writeFileSync(igCache, JSON.stringify(resp))
  console.log('user media', resp)
  t.pass()
})

/* ------ Works with a BUT.... ---- */
// Works as of 05/09/2020 but may not be reliable or may get
// rate limited...this uses the IG web api.
// (Plus, the official api appears to faster)
test('Get User Media Web', async (t) => {
  const username = process.env.IG_OTHER_USER
  const resp = await svc.getUserMediaWeb({ username })
  const igCache = `/tmp/${username}_igMedia_12.json`
  writeFileSync(igCache, JSON.stringify(resp))
  console.log('user media', resp)
  t.pass()
})

test('Get All User Media Web', async (t) => {
  const username = process.env.IG_OTHER_USER
  const resp = await svc.getAllUserMediaWeb({
    username
  })
  const igCache = `/tmp/${process.env.IG_OTHER_USER}_igMedia_all.json`
  writeFileSync(igCache, JSON.stringify(resp))
  console.log('user media', resp.length)
  t.pass()
})
