import { getAppStore } from '../store/store'

export const isUserAuthenticated = (): boolean => {
	return getAppStore().isAuthenticated
}
