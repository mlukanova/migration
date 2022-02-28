import fs from 'fs'
import util from 'util'
import { getFileContent } from './readFile.js'


const readFile = util.promisify(fs.readdir);
const gentxDir = process.cwd() + '/gentx'

export async function getGentx() {
    let files, transactions =[]
    try {
        files = await readFile(gentxDir);
        await Promise.all(files.map(async (file) => {
            const contents = await getFileContent(`${gentxDir}/${file}`)
            transactions.push(contents)
        }));
        return transactions
    } catch (error) {
        throw new Error('gensises not extracted please run "npm run get-gensis"')
    }
}