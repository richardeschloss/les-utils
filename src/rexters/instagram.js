import Rexter from '@/src/rexter'
import querystring from 'querystring'
import { exec } from 'child_process'

function Svc() {
  const graphIG = Rexter({
    hostname: 'graph.instagram.com'
  })

  const userIG = Rexter({
    hostname: 'www.instagram.com'
  })
  let _accessToken

  return {
    async authorize({ client_id, redirect_uri }) {
      const query = querystring.stringify({
        client_id,
        redirect_uri,
        response_type: 'code',
        scope: 'user_profile,user_media'
      })
      const url = `https://www.instagram.com/oauth/authorize?${query}`
      exec(`chromium "${url}"`)
    },

    async createAccessToken({ client_id, client_secret, code, redirect_uri }) {
      const postData = {
        client_id,
        client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri
      }
      return await userIG.request({
        method: 'POST',
        path: `/oauth/access_token`,
        outputFmt: 'json',
        postData
      })
    },

    async exchangeToken({ client_secret, access_token }) {
      const query = querystring.stringify({
        client_secret,
        access_token,
        grant_type: 'ig_exchange_token'
      })
      return await graphIG.request({
        path: `/access_token?${query}`,
        outputFmt: 'json'
      })
    },

    async getMe({ fields = 'id', access_token = _accessToken }) {
      const query = querystring.stringify({
        fields,
        access_token
      })
      return await graphIG.request({
        path: `/me?${query}`,
        outputFmt: 'json'
      })
    },

    async getUser({
      user_id,
      fields = 'user_profile, user_media',
      access_token = _accessToken
    }) {
      const data = {
        access_token,
        fields
      }
      const query = querystring.stringify(data)
      return await graphIG.request({
        path: `/${user_id}?${query}`,
        outputFmt: 'json'
      })
    },

    async getUserMedia({
      user_id,
      access_token = _accessToken,
      fields = 'id, media_url, thumbnail_url',
      limit = '25'
    }) {
      const data = {
        access_token,
        fields,
        limit
      }
      const query = querystring.stringify(data)
      return await graphIG.request({
        path: `/${user_id}/media?${query}`,
        outputFmt: 'json',
        headers: {
          'Accept-Encoding': 'gzip'
        }
      })
    },

    async geAllUserMedia({ user_id, access_token, ...mediaQuery }) {
      const { media_count } = await this.getUser({
        fields: 'media_count',
        user_id,
        access_token
      })
      const resp = await this.getUserMedia({
        limit: media_count,
        user_id,
        access_token,
        ...mediaQuery
      })
      return resp
    }
  }
}

export { Svc }
