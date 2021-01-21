import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import { State, createValidator } from './dataFileSchema'
import { ValidationError } from 'jsonschema'

/**
 * Validate that state-level data files adhere to the schema
 */
function validateDataFiles() {
	const validator = createValidator()
	const root = path.join(__dirname, '../data/states')
	const files = fs.readdirSync(root)
	let errorCount: number = 0
	let schemaValidationErrors: ValidationError[] = []

	// Validate each state file
	files
		.filter((f) => f.endsWith('.json'))
		.forEach((file) => {
			const filePath = path.join(root, file)
			const data = require(filePath)
			const validationResult = validator.validate(data, State)

			// handle results
			if (validationResult.errors.length > 0) {
				errorCount += validationResult.errors.length
				schemaValidationErrors.push(...validationResult.errors)
				console.log(
					chalk.red(`❌ ${file} has ${validationResult.errors.length} errors`)
				)
			} else {
				console.log(chalk.green(`✔ ${file}`))
			}
		})

	if (errorCount > 0) {
		console.log(schemaValidationErrors)
		console.log('💥 ' + chalk.red(`${errorCount} errors`))
		process.exit(1)
	} else {
		console.log('🚀 ' + chalk.green(`all files passed schema validation`))
	}
}
validateDataFiles()
