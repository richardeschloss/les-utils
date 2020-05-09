"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Svc = Svc;

var _rexter = _interopRequireDefault(require("../rexter"));

var _querystring = _interopRequireDefault(require("querystring"));

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Svc() {
  const ig = (0, _rexter.default)({
    hostname: 'www.instagram.com'
  });
  const graphIG = (0, _rexter.default)({
    hostname: 'graph.instagram.com'
  });
  const userIG = (0, _rexter.default)({
    hostname: 'www.instagram.com'
  });

  let _accessToken;

  return {
    async authorize({
      client_id,
      redirect_uri
    }) {
      const query = _querystring.default.stringify({
        client_id,
        redirect_uri,
        response_type: 'code',
        scope: 'user_profile,user_media'
      });

      const url = `https://www.instagram.com/oauth/authorize?${query}`;
      (0, _child_process.exec)(`chromium "${url}"`);
    },

    async createAccessToken({
      client_id,
      client_secret,
      code,
      redirect_uri
    }) {
      const postData = {
        client_id,
        client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri
      };
      return await userIG.request({
        method: 'POST',
        path: `/oauth/access_token`,
        outputFmt: 'json',
        postData
      });
    },

    async exchangeToken({
      client_secret,
      access_token
    }) {
      const query = _querystring.default.stringify({
        client_secret,
        access_token,
        grant_type: 'ig_exchange_token'
      });

      return await graphIG.request({
        path: `/access_token?${query}`,
        outputFmt: 'json'
      });
    },

    async getMe({
      fields = 'id',
      access_token = _accessToken
    }) {
      const query = _querystring.default.stringify({
        fields,
        access_token
      });

      return await graphIG.request({
        path: `/me?${query}`,
        outputFmt: 'json'
      });
    },

    async getUser({
      user_id,
      fields = 'user_profile, user_media',
      access_token = _accessToken
    }) {
      const data = {
        access_token,
        fields
      };

      const query = _querystring.default.stringify(data);

      return await graphIG.request({
        path: `/${user_id}?${query}`,
        outputFmt: 'json'
      });
    },

    async getUserMediaWeb({
      username
    }) {
      return await ig.request({
        path: `/${username}/?__a=1`,
        outputFmt: 'json'
      });
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
      };

      const query = _querystring.default.stringify(data);

      return await graphIG.request({
        path: `/${user_id}/media?${query}`,
        outputFmt: 'json',
        headers: {
          'Accept-Encoding': 'gzip'
        }
      });
    },

    async getAllUserMediaWeb({
      username,
      limit
    }) {
      async function getEdges(id, after) {
        const query_hash = '9dcf6e1a98bc7f6e92953d5a61027b98';
        const first = limit || 50;
        const variables = encodeURIComponent(JSON.stringify({
          id,
          first,
          after
        }));
        const path = `/graphql/query/?query_hash=${query_hash}&variables=${variables}`;
        console.time('requestEdges');
        const {
          data
        } = await ig.request({
          path,
          outputFmt: 'json'
        });
        console.timeEnd('requestEdges');
        const {
          page_info,
          edges
        } = data.user.edge_owner_to_timeline_media;
        allEdges.push(...edges);

        if ((!limit || limit && allEdges.length < limit) && page_info.has_next_page) {
          await getEdges(id, page_info.end_cursor);
        }
      }

      const allEdges = [];
      const r = await this.getUserMediaWeb({
        username
      });
      const {
        id
      } = r.graphql.user;
      await getEdges(id);
      return allEdges;
    },

    async geAllUserMedia({
      user_id,
      access_token,
      ...mediaQuery
    }) {
      const {
        media_count
      } = await this.getUser({
        fields: 'media_count',
        user_id,
        access_token
      });
      const resp = await this.getUserMedia({
        limit: media_count,
        user_id,
        access_token,
        ...mediaQuery
      });
      return resp;
    }

  };
}