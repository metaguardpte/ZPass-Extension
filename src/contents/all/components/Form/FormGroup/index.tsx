import { isArray } from 'lodash'
import React from 'react'

interface PropsItem {
    children: React.ReactChild[] | React.ReactChild
    radius?: number
    height?: number
    style?: React.HTMLAttributes<HTMLDivElement>['style']
}

const FormGroup = (props: PropsItem) => {
    const getStyle = (index: number) => {
        const base = props.radius ?? 5
        let radius = ''
        if (!isArray(props.children)) {
            radius = `${base}px`
        } else {
            if (index === 0) {
                radius = `${base}px ${base}px 0 0`
            } else if (index === props.children.length - 1) {
                radius = `0 0 ${base}px ${base}px`
            }
        }
        const style = { borderRadius: radius }
        if (props.height) style.height = props.height
        return style
    }
    return (
        <div style={{ width: '100%', ...props.style }}>
            {React.Children.map(props.children, (child, index) => {
                if (!React.isValidElement(child)) {
                    return null
                }
                const childProps = {
                    ...child.props,
                    wrapperStyle: getStyle(index),
                }
                if (
                    isArray(props.children) &&
                    index >= 0 &&
                    index < props.children.length - 1
                ) {
                    return (
                        <>
                            {React.cloneElement(child, childProps)}
                            <div
                                style={{
                                    height: '1px',
                                    backgroundColor: '#E2E2E2',
                                }}
                            ></div>
                        </>
                    )
                } else {
                    return React.cloneElement(child, childProps)
                }
            })}
        </div>
    )
}

export default FormGroup
