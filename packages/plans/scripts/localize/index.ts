import { localizeFiles } from './localizeFiles'

console.log('beginning localization')
localizeFiles('es', 'es-us')
	.then(() => console.log('localization complete!'))
	.catch((err) => {
		console.error('error localizing', err)
		process.exit(1)
	})
