import * as fs from 'fs'
import * as path from 'path'


function assembleDataFile() {
  const rootDir = path.join(__dirname, '../data')
  const files = fs.readdirSync(rootDir)
  
  const result: any[] = []
  files.forEach(file => {
    const filePath = path.join(rootDir, file)
    const data = require(filePath)
    result.push(data)
  });

  const distDir = path.join(__dirname, '../dist')
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir)
  }

  const outputFile = path.join(distDir, 'states_data.json')
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 4), { encoding: 'utf8' })
}

assembleDataFile()
