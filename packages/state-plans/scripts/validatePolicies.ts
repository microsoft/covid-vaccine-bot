/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as path from 'path'
import * as chalk from 'chalk'
import { ValidationError } from 'jsonschema'
import { getFiles, DATA_DIR } from './getFiles'
import { readCsvFile } from './readCsvFile'
import { validateRegionInfo, validateVaccinationPlan } from './schema'
import { DIST_DIR } from './createDistDir'

const LOCALIZATION_TABLE_PATH = path.join(DIST_DIR, 'localization.csv')
const POLICY_DIR = path.join(DATA_DIR, 'policies')

/**
 * Validate that state-level data files adhere to the schema
 */
function validateDataFiles() {
	const validStringIds = getValidStringIds()

	let errorCount = 0
	const schemaValidationErrors: ValidationError[] = []
	const linkErrors: string[] = []

	// Validate data files
	getFiles(DATA_DIR, (f) => f === 'info.json').forEach(validateStateInfo)
	getFiles(DATA_DIR, (f) => f === 'vaccination.json').forEach(
		validateVaccinationInfo
	)

	function validateStateInfo(file: string) {
		/* eslint-disable-next-line @typescript-eslint/no-var-requires */
		const data = require(file)
		const validationResult = validateRegionInfo(data)
		schemaValidationErrors.push(...validationResult.errors)
		errorCount += validationResult.errors.length

		// handle results
		if (validationResult.errors.length === 0) {
			console.log(chalk.green(`✔ ${file}`))
		}
		if (validationResult.errors.length > 0) {
			console.log(
				chalk.red(
					`❌ ${file} has ${validationResult.errors.length} schema errors`
				)
			)
		}
	}

	function validateVaccinationInfo(file: string) {
		/* eslint-disable-next-line @typescript-eslint/no-var-requires */
		const data = require(file)
		const validationResult = validateVaccinationPlan(data)
		const dataLinkErrors: string[] = []
		checkStringIds(data, validStringIds, dataLinkErrors)
		linkErrors.push(...dataLinkErrors)
		schemaValidationErrors.push(...validationResult.errors)
		errorCount += dataLinkErrors.length + validationResult.errors.length

		// handle results
		if (validationResult.errors.length === 0 && dataLinkErrors.length === 0) {
			console.log(chalk.green(`✔ ${file}`))
		}
		if (validationResult.errors.length > 0) {
			console.log(
				chalk.red(
					`❌ ${file} has ${validationResult.errors.length} schema errors`
				)
			)
		}
		if (dataLinkErrors.length > 0) {
			console.log(chalk.red(`❌ ${file} has ${dataLinkErrors} linker errors`))
		}
	}

	if (errorCount > 0) {
		if (schemaValidationErrors.length > 0) {
			console.log(schemaValidationErrors)
		}
		if (linkErrors.length > 0) {
			console.log(linkErrors)
		}
		console.log('💥 ' + chalk.red(`${errorCount} errors`))
		process.exit(1)
	} else {
		console.log('🚀 ' + chalk.green(`all files passed validation`))
	}
}
validateDataFiles()

function getValidStringIds(): Set<string> {
	const records: Record<string, string>[] = []
	readCsvFile(LOCALIZATION_TABLE_PATH, records)

	const recordIds = records.map((r) => r['String ID'])
	const result = new Set<string>()
	recordIds.forEach((r) => result.add(r))
	if (result.size !== recordIds.length) {
		console.log(chalk.yellow('duplicate ids detected'))
	}
	return result
}

function checkStringIds(
	vaccinationPlan: Record<string, any>,
	validStrings: Set<string>,
	errors: string[]
): void {
	vaccinationPlan.phases.forEach((phase: Phase) => {
		phase.qualifications.forEach((qual: Qualification) => {
			if (!validStrings.has(qual)) {
				errors.push(`no defined string, "${qual}"`)
			}
		})
	})
	if (vaccinationPlan.regions != null) {
		vaccinationPlan.regions.forEach((region: Region) => {
			checkStringIds(region, validStrings, errors)
		})
	}
}

type Phase = any
type Qualification = string
type Region = any
