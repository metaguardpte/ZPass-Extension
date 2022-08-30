import { Form } from 'antd'
import { FormItemProps } from 'antd/lib/form'
import Schema from 'async-validator'
import React, { createContext, useEffect, useState } from 'react'

export const FormItemContent = createContext(Promise.resolve())

const FormItem = (
    props: FormItemProps & {
        wrapperStyle?: React.HTMLAttributes<HTMLDivElement>['style']
    }
) => {
    const { rules, children, wrapperStyle, ...rest } = props
    const [validatePromise, setValidatePromise] = useState(Promise.resolve())
    let ruleData: any[] = []
    if (rules) {
        ruleData = rules.map((rule) => {
            const config = {
                test: [rule],
            }
            const validator = (_: any, value: any) => {
                return new Schema(config).validate(
                    { test: value },
                    (error, fields) => {
                        const promise = new Promise((resolve, reject) => {
                            if (error) {
                                if (props.hasFeedback) {
                                    reject({
                                        status: 'error',
                                        help: error[0].message,
                                    })
                                } else {
                                    reject(error[0].message)
                                }
                            } else {
                                resolve({})
                            }
                        })
                        setValidatePromise(promise)
                        return promise
                    }
                )
            }
            return {
                validator,
            }
        })
    }

    useEffect(() => {
        if (props.hasFeedback && props.validateStatus) {
            const promise = new Promise((resolve, reject) => {
                if (props.validateStatus === 'error') {
                    reject({ status: 'error', help: props.help })
                } else {
                    resolve({ status: props.validateStatus, help: props.help })
                }
            })
            setValidatePromise(promise)
        }
    }, [props.validateStatus, props.help])

    return (
        <FormItemContent.Provider value={validatePromise}>
            <Form.Item {...rest} validateFirst rules={ruleData} noStyle>
                {React.isValidElement(children) ? (
                    React.cloneElement(children, {
                        ...children.props,
                        wrapperStyle: wrapperStyle,
                        label: props.label,
                    })
                ) : (
                    <></>
                )}
            </Form.Item>
        </FormItemContent.Provider>
    )
}

export default FormItem
