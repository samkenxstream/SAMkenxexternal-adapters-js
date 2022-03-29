import { AdapterRequest, APIEndpoint, Config, Execute } from '@chainlink/types'
import { withCacheKey } from '../../src/lib/middleware/cache-key'

describe('Cache key middleware', () => {
  it('adds a deterministic cache key to the debug object', async () => {
    const request: AdapterRequest = {
      id: '1',
      data: {
        number: 123.4,
        maxAge: 444,
        from: 'btc',
        to: 'eth',
        overrides: {
          btc: 'bitcoin',
        },
        tokenOverrides: {
          eth: 'test',
        },
        includes: {},
        endpoint: 'random',
        batchPropString: 'batchString',
        batchPropArray: ['str1', 'str2'],
      },
    }
    const response = {
      result: 123.4,
      jobRunID: '1',
      statusCode: 200,
      data: {
        number: 123.4,
      },
    }

    const endpointExecute = async (r) => {
      expect(r).toEqual({
        ...request,
        debug: {
          cacheKey: 'jpONzVqlW1OiMxz1nihoHY4Pzr8=',
          batchKey: 'jpONzVqlW1OiMxz1nihoHY4Pzr8=',
        },
      })
      return response
    }

    const apiEndpoint: APIEndpoint<Config> = {
      supportedEndpoints: ['test'],
      inputParameters: {
        from: {
          type: 'string',
        },
        to: {
          type: 'string',
        },
        batchPropString: {
          type: 'string',
        },
        batchPropArray: {
          type: 'array',
        },
      },
      execute: endpointExecute,
      batchablePropertyPath: [
        {
          name: 'batchPropString',
        },
        {
          name: 'batchPropArray',
        },
      ],
    }

    const middleware = withCacheKey(() => apiEndpoint)
    const execute = await middleware(apiEndpoint.execute as Execute, {})
    await execute(request, {})
  })
})
