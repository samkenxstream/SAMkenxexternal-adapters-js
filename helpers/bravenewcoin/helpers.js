const { Requester } = require('@chainlink/external-adapter')

const host = 'bravenewcoin.p.rapidapi.com'
const apiHeaders = {
  'x-rapidapi-host': host,
  'x-rapidapi-key': process.env.API_KEY
}

const authenticate = async () => {
  const response = await Requester.request({
    method: 'POST',
    url: `https://${host}/oauth/token`,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      useQueryString: true,
      ...apiHeaders
    },
    data: {
      audience: 'https://api.bravenewcoin.com',
      client_id: process.env.CLIENT_ID,
      grant_type: 'client_credentials'
    }
  })
  return response.data.access_token
}

const getAssetId = async (symbol) => {
  const response = await Requester.request({
    url: `https://${host}/asset`,
    headers: {
      'content-type': 'application/octet-stream',
      useQueryString: true,
      ...apiHeaders
    },
    params: {
      status: 'ACTIVE',
      symbol
    }
  })
  return response.data.content[0].id
}

const convert = async (token, baseAssetId, quoteAssetId) => {
  const url = `https://${host}/market-cap`
  const path = ['content', 0, 'price']
  const base = await Requester.request({
    url,
    headers: {
      ...apiHeaders,
      authorization: `Bearer ${token}`,
      useQueryString: true
    },
    params: {
      assetId: baseAssetId
    }
  })
  const basePrice = Requester.validateResultNumber(base.data, path)
  if (quoteAssetId.toUpperCase() === 'USD') {
    const result = basePrice
    return {
      status: 200,
      data: { result },
      result
    }
  }
  const quote = await Requester.request({
    url,
    headers: {
      ...apiHeaders,
      authorization: `Bearer ${token}`,
      useQueryString: true
    },
    params: {
      assetId: quoteAssetId
    }
  })
  const quotePrice = Requester.validateResultNumber(quote.data, path)
  const result = basePrice / quotePrice
  return {
    status: 200,
    data: { result },
    result
  }
}

exports.host = host
exports.apiHeaders = apiHeaders
exports.authenticate = authenticate
exports.convert = convert
exports.getAssetId = getAssetId
