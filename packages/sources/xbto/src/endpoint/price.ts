import { Config, ExecuteWithConfig, InputParameters } from '@chainlink/types'
import { Requester, Validator } from '@chainlink/ea-bootstrap'

export const inputParameters: InputParameters = {
  market: {
    required: false,
    type: 'string',
    options: ['brent', 'wti'],
    default: 'brent',
  },
}

export const supportedEndpoints = ['price']

const endpoints: Record<string, string> = {
  brent: 'api',
  wti: 'api/index_cl',
}

export const execute: ExecuteWithConfig<Config> = async (input, _, config) => {
  const validator = new Validator(input, inputParameters)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id
  const market = validator.validated.data.market
  const url = `https://fpiw7f0axc.execute-api.us-east-1.amazonaws.com/${
    endpoints[market.toLowerCase()]
  }`

  const auth = {
    username: '',
    password: config.apiKey || '',
  }

  const reqConfig = {
    ...config.api,
    url,
    auth,
  }

  const response = await Requester.request(reqConfig)
  response.data.result = Requester.validateResultNumber(response.data, ['index'])
  return Requester.success(jobRunID, response)
}
