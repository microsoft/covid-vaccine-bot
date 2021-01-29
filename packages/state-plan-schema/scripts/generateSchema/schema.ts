/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as path from 'path'
import * as TJS from 'typescript-json-schema'

// optionally pass argument to schema generator
const settings: TJS.PartialArgs = {
	required: true,
}

// optionally pass ts compiler options
const compilerOptions: TJS.CompilerOptions = {
	strictNullChecks: true,
}

// optionally pass a base path
const basePath = path.join(__dirname, '../src')

const program = TJS.getProgramFromFiles(
	[path.resolve('src/index.ts')],
	compilerOptions,
	basePath
)

const generator = TJS.buildGenerator(program, settings)
export const Region = generator!.getSchemaForSymbol('Region')
export const VaccinationPlan = generator!.getSchemaForSymbol('VaccinationPlan')
export const RolloutPhase = generator!.getSchemaForSymbol('RolloutPhase')
export const Link = generator!.getSchemaForSymbol('Link')
