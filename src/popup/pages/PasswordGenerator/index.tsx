import { useState } from 'react'
import styles from './index.less'
import History from './history'
import Generate from './generate'

type PageType = 'generate' | 'history'
type PropsItem = {
    fillPassword?: (password: string) => void
    styles?: {}
    close?: () => void
}

const PasswordGenerate = (props: PropsItem) => {
    const [page, setPage] = useState<PageType>('generate')

    const onSwitch = () => {
        if (page === 'generate') {
            setPage('history')
        } else {
            setPage('generate')
        }
    }

    const close = () => {
        props.close?.()
    }

    return (
        <div className={styles.main}>
            <div className={styles.header}></div>
            <div className={styles.body}>
                {page === 'generate' ? (
                    <Generate
                        onSwitch={onSwitch}
                        fillPassword={props.fillPassword}
                    />
                ) : (
                    <History onSwitch={onSwitch} />
                )}
            </div>
        </div>
    )
}

export default PasswordGenerate
