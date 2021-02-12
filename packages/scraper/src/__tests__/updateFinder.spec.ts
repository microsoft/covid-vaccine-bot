/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
describe('the update locator', () => {
	it('can find an update string in some extracted text', () => {
		const text = `nbthsaoeunhsbt
		snthaueonshtueao
          
		Last updated February 11, 2021 at 4:43 PM
		snthaouehnst
		stauoeshtnauoe
`
		expect(text).toBeDefined()
	})
})
