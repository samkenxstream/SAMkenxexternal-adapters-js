import { InputParameters, Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, ExecuteFactory, Config } from '@chainlink/ea-bootstrap'
import { makeConfig, DEFAULT_ENDPOINT } from './config'
import { historical, TInputParameters as EndpointInputParams } from './endpoint'

export type TInputParameters = { endpoint: string }
export const inputParams: InputParameters<TInputParameters> = {
  endpoint: false,
}

export type TInputParams = EndpointInputParams & TInputParameters

export const execute: ExecuteWithConfig<Config> = async (request, context, config) => {
  const validator = new Validator<TInputParameters>(request, inputParams)

  Requester.logConfig(config)

  const endpoint = validator.validated.data.endpoint || DEFAULT_ENDPOINT

  switch (endpoint) {
    default: {
      return await historical.execute(request, context, config)
    }
  }
}

export const makeExecute: ExecuteFactory<Config, TInputParams> = (config) => {
  return async (request, context) => execute(request, context, config || makeConfig())
}
