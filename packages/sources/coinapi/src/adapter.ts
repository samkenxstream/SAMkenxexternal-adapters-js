import { Builder, Requester, Validator } from '@chainlink/ea-bootstrap'
import {
  DefaultConfig,
  ExecuteFactory,
  ExecuteWithConfig,
  MakeWSHandler,
  AdapterRequest,
  APIEndpoint,
} from '@chainlink/ea-bootstrap'
import { DEFAULT_WS_API_ENDPOINT, makeConfig, NAME } from './config'
import * as endpoints from './endpoint'
import { crypto } from './endpoint'

export const execute: ExecuteWithConfig<DefaultConfig> = async (request, context, config) => {
  return Builder.buildSelector(request, context, config, endpoints)
}

export const endpointSelector = (request: AdapterRequest): APIEndpoint =>
  Builder.selectEndpoint(request, makeConfig(), endpoints)

export const makeExecute: ExecuteFactory<DefaultConfig> = (config) => {
  return async (request, context) => execute(request, context, config || makeConfig())
}

export const makeWSHandler =
  (config?: DefaultConfig): MakeWSHandler =>
  () => {
    const defaultConfig = config || makeConfig()
    const getSubscription = (products: string[]) => ({
      type: 'hello',
      apikey: defaultConfig.apiKey,
      heartbeat: false,
      subscribe_data_type: ['exrate'],
      subscribe_filter_asset_id: products,
    })
    return {
      connection: {
        url: defaultConfig.ws.baseWsURL || DEFAULT_WS_API_ENDPOINT,
      },
      subscribe: (input) => {
        const validator = new Validator(
          input,
          crypto.inputParameters,
          {},
          { shouldThrowError: false },
        )
        if (validator.error) return
        const base = validator.overrideSymbol(NAME, validator.validated.data.base).toLowerCase()
        const quote = validator.validated.data.quote.toLowerCase()
        return getSubscription([base, quote])
      },
      unsubscribe: () => undefined,
      subsFromMessage: (message) =>
        getSubscription([message.asset_id_base, message.asset_id_quote]),
      isError: () => false,
      filter: (message) => message?.type === 'exrate',
      toResponse: (message) => {
        const result = Requester.validateResultNumber(message, ['rate'])
        return Requester.success('1', { data: { result } })
      },
    }
  }
