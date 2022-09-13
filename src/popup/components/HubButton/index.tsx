import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import { ButtonType } from 'antd/lib/button'
import { useEffect, useState } from 'react'
import styles from './index.less'

type Props = {
    loadingVisible?: boolean
    disable?: boolean
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    children?: JSX.Element | string
    type?: ButtonType
    size?: 'small' | 'nomal' | 'big'
    style?: {}
    width?: number
    height?: number
} & React.HTMLAttributes<HTMLDivElement>

const HubButton = (props: Props) => {
    const { onClick, disable, loadingVisible, children } = props

    const [baseStyle, setBaseStyle] = useState({})

    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        if (loadingVisible || disable) return
        onClick?.(e)
    }

    const getClaseName = () => {
        const type = props.type ? props.type : 'primary'
        const clases = [styles[type]]
        if (!props.disable) {
            clases.push(styles[`${type}Hover`])
        }
        return clases.join(' ')
    }

    useEffect(() => {
        let height = 26
        if (props.height) {
            height = props.height
        }
        let style = {
            height: height,
            lineHeight: `${height}px`,
            borderRadius: height / 2,
            paddingLeft: height / 2,
            paddingRight: height / 2,
            fontSize: props.height > 26 ? 14 : 12,
        }
        if (props.disable) {
            style = Object.assign(style, {
                opacity: '0.5',
                cursor: 'not-allowed',
            })
        }
        if (props.loadingVisible) {
            style = Object.assign(style, { cursor: 'wait' })
        }
        if (props.width) style = Object.assign(style, { width: props.width })
        if (props.style) style = Object.assign(style, props.style)
        setBaseStyle(style)
    }, [props])

    return (
        <div
            {...props}
            onClick={(e) => {
                handleClick(e)
            }}
            className={`${getClaseName()}`}
            style={{ ...baseStyle }}
        >
            {
                <>
                    {loadingVisible ? (
                        <Spin
                            indicator={
                                <LoadingOutlined
                                    style={{
                                        fontSize: '14px',
                                        display: loadingVisible ? '' : 'none',
                                        paddingRight: '8px',
                                    }}
                                />
                            }
                        ></Spin>
                    ) : (
                        <></>
                    )}
                    {children}
                </>
            }
        </div>
    )
}

export default HubButton
