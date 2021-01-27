import * as fs from 'fs'
import * as path from 'path'

import { getFiles, DATA_ROOT } from './getFiles'

function migrate() {
	const infoFiles = getFiles(DATA_ROOT, (f) => f === 'info.json')
	infoFiles.forEach((file) => {
		const data = require(file)
		if (!data.type) {
			data.type = 'state'
		}
		fs.writeFileSync(file, JSON.stringify(data, null, 4), { encoding: 'utf8' })
	})
}
migrate()
