import * as fs from 'fs'
import * as path from 'path'

const DIST_DIR = path.join(__dirname, '../dist')
const STATE_PLAN_DIR = path.join(__dirname, '../data/state_plans')
const STATE_PLAN_FILES = fs.readdirSync(STATE_PLAN_DIR)
const statePlanPath = (file: string): string => path.join(STATE_PLAN_DIR, file)
const ALL_STATES_OUTPUT_FILE_PATH = path.join(DIST_DIR, 'states_data.json')

function assembleDataFile() {
	const result: any[] = []
	STATE_PLAN_FILES.forEach((file) => {
		const filePath = statePlanPath(file)
		const data = require(filePath)
		result.push(data)
	})

	createOutputDirectory()

	fs.writeFileSync(
		ALL_STATES_OUTPUT_FILE_PATH,
		JSON.stringify(result, null, 4),
		{
			encoding: 'utf8',
		}
	)
}

function createOutputDirectory(): void {
	if (!fs.existsSync(DIST_DIR)) {
		fs.mkdirSync(DIST_DIR)
	}
}

assembleDataFile()
