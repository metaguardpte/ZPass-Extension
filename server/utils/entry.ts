import fs from 'fs'
import { resolve } from 'path'
import { __DEV__, HOST, HRM_PATH, PORT } from './constants'
const src = resolve(__dirname, '../../src')
const HMR_URL = encodeURIComponent(`http://${HOST}:${PORT}${HRM_PATH}`)
const HMRClientScript = `webpack-hot-middleware/client?path=${HMR_URL}&reload=true&overlay=true`
const backgroundPath = resolve(src, './background/index.ts')
const popupPath = resolve(src, './popup/index.tsx')

const devEntry: Record<string, string[]> = {
    background: [backgroundPath],
    popup: [HMRClientScript, popupPath],
}
const prodEntry: Record<string, string[]> = {
    background: [backgroundPath],
    popup: [popupPath],
}
const entry = __DEV__ ? devEntry : prodEntry

const contentDirs = fs.readdirSync(resolve(src, 'contents'))
const validExtensions = ['tsx', 'ts']
contentDirs.forEach((contentScriptDir) => {
    const hasValid = validExtensions.some((ext) => {
        const abs = resolve(src, `contents/${contentScriptDir}/index.${ext}`)
        if (fs.existsSync(abs)) {
            entry[contentScriptDir] = [abs]
            return true
        }
        return false
    })

    if (!hasValid) {
        const dir = resolve(src, `contents/${contentScriptDir}`)
        throw new Error(
            `You must put index.tsx or index.ts under directory: ${dir}`
        )
    }
})

if (entry.all && __DEV__) {
    entry.all.unshift(resolve(__dirname, './allTabClient.ts'))
    entry.background.unshift(resolve(__dirname, './backgroundClient.ts'))
}

export default entry
