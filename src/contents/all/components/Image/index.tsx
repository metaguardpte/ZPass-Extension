import { useEffect, useState, memo } from 'react'

export type Props = {
    src: string | React.ReactNode | undefined
}

const Image = (props: Props) => {
    const [src, setSrc] = useState<string>()
    useEffect(() => {
        if (!props.src) {
            setSrc(chrome.runtime.getURL('/images/icons/circle-key.png'))
        } else {
            setSrc(`${props.src}`)
        }
    }, [props.src])

    const handleError = () => {
        setSrc(chrome.runtime.getURL('/images/icons/circle-key.png'))
        return false
    }
    return <img className="item-icon" src={src} onError={handleError}></img>
}
export default memo(Image)
