import { Form } from 'antd'
import { FormItemProps } from 'antd/lib/form'
import Schema from 'async-validator'
import { createContext, useState } from 'react'

export const FormItemContent = createContext(Promise.resolve())

const FormItem = (props: FormItemProps) => {
    const { rules } = props
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
                                reject(error[0].message)
                            } else {
                                resolve(fields)
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

    return (
        <FormItemContent.Provider value={validatePromise}>
            <Form.Item {...props} validateFirst rules={ruleData}></Form.Item>
        </FormItemContent.Provider>
    )
}

export default FormItem
