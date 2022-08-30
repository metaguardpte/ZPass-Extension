import React, { useEffect, useState, memo } from 'react'
import { Avatar, AvatarProps } from 'antd'
import { VaultItemType } from '@/typings/enums'
import IconMap from '@/popup/pages/Home/components/IconMap'
import styles from './index.less'

export type Props = AvatarProps
const size = 30

const Image = (props: Props) => {
    const [src, setSrc] = useState<string | React.ReactNode>()
    useEffect(() => {
        if (props.src === 'defaultFavicon') {
            setSrc(IconMap(VaultItemType.App, size))
        } else {
            setSrc(`${props.src}`)
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
                    {...props}
                    src={src}
                    onError={handleError}
                    shape={'square'}
                ></Avatar>
            )}
        </div>
    )
}
export default memo(Image)
