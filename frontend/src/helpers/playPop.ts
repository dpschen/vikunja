import {computed} from 'vue'
import {useAuthStore} from '@/stores/auth'
import {useSound} from '@vueuse/sound'

import popSoundFile from '@/assets/audio/pop.mp3'

export function usePopSound() {
       const authStore = useAuthStore()
       const playSoundWhenDone = computed(() => authStore.settings.frontendSettings.playSoundWhenDone)

       const {play} = useSound(popSoundFile)

       return () => {
               if (!playSoundWhenDone.value)
                       return

               try {
                       play()
               } catch (e) {
                       console.error('Could not play pop sound:', e)
               }
       }
}
