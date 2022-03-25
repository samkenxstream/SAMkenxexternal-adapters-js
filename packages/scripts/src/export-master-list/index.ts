import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import { exportMasterList } from './generator'

export async function main(): Promise<void | string> {
  try {
    // Define CLI options
    const commandLineOptions = [
      {
        name: 'verbose',
        alias: 'v',
        type: Boolean,
        description: 'Include extra logs for debugging',
      },
      { name: 'help', alias: 'h', type: Boolean, description: 'Display usage guide' },
    ]
    const options = commandLineArgs(commandLineOptions)

    // Generate usage guide
    if (options.help) {
      const usage = commandLineUsage([
        {
          header: 'Master List Exporter Script',
          content:
            'This script is run from the root of the external-adapter-js/ repo to export the Master List to a valid Airtable.',
        },
        {
          header: 'Options',
          optionList: commandLineOptions,
        },
        {
          content:
            'Source code: {underline https://github.com/smartcontractkit/external-adapters-\njs/packages/scripts/src/export-master-list/}',
        },
      ])
      console.log(usage)
      return
    }

    console.log('Exporting master adapter list to Airtable.')

    await exportMasterList(options.verbose)

    console.log(`Master adapter list exported successfully.`)
    process.exit(0)
  } catch (error) {
    console.error({ error: error.message, stack: error.stack })
    process.exit(1)
  }
}

main()
