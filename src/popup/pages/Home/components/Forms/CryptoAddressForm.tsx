import utils from '@/utils/utils'
import { Button, Form, FormInstance, Input, Spin } from 'antd'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { useForm } from 'antd/lib/form/Form'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FormInput from '../FormInput'
import FormHeader from './FormHeader'
import { decryptDetailContent } from '@/services/api/appRequester'
import { DynamicFieldLayoutCalculator } from './FormDisplayCalculator'
import styles from './index.less'

type propsType = {
    item: Message.VaultItem<Message.EncryptDetail>
}

const Section = ['address', 'privateKey', 'note']
const layoutCacl = new DynamicFieldLayoutCalculator([Section])

const FormContent = (props: propsType) => {
    const { item } = props
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [iconSrc, setIconSrc] = useState('')
    const [showPrivateKey, setShowPrivateKey] = useState<{
        [k: string]: boolean
    }>({})
    const [detail, setDetail] = useState<Message.CryptoAddressDetail>()
    const [form] = useForm()

    const loaded = useRef<boolean>(true)

    const loadDetail = async (item: Message.VaultItem) => {
        const detailData =
            await decryptDetailContent<Message.CryptoAddressDetail>(item)
        if (loaded.current === false) return
        setIconSrc(utils.getIconUrl(item))
        form.setFieldsValue(detailData)
        setDetail(detailData)
    }

    useEffect(() => {
        loaded.current = true
        setLoading(true)
        loadDetail(item).then(() => setLoading(false))
        return () => {
            loaded.current = false
        }
    }, [item])

    return (
        <Spin spinning={loading} className={styles.hubFormLoading}>
            <FormHeader title={props.item.name} iconSrc={iconSrc} />
            <div style={{ marginBottom: '10px' }}></div>
            <Form form={form}>
                <Form.List name="addresses">
                    {(fields) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div style={{ marginTop: '10px' }} key={name}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'address']}
                                        rules={[{ required: true }]}
                                        noStyle
                                    >
                                        <FormInput
                                            title={t(
                                                'form.detail.walletAddress.address'
                                            )}
                                            wrapperStyle={{
                                                display:
                                                    layoutCacl.getFieldDisplay(
                                                        'address',
                                                        detail?.addresses[name]
                                                    ),
                                                borderRadius:
                                                    layoutCacl.getFieldRadius(
                                                        'address',
                                                        detail?.addresses[name]
                                                    ),
                                            }}
                                            copyValue={() =>
                                                detail!.addresses[name].address
                                            }
                                        >
                                            <Input
                                                className={styles.input}
                                            ></Input>
                                        </FormInput>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'privateKey']}
                                        noStyle
                                    >
                                        <FormInput
                                            title={t(
                                                'form.detail.walletAddress.privateKey'
                                            )}
                                            wrapperStyle={{
                                                display:
                                                    layoutCacl.getFieldDisplay(
                                                        'privateKey',
                                                        detail?.addresses[name]
                                                    ),
                                                borderRadius:
                                                    layoutCacl.getFieldRadius(
                                                        'privateKey',
                                                        detail?.addresses[name]
                                                    ),
                                            }}
                                            copyValue={() =>
                                                detail!.addresses[name]
                                                    .privateKey
                                            }
                                            fieldButtions={[
                                                {
                                                    icon: showPrivateKey[
                                                        name
                                                    ] ? (
                                                        <EyeOutlined />
                                                    ) : (
                                                        <EyeInvisibleOutlined />
                                                    ),
                                                    onclick: () => {
                                                        const copy = {
                                                            ...showPrivateKey,
                                                        }
                                                        copy[name] = !copy[name]
                                                        setShowPrivateKey(copy)
                                                    },
                                                },
                                            ]}
                                        >
                                            <Input
                                                className={styles.input}
                                                type={
                                                    showPrivateKey[name]
                                                        ? 'text'
                                                        : 'password'
                                                }
                                            ></Input>
                                        </FormInput>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'note']}
                                        noStyle
                                    >
                                        <FormInput
                                            title={t('form.detail.note')}
                                            wrapperStyle={{
                                                display:
                                                    layoutCacl.getFieldDisplay(
                                                        'note',
                                                        detail?.addresses[name]
                                                    ),
                                                borderRadius:
                                                    layoutCacl.getFieldRadius(
                                                        'note',
                                                        detail?.addresses[name]
                                                    ),
                                            }}
                                            copyValue={() =>
                                                detail!.addresses[name].note
                                            }
                                        >
                                            <Input.TextArea
                                                autoSize={{
                                                    minRows: 1,
                                                    maxRows:
                                                        Number.MAX_SAFE_INTEGER,
                                                }}
                                            ></Input.TextArea>
                                        </FormInput>
                                    </Form.Item>
                                </div>
                            ))}
                        </>
                    )}
                </Form.List>
            </Form>
        </Spin>
    )
}
export default FormContent
