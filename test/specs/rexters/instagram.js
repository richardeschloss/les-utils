import { writeFileSync } from 'fs'
import test from 'ava'
import { Svc } from '@/src/rexters/instagram'

const svc = Svc({})

let authResp = {
  access_token: process.env.IG_ACCESS_TOKEN,
  access_token_long: process.env.IG_ACCESS_TOKEN_LONG, // Not working for some reason
  user_id: process.env.IG_USER_ID
}

test('Authorize', async (t) => {
  // Manual process in browser
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
  const r = await svc.getMe({ access_token: authResp.access_token })
  console.log('r', r)
  t.pass()
})

test('Get User', async (t) => {
  const r = await svc.getUser({
    user_id: authResp.user_id,
    access_token: authResp.access_token,
    fields: 'id,username,media_count'
  })
  console.log('user info', r)
  t.pass()
})

test('Get User Media', async (t) => {
  const query = Object.assign({}, authResp)
  query.fields = 'id,caption,timestamp,media_url,thumbnail_url,permalink'
  const resp = await svc.getUserMedia(query)
  const igCache = '/tmp/igMedia.json'
  writeFileSync(igCache, JSON.stringify(resp))
  console.log('user media', resp)
  t.pass()
})

test('Get User Media Web', async (t) => {
  const resp = await svc.getUserMediaWeb({
    username: process.env.IG_OTHER_USER
  })
  const igCache = '/tmp/swimwearlicious_igMedia_12.json'
  writeFileSync(igCache, JSON.stringify(resp))
  console.log('user media', resp)
  t.pass()
})

test.only('Get All User Media Web', async (t) => {
  const username = process.env.IG_OTHER_USER
  const resp = await svc.getAllUserMediaWeb({
    username
  })
  const igCache = `/tmp/${process.env.IG_OTHER_USER}_igMedia_all.json`
  writeFileSync(igCache, JSON.stringify(resp))
  console.log('user media', resp.length)
  t.pass()
})

test('Get All User Media', async (t) => {
  const query = Object.assign({}, authResp)
  query.fields = 'id,caption,timestamp,media_url,thumbnail_url,permalink'
  const resp = await svc.geAllUserMedia(query)
  const igCache = '/tmp/igMedia_all.json'
  writeFileSync(igCache, JSON.stringify(resp))
  console.log('user media', resp)
  t.pass()
})
