import Phase from './Phase'
import Qualification from './Qualification'


export default interface Location {
	phases: Phase[]
	qualifications: Qualification[]
	info: any[]
}