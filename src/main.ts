import * as core from '@actions/core'
import changelog from './changelog'

async function run(): Promise<void> {
  try {
    const changelogFileName = core.getInput('changelog_file_name')
    const changelogFoldName = core.getInput('changelog_fold_name')
    const encoding = core.getInput('encoding')

    core.debug(`Start update changelog ${new Date().toTimeString()}`)
    await changelog({changelogFileName, changelogFoldName, encoding})
    core.debug(`Finished update changelog${new Date().toTimeString()}`)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
