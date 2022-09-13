import { ReactChild, useRef, useState } from 'react'
import styles from './index.less'

export default function ScrollContainer(props: {
    children?: ReactChild
    className?: React.HTMLAttributes<HTMLDivElement>['className']
    style?: React.HTMLAttributes<HTMLDivElement>['style']
    allwaysVisible?: boolean
}) {
    const elRef = useRef<HTMLDivElement>(null)
    const [scrollVisible, setScrollVisible] = useState(false)
    const handleMouseEnter = () => {
        setScrollVisible(true)
    }
    const handleMouseLeave = () => {
        setScrollVisible(false)
    }
    return (
        <div
            className={`${styles.containter} ${
                props.className ? props.className : ''
            } ${
                scrollVisible || props.allwaysVisible
                    ? 'hub-scrollbar'
                    : 'hub-scrollbar-hidden'
            }`}
            style={props.style}
            onMouseOver={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={elRef}
                style={{
                    height: '100%',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                }}
            >
                {props.children}
            </div>
        </div>
    )
}
