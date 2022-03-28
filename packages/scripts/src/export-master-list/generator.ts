import { buildMasterListTable, tableHeaders } from '../generate-master-list/generator'

export const exportMasterList = async (verbose = false): Promise<void> => {
  try {
    const { allAdaptersTable } = await buildMasterListTable(verbose)

    const fullTable = [tableHeaders, ...allAdaptersTable]
    console.log({ fullTable })
  } catch (error) {
    console.error({ error: error.message, stack: error.stack })
    throw Error(error)
  }
}
