import { useEffect, useState, useRef } from 'react'
import utils from '@/utils/utils'
import { Typography, Form, Input, Space, Spin, Progress } from 'antd'
import styles from './index.less'
import FormInput from '../FormInput'
import FormItem from '../FormItem'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { appRequester, decryptDetailContent } from '@/services/api/appRequester'
import { useForm } from 'antd/lib/form/Form'
import { useTranslation } from 'react-i18next'
import store from '@/popup/store'
import FormHeader from './FormHeader'

interface LoginFormProps {
    item: Message.VaultItem<Message.VaultItemLogin>
}

const { Title, Text } = Typography

const MAX_LENGTH = 255

const LoginForm = (props: LoginFormProps) => {
    const { t } = useTranslation()
    const [iconSrc, setIconSrc] = useState<string>('')
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const passwordRef = useRef<Input>(null)
    const datasetRef = useRef<boolean>(true)
    const [decryptItem, setDecryptItem] =
        useState<Message.VaultItem<Message.VaultItemLogin>>()
    const [form] = useForm()
    const [loading, setLoading] = useState<boolean>(true)
    const [isPersonal, setIsPersonal] = useState<boolean>(true)
    const [showTOTPError, setShowTOTPError] = useState(false)
    const [strokeColor, setStrokeColor] = useState('green')
    const [otPasswordFront, setOTPasswordFront] = useState('')
    const [otPasswordBack, setOTPasswordBack] = useState('')
    const [countDown, setCountDown] = useState('')
    const [totalPercentTOTP, setTotalPercentTOTP] = useState(0)

    const decryptText = async (
        text: string,
        itemId: number,
        domainId: number
    ) => {
        const req: Message.ExtensionsMessage<Message.ItemDescrypt> = {
            type: 'DecryptTextFromExtension',
            message: {
                text: text,
                itemId: itemId,
                domainId: domainId,
            },
        }
        return await appRequester.post(req)
    }

    const decryptLogin = async (item: Message.VaultItem) => {
        const loginItem = item as Message.VaultItem<Message.EncryptLoginDetail>
        const detail = await decryptDetailContent<Message.VaultItemLogin>(item)
        if (detail === undefined || datasetRef.current === false) {
            return
        }
        const origin = utils.getUrlOrigin(item.detail.loginUri)
        setIconSrc(`${origin}/favicon.ico`)

        const decrypt: Message.VaultItem<Message.VaultItemLogin> = {
            ...loginItem,
            detail: {
                ...loginItem.detail,
                ...detail,
            },
        }
        setDecryptItem(decrypt)
        form.setFieldsValue(decrypt.detail)
        setLoading(false)
    }

    const packWorkLogin = (item: Message.VaultItem) => {
        const loginItem = item as Message.VaultItem<Message.VaultItemLogin>
        const origin = utils.getUrlOrigin(item.detail.loginUri)
        setIconSrc(`${origin}/favicon.ico`)
        const decrypt: Message.VaultItem<Message.VaultItemLogin> = JSON.parse(
            JSON.stringify(loginItem)
        )
        decrypt.detail.loginPassword = ''
        decrypt.detail.oneTimePassword = ''
        setDecryptItem(decrypt)
        form.setFieldsValue(decrypt.detail)
        setLoading(false)
    }

    useEffect(() => {
        datasetRef.current = true
        setLoading(true)
        const _isPersonal = props.item.domainId === store.personalId
        setIsPersonal(_isPersonal)
        if (_isPersonal) {
            decryptLogin(props.item)
        } else {
            packWorkLogin(props.item)
        }

        return () => {
            datasetRef.current = false
        }
    }, [props.item])

    const handleShowPwd = (show: boolean) => {
        setIsShowPassword(show)
        if (show) {
            passwordRef.current?.input.setAttribute('type', 'text')
        } else {
            passwordRef.current?.input.setAttribute('type', 'password')
        }
    }

    useEffect(() => {
        if (isShowPassword) {
            passwordRef.current?.input.setAttribute('type', 'text')
        } else {
            passwordRef.current?.input.setAttribute('type', 'password')
        }
    })

    const SectionOne = ['loginUser', 'loginPassword']
    const SectionTwo = ['loginUri', 'oneTimePassword']

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

    const maxSeconds = 30
    const colorThreshold = (10 / maxSeconds) * 100
    const generatePassword = (secret: any): string | null => {
        if (secret) {
            secret = secret.trim()
            const totp = utils.createTOTP(secret)
            if (totp) {
                setShowTOTPError(false)
                const seconds = new Date().getUTCSeconds()
                const percent = (1 - (seconds % maxSeconds) / maxSeconds) * 100
                if (Math.floor(percent) > Math.floor(colorThreshold)) {
                    setStrokeColor('green')
                } else {
                    setStrokeColor('red')
                }
                setTotalPercentTOTP(percent)
                setCountDown(Math.round((percent / 100) * 30).toString())
                return totp.generate()
            } else {
                setShowTOTPError(true)
            }
        }
        return null
    }

    const showOneTimePassword = () => {
        const secret = form.getFieldValue('oneTimePassword')
        const password = generatePassword(secret)
        if (password) {
            setOTPasswordFront(password.substring(0, 3))
            setOTPasswordBack(password.substring(3))
        } else {
            setOTPasswordFront('')
            setOTPasswordBack('')
        }
    }

    useEffect(() => {
        const timer = setInterval(showOneTimePassword, 1000)
        return () => {
            clearInterval(timer)
        }
    }, [])

    const copyOneTimePassword = () => {
        const secret = form.getFieldValue('oneTimePassword')
        const password = generatePassword(secret)
        return password ?? ''
    }

    return (
        <Spin spinning={loading} className={styles.hubFormLoading}>
            <FormHeader
                title={props.item.alias ?? props.item.name}
                iconSrc={iconSrc}
            />
            <div>
                <Form form={form}>
                    <FormItem name="loginUser" noStyle>
                        <FormInput
                            title={t('form.detail.login.name')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'loginUser',
                                    SectionOne
                                ),
                            }}
                            isEdit={false}
                            copyValue={() =>
                                decryptItem?.detail.loginUser ?? ''
                            }
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="loginPassword" noStyle>
                        <FormInput
                            title={t('form.detail.login.password')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'loginPassword',
                                    SectionOne
                                ),
                                display: isPersonal ? 'block' : 'none',
                            }}
                            isEdit={false}
                            copyValue={() =>
                                decryptItem?.detail.loginPassword ?? ''
                            }
                            fieldButtions={[
                                {
                                    icon: isShowPassword ? (
                                        <EyeOutlined />
                                    ) : (
                                        <EyeInvisibleOutlined />
                                    ),
                                    onclick: () => {
                                        handleShowPwd(!isShowPassword)
                                    },
                                },
                            ]}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                ref={passwordRef}
                                className={styles.input}
                                style={{ borderRadius: '3px' }}
                            ></Input>
                        </FormInput>
                    </FormItem>
                    <FormItem name="loginUri" noStyle>
                        <FormInput
                            title={t('form.detail.login.url')}
                            outerStyle={{ marginTop: '20px' }}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'loginUri',
                                    SectionTwo
                                ),
                            }}
                            isEdit={false}
                            copyValue={() => decryptItem?.detail.loginUri ?? ''}
                        >
                            <Input
                                maxLength={2048}
                                className={styles.input}
                                placeholder="https://example.com"
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="oneTimePassword" noStyle>
                        <FormInput
                            title={t('form.detail.oneTimePassword')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'oneTimePassword',
                                    SectionTwo
                                ),
                                display:
                                    isPersonal &&
                                    form.getFieldValue('oneTimePassword')
                                        ? 'block'
                                        : 'none',
                            }}
                            isEdit={false}
                            copyValue={copyOneTimePassword}
                        >
                            {showTOTPError ? (
                                <div style={{ height: 30, lineHeight: '30px' }}>
                                    {t(
                                        'form.detail.oneTimePassword.format.error'
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <Space>
                                        <span>{otPasswordFront}</span>
                                        <span>{otPasswordBack}</span>
                                        <Progress
                                            style={{ transform: 'scaleX(-1)' }}
                                            type="circle"
                                            showInfo={false}
                                            strokeColor={strokeColor}
                                            strokeWidth={15}
                                            trailColor={'unset'}
                                            percent={totalPercentTOTP}
                                            width={15}
                                        />
                                        <span>{countDown}</span>
                                    </Space>
                                </div>
                            )}
                        </FormInput>
                    </FormItem>
                    <FormItem name="note" noStyle>
                        <FormInput
                            title={t('form.detail.login.note')}
                            outerStyle={{ marginTop: '20px' }}
                            wrapperStyle={{
                                borderRadius: '10px',
                                display: form.getFieldValue('note')
                                    ? 'block'
                                    : 'none',
                            }}
                            isEdit={false}
                            copyValue={() => decryptItem?.detail.note ?? ''}
                        >
                            <Input.TextArea
                                autoSize={{
                                    minRows: 2,
                                    maxRows: Number.MAX_SAFE_INTEGER,
                                }}
                            ></Input.TextArea>
                        </FormInput>
                    </FormItem>
                </Form>
            </div>
        </Spin>
    )
}

export default LoginForm
