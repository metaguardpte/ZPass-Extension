import utils from '@/utils/utils'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { Form, Input, Spin, Space, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FormInput from '../FormInput'
import FormHeader from './FormHeader'
import { decryptDetailContent } from '@/services/api/appRequester'
import { StaticFieldLayoutCalculator } from './FormDisplayCalculator'
import styles from './index.less'

const { Text } = Typography

const defaultNetworks: { [k: number]: string } = {
    0: 'form.detail.metaMaskMnemonicPhrase.defaultNetwork.ethereum',
    1: 'form.detail.metaMaskMnemonicPhrase.defaultNetwork.binance',
}

const SectionOne = ['mnemonicPhrase', 'walletPassword', 'defaultNetwork']
const SectionTwo = ['note']
const layoutCacl = new StaticFieldLayoutCalculator([SectionOne, SectionTwo])

type propsType = {
    item: Message.VaultItem<Message.EncryptDetail>
}

const FormContent = (props: propsType) => {
    const { item } = props
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [iconSrc, setIconSrc] = useState('')
    const [isShowPassword, setIsShowPassword] = useState(false)
    const [isShowPhrase, setIsShowPhrase] = useState(false)
    const [detail, setDetail] = useState<Message.MetaMaskMnemonicPhraseDetail>()
    const [form] = useForm()

    const loaded = useRef<boolean>(true)

    const loadDetail = async (item: Message.VaultItem) => {
        const addressItem = item as Message.VaultItem<Message.EncryptDetail>
        const detailData =
            await decryptDetailContent<Message.MetaMaskMnemonicPhraseDetail>(
                addressItem
            )
        if (loaded.current === false) return
        setIconSrc(utils.getIconUrl(item))
        form.setFieldsValue({
            ...detailData,
            defaultNetwork: t(defaultNetworks[detailData?.defaultNetwork ?? 0]),
        })
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

    useEffect(() => {
        layoutCacl.caculateFor(detail ?? {})
    }, [detail])

    return (
        <Spin spinning={loading} className={styles.hubFormLoading}>
            <FormHeader title={props.item.name} iconSrc={iconSrc} />
            <div style={{ marginBottom: '10px' }}></div>
            <Form form={form}>
                <Form.Item name="mnemonicPhrase" noStyle>
                    <FormInput
                        title={t(
                            'form.detail.metaMaskMnemonicPhrase.mnemonicPhrase'
                        )}
                        wrapperStyle={{
                            borderRadius:
                                layoutCacl.getFieldRadius('mnemonicPhrase'),
                        }}
                        copyValue={() => detail!.mnemonicPhrase}
                        fieldButtions={[
                            {
                                icon: isShowPhrase ? (
                                    <EyeOutlined />
                                ) : (
                                    <EyeInvisibleOutlined />
                                ),
                                onclick: () => {
                                    setIsShowPhrase(!isShowPhrase)
                                },
                            },
                        ]}
                    >
                        <Input
                            className={styles.input}
                            type={isShowPhrase ? 'text' : 'password'}
                        ></Input>
                    </FormInput>
                </Form.Item>
                <Form.Item name="walletPassword" noStyle>
                    <FormInput
                        title={t(
                            'form.detail.metaMaskMnemonicPhrase.walletPassword'
                        )}
                        wrapperStyle={{
                            borderRadius:
                                layoutCacl.getFieldRadius('walletPassword'),
                            display:
                                layoutCacl.getFieldDisplay('walletPassword'),
                        }}
                        copyValue={() => detail!.walletPassword}
                        fieldButtions={[
                            {
                                icon: isShowPassword ? (
                                    <EyeOutlined />
                                ) : (
                                    <EyeInvisibleOutlined />
                                ),
                                onclick: () => {
                                    setIsShowPassword(!isShowPassword)
                                },
                            },
                        ]}
                    >
                        <Input
                            className={styles.input}
                            type={isShowPassword ? 'text' : 'password'}
                        ></Input>
                    </FormInput>
                </Form.Item>
                <Form.Item name="defaultNetwork" noStyle>
                    <FormInput
                        title={t(
                            'form.detail.metaMaskMnemonicPhrase.defaultNetwork'
                        )}
                        wrapperStyle={{
                            borderRadius:
                                layoutCacl.getFieldRadius('defaultNetwork'),
                        }}
                    >
                        <Input className={styles.input}></Input>
                    </FormInput>
                </Form.Item>
                <Space
                    style={{
                        margin: '10px 0',
                        display: layoutCacl.getSectionDisplay(SectionTwo),
                    }}
                >
                    <Text>{t('form.detail.other')}</Text>
                </Space>
                <Form.Item name="note" noStyle>
                    <FormInput
                        title={t('form.detail.note')}
                        wrapperStyle={{
                            borderRadius: '10px',
                            display: layoutCacl.getFieldDisplay('note'),
                        }}
                        copyValue={() => detail!.note}
                    >
                        <Input.TextArea
                            autoSize={{
                                minRows: 2,
                                maxRows: Number.MAX_SAFE_INTEGER,
                            }}
                        ></Input.TextArea>
                    </FormInput>
                </Form.Item>
            </Form>
        </Spin>
    )
}
export default FormContent
