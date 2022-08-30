import { Form, Input, Space, Spin, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useEffect, useRef, useState } from 'react'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import FormInput from '../FormInput'
import FormHeader from './FormHeader'
import { decryptString } from '@/services/api/appRequester'
import styles from './index.less'
import utils from '@/utils/utils'
import { StaticFieldLayoutCalculator } from './FormDisplayCalculator'

const { Text } = Typography

type FormProps = {
    item: Message.VaultItem<Message.MetaMaskRawDataDetail>
}

const SectionOne = ['dataFile', 'walletPassword']
const SectionTwo = ['note']
const layoutCacl = new StaticFieldLayoutCalculator([SectionOne, SectionTwo])

const MAX_LENGTH = 255

const FormContent = (props: FormProps) => {
    const { item } = props
    const { t } = useTranslation()
    const [form] = useForm()
    const [loading, setLoading] = useState(false)
    const [iconSrc, setIconSrc] = useState('')
    const [isShowPassword, setIsShowPassword] = useState(false)
    const [detail, setDetail] = useState<Message.MetaMaskRawDataDetail>()
    const loaded = useRef<boolean>(true)

    const loadDetail = async (
        item: Message.VaultItem<Message.MetaMaskRawDataDetail>
    ) => {
        const walletPassword =
            item.detail.walletPassword &&
            (await decryptString(item.domainId, item.detail.walletPassword))
        if (loaded.current === false) return
        setIconSrc(utils.getIconUrl(item))
        const detailData = { ...item.detail, walletPassword: walletPassword! }
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

    useEffect(() => {
        layoutCacl.caculateFor(detail ?? {})
    }, [detail])

    return (
        <Spin spinning={loading} className={styles.hubFormLoading}>
            <FormHeader title={props.item.name} iconSrc={iconSrc} />
            <div style={{ marginBottom: '10px' }}></div>
            <Form form={form}>
                <Form.Item name="dataFile" noStyle>
                    <FormInput
                        title={t('form.detail.metaMaskRawData.dataFile')}
                        wrapperStyle={{
                            borderRadius: layoutCacl.getFieldRadius('dataFile'),
                        }}
                        copyValue={() => detail?.dataFile!}
                    >
                        <Input className={styles.input} readOnly={true} />
                    </FormInput>
                </Form.Item>
                <Form.Item name="walletPassword" noStyle>
                    <FormInput
                        title={t('form.detail.metaMaskRawData.walletPassword')}
                        wrapperStyle={{
                            display:
                                layoutCacl.getFieldDisplay('walletPassword'),
                            borderRadius:
                                layoutCacl.getFieldRadius('walletPassword'),
                        }}
                        copyValue={() => detail?.walletPassword!}
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
                            maxLength={MAX_LENGTH}
                            type={isShowPassword ? 'text' : 'password'}
                        />
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
                            display: layoutCacl.getFieldDisplay('note'),
                            borderRadius: layoutCacl.getFieldRadius('note'),
                        }}
                        copyValue={() => detail?.note!}
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
