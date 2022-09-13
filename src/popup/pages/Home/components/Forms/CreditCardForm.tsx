import { useEffect, useState, useRef } from 'react'
import utils from '@/utils/utils'
import { Typography, Form, Input, Space, Spin } from 'antd'
import styles from './index.less'
import FormInput from '../FormInput'
import FormItem from '../FormItem'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { decryptDetailContent } from '@/services/api/appRequester'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import { useTranslation } from 'react-i18next'
import FormHeader from './FormHeader'

interface CreditCardFormProps {
    item: Message.VaultItem<Message.EncryptCreditDetail>
}

const { Title, Text } = Typography

const MAX_LENGTH = 255

const CreditCardForm = (props: CreditCardFormProps) => {
    const { t } = useTranslation()
    const [iconSrc, setIconSrc] = useState<string>('')
    const [isShowCvv, setIsShowCvv] = useState<boolean>(false)
    const [isShowPin, setIsShowPin] = useState<boolean>(false)
    const cvvRef = useRef<Input>(null)
    const pinRef = useRef<Input>(null)
    const datasetRef = useRef<boolean>(true)
    const [decryptDetail, setDecryptDetail] =
        useState<Message.CreditCardDetail>()
    const [form] = useForm()
    const [loading, setLoading] = useState<boolean>(true)

    const decryptLogin = async (item: Message.VaultItem) => {
        const creditItem =
            item as Message.VaultItem<Message.EncryptCreditDetail>
        const ret = await decryptDetailContent<Message.CreditCardDetail>(
            creditItem
        )
        if (!ret) {
            return
        }
        if (datasetRef.current === false) {
            return
        }
        setIconSrc(utils.getIconUrl(creditItem))
        setDecryptDetail(ret)
        form.setFieldsValue(ret)
        setLoading(false)
    }

    useEffect(() => {
        datasetRef.current = true
        setLoading(true)
        decryptLogin(props.item)

        return () => {
            datasetRef.current = false
        }
    }, [props.item])

    const handleShowCvv = (show: boolean) => {
        setIsShowCvv(show)
        if (show) {
            cvvRef.current?.input.setAttribute('type', 'text')
        } else {
            cvvRef.current?.input.setAttribute('type', 'password')
        }
    }

    const handleShowPin = (show: boolean) => {
        setIsShowPin(show)
        if (show) {
            pinRef.current?.input.setAttribute('type', 'text')
        } else {
            pinRef.current?.input.setAttribute('type', 'password')
        }
    }

    useEffect(() => {
        if (isShowCvv) {
            cvvRef.current?.input.setAttribute('type', 'text')
        } else {
            cvvRef.current?.input.setAttribute('type', 'password')
        }
        if (isShowPin) {
            pinRef.current?.input.setAttribute('type', 'text')
        } else {
            pinRef.current?.input.setAttribute('type', 'password')
        }
    })

    const SectionOne = ['holder', 'number']
    const SectionTwo = ['expiry', 'cvv', 'zipOrPostalCode', 'pin']
    const SectionThree = ['note']

    const getFieldBorderRadius = (field: string, fieldGroup: string[]) => {
        const roundRadius = '10px 10px'
        const noRadius = '0 0'
        if (loading) {
            return `${roundRadius} ${roundRadius}`
        }
        const fieldValues = form.getFieldsValue()
        const fieldsWithValue = fieldGroup.filter((field) => fieldValues[field])
        const upperRadius =
            fieldsWithValue[0] === field ? roundRadius : noRadius
        const buttomRadius =
            fieldsWithValue[fieldsWithValue.length - 1] === field
                ? roundRadius
                : noRadius
        const result = `${upperRadius} ${buttomRadius}`
        return result
    }

    const getFieldDisplay = (field: string) => {
        if (loading) {
            return 'none'
        }
        return form.getFieldValue(field) ? '' : 'none'
    }

    const getSectiondDisplay = (fields: string[]) => {
        if (loading) {
            return 'none'
        }
        return fields.some((field) => form.getFieldValue(field)) ? '' : 'none'
    }

    return (
        <Spin spinning={loading} className={styles.hubFormLoading}>
            <FormHeader
                title={props.item.alias ?? props.item.name}
                iconSrc={iconSrc}
            />
            <div style={{ marginBottom: '10px' }}>
                <Form form={form}>
                    <Space
                        style={{
                            margin: '10px 0',
                            display: getSectiondDisplay(SectionOne),
                        }}
                    >
                        <Text>{t('form.detail.card.cardDetails')}</Text>
                    </Space>
                    <FormItem name="holder" noStyle>
                        <FormInput
                            title={t('form.detail.card.holder')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'holder',
                                    SectionOne
                                ),
                                display: getFieldDisplay('holder'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.holder ?? ''}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="number" noStyle>
                        <FormInput
                            title={t('form.detail.card.number')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'number',
                                    SectionOne
                                ),
                                display: getFieldDisplay('number'),
                            }}
                            isEdit={false}
                            copyValue={() =>
                                utils.getRawNumber(decryptDetail?.number)
                            }
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="expiry" noStyle>
                        <FormInput
                            title={t('form.detail.card.expiry')}
                            outerStyle={{ marginTop: '20px' }}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'expiry',
                                    SectionTwo
                                ),
                                display: getFieldDisplay('expiry'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.expiry ?? ''}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="cvv" noStyle>
                        <FormInput
                            title={t('form.detail.card.cvv')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'cvv',
                                    SectionTwo
                                ),
                                display: getFieldDisplay('cvv'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.cvv ?? ''}
                            fieldButtions={[
                                {
                                    icon: isShowCvv ? (
                                        <EyeOutlined />
                                    ) : (
                                        <EyeInvisibleOutlined />
                                    ),
                                    onclick: () => {
                                        handleShowCvv(!isShowCvv)
                                    },
                                },
                            ]}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                ref={cvvRef}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="zipOrPostalCode" noStyle>
                        <FormInput
                            title={t('form.detail.card.zip')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'zipOrPostalCode',
                                    SectionTwo
                                ),
                                display: getFieldDisplay('zipOrPostalCode'),
                            }}
                            isEdit={false}
                            copyValue={() =>
                                decryptDetail?.zipOrPostalCode ?? ''
                            }
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="pin" noStyle>
                        <FormInput
                            title={t('form.detail.card.pin')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'pin',
                                    SectionTwo
                                ),
                                display: getFieldDisplay('pin'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.pin ?? ''}
                            fieldButtions={[
                                {
                                    icon: isShowPin ? (
                                        <EyeOutlined />
                                    ) : (
                                        <EyeInvisibleOutlined />
                                    ),
                                    onclick: () => {
                                        handleShowPin(!isShowPin)
                                    },
                                },
                            ]}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                ref={pinRef}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <Space
                        style={{
                            margin: '10px 0',
                            display: getSectiondDisplay(SectionThree),
                        }}
                    >
                        <Text>{t('form.detail.card.other')}</Text>
                    </Space>
                    <FormItem name="note" noStyle>
                        <FormInput
                            title={t('form.detail.card.note')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'note',
                                    SectionThree
                                ),
                                display: getFieldDisplay('note'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.note ?? ''}
                        >
                            <TextArea
                                autoSize={{
                                    minRows: 2,
                                    maxRows: Number.MAX_SAFE_INTEGER,
                                }}
                            />
                        </FormInput>
                    </FormItem>
                </Form>
            </div>
        </Spin>
    )
}

export default CreditCardForm
