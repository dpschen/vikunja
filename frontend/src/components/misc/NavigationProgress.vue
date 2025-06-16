
<script setup lang="ts">
import {onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'

let progressEl: HTMLDivElement | null = null
let barEl: HTMLDivElement | null = null
let timer: number | null = null
let status = 0

function ensure() {
if (progressEl) {
return
}
progressEl = document.createElement('div')
progressEl.className = 'navigation-progress'
barEl = document.createElement('div')
barEl.className = 'navigation-progress__bar'
progressEl.appendChild(barEl)
document.body.appendChild(progressEl)
}

function set(n: number) {
status = Math.max(Math.min(n, 1), 0)
ensure()
barEl!.style.transform = `translate3d(${(-1 + status) * 100}%,0,0)`
}

function work() {
if (timer) {
return
}
timer = window.setInterval(() => {
set(status + (1 - status) * 0.2)
if (status > 0.9 && timer) {
clearInterval(timer)
timer = null
}
}, 300)
}

function start() {
if (status === 0) {
set(0.1)
}
work()
}

function done() {
if (!progressEl) {
return
}
set(1)
if (timer) {
clearInterval(timer)
timer = null
}
setTimeout(() => {
progressEl?.remove()
progressEl = null
barEl = null
status = 0
}, 300)
}

const router = useRouter()
let removeBefore: (() => void) | undefined
let removeAfter: (() => void) | undefined
let removeError: (() => void) | undefined

onMounted(() => {
removeBefore = router.beforeEach(() => {
start()
})
removeAfter = router.afterEach(() => {
done()
})
removeError = router.onError(() => {
done()
})
})

onUnmounted(() => {
removeBefore?.()
removeAfter?.()
removeError?.()
})
</script>

<style lang="scss">
.navigation-progress {
pointer-events: none;

&__bar {
background: var(--primary);
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 2px;
z-index: 1031;
}
}
</style>
