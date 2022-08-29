import React, { useEffect, useState, memo, useRef } from 'react'
import { Avatar, AvatarProps } from 'antd'
import IconMap from '@/popup/pages/Home/components/IconMap'
import { VaultItemType } from '@/typings/enums'
import styles from './index.less'

export type Props = { lazy?: boolean } & AvatarProps
const size = 20

const LazyImage = (props: Props) => {
    const [src, setSrc] = useState<string | React.ReactNode>()
    const datasetRef = useRef<boolean>(true)
    const { lazy, ...avatarProps } = props

    const updateSrc = () => {
        if (props.src === 'defaultFavicon') {
            setSrc(IconMap(VaultItemType.App, size))
        } else {
            setSrc(`${props.src}`)
        }
    }

    useEffect(() => {
        datasetRef.current = true
        if (props.lazy === true) {
            setSrc(IconMap(VaultItemType.App, size))
            setTimeout(() => {
                if (datasetRef.current) {
                    updateSrc()
                }
            }, 300)
        } else {
            updateSrc()
        }
        return () => {
            datasetRef.current = false
        }
    }, [props.src])

    const handleError = () => {
        setSrc(IconMap(VaultItemType.App, size))
        return false
    }
    return (
        <div className={styles.imgContent}>
            {typeof props.src !== 'string' ? (
                props.src
            ) : (
                <Avatar
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    {...avatarProps}
                    src={src}
                    onError={handleError}
                    shape={'square'}
                ></Avatar>
            )}
        </div>
    )
}

export default memo(LazyImage)
