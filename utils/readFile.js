import fs from 'fs'
import util from 'util'
import path from 'path'

const readFile = util.promisify(fs.readFile);

export async function getFileContent(file) {
    const data = await readFile(path.join(process.cwd(), file))
    return JSON.parse(data)
}