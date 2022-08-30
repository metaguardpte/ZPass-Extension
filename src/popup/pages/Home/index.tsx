import styles from './index.less'
import { useEffect, useState } from 'react'
import { useOutlet } from 'react-router-dom'
import { extensionHeartbeat } from '@/services/api/appRequester'

let Lock = false
const HomeBase = () => {
    const Children = () => useOutlet()

    const resetTiming = () => {
        if (!Lock) {
            Lock = true
            extensionHeartbeat()
            setTimeout(() => (Lock = false), 5000) // mini interval 5s
        }
    }

    useEffect(() => {
        window.addEventListener('click', resetTiming)
        window.addEventListener('mousemove', resetTiming)

        return () => {
            window.removeEventListener('click', resetTiming)
            window.removeEventListener('mousemove', resetTiming)
        }
    }, [])

    return (
        <div className={styles.hubHome}>
            <Children />
        </div>
    )
}

export default HomeBase
