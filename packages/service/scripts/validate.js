/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

function validate(options, args) {
	Object.entries(options).forEach(([argName, options]) => {
		const parsedArgValue = args[argName]
		if (
			(options.required && !parsedArgValue) ||
			(parsedArgValue && typeof parsedArgValue !== options.type)
		) {
			throw new TypeError(
				`Invalid value for ${argName} flag. Expecting type ${options.type}.`
			)
		}
	})
}

module.exports = validate
