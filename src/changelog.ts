import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'

import {INewLogsPromise, IChangeLog, IGetOldLogs, IMountLog} from './interfaces'

const fsPromises = fs.promises

const newLogsPromise = async ({
  allUpdates,
  fullPath,
  encoding
}: INewLogsPromise) => {
  const texts = allUpdates.map(async (filename: string) => {
    const file = `${fullPath}/${filename}`
    const content = await fsPromises.readFile(file, encoding)
    return `\n- [${filename}] ${content}`
  })

  return await Promise.all(texts)
}

const getOldlogs = async ({changelogFileName, encoding}: IGetOldLogs) => {
  return await fsPromises.readFile(changelogFileName, encoding)
}

const mountLog = ({verion, newLogs, oldLogs}: IMountLog) => {
  let fullLogs = `# ${verion}\n\n## Alterações\n`.concat(newLogs)
  fullLogs += '\n---\n\n'
  fullLogs += oldLogs
  return fullLogs
}

export default async function changelog({
  changelogFoldName,
  changelogFileName,
  encoding
}: IChangeLog): Promise<void> {
  const changelogFolder = path.resolve(changelogFoldName)

  core.debug(`Path changelog folder ${changelogFolder}`)

  try {
    const changelogVersion = await fsPromises.readdir(changelogFolder)
    const fullPath = `${changelogFolder}/${changelogVersion[0]}`

    core.debug(`Fullpath changelog folder ${fullPath}`)

    const allUpdates = await fsPromises.readdir(fullPath)

    const newLogs = await newLogsPromise({allUpdates, fullPath, encoding})

    core.debug(`New log add ${newLogs}`)

    const oldLogs = await getOldlogs({changelogFileName, encoding})
    const fullLogs = mountLog({verion: changelogVersion[0], newLogs, oldLogs})

    await fsPromises.writeFile(
      path.resolve(changelogFileName),
      fullLogs,
      encoding
    )
    await fsPromises.rm(fullPath, {recursive: true, force: true})

    core.debug(`Changelog success ${changelogVersion[0]}`)
    core.setOutput('changelog_version', changelogVersion[0])
  } catch (e: any) {
    throw new Error(e.message)
  }
}
