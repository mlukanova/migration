import fs from 'fs'
import { getFileContent } from './utils/readFile';

const gentxFolder = './gentx/';

const files = fs.readdir(testFolder, (err, files) => files);

const contents = files.map(file => {
    = await getFileContent(`./${gentxFolder}/${file}`)
})

function validateContents () {
    
}