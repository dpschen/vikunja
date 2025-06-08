import {useRouter} from 'vue-router'
import {lastVisited} from '@/helpers/saveLastVisited'

export function useRedirectToLastVisited() {

       const router = useRouter()

       function getLastVisitedRoute() {
               const last = lastVisited.value
               if (last === null) {
                       return null
               }

               lastVisited.value = null
               return {
                       name: last.name,
                       params: last.params,
                       query: last.query,
               }
	}

	function redirectIfSaved() {
		const lastRoute = getLastVisitedRoute()
		if (!lastRoute) {
			return router.push({name: 'home'})
		}

		return router.push(lastRoute)
	}

	return {
		redirectIfSaved,
		getLastVisitedRoute,
	}
}
