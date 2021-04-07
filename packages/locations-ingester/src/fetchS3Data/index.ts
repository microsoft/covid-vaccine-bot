/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { fetchS3Data } from './fetchS3Data'

fetchS3Data()
	.then(() => console.log('fetched remote data'))
	.catch((err) => console.log('error fetching data', err))
