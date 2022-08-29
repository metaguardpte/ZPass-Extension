import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Store } from '../../store'
import { savePassword } from '@/services/api/appRequester'
import HubButton from '../../components/HubButton'
import { Space, Input, Form } from 'antd'
import FormItem from '../../components/Form/FormItem'
import FormInput from '../../components/Form/FormInput'
import FormGroup from '../../components/Form/FormGroup'
import { SyncOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'

type Props = {
    credential: Store['credential']
    removeCredential: () => void
}

function savePasswordTip(props: Props) {
    const { t } = useTranslation()
    const [showMore, setShowMore] = useState(false)
    const [form] = Form.useForm()

    const handleSave = async () => {
        const values = form.getFieldsValue()
        const credential: Message.CredentialSave = {
            ...props.credential!,
            ...values,
        }
        await savePassword(credential)

        props.removeCredential()
    }

    useEffect(() => {
        if (props.credential) {
            form.setFieldsValue({
                description:
                    props.credential.name ?? document.location.hostname,
            })
            form.setFieldsValue({ username: props.credential.username })
            form.setFieldsValue({ password: props.credential.password })
            form.setFieldsValue({ uri: props.credential.uri })
            form.setFieldsValue({ note: props.credential.note ?? '' })
        }
    }, [props.credential])

    const submit = () => {
        form.submit()
    }

    const handleCancel = () => {
        props.removeCredential()
    }
    if (!props.credential) return <></>
    return (
        <div
            style={{
                position: 'fixed',
                top: '0px',
                right: '20px',
                zIndex: '99999999',
                fontSize: '13px',
                fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
            }}
        >
            <div className="pop-wrapper">
                <div
                    style={{
                        height: 30,
                        backgroundColor: '#4B5DFE',
                        width: '100%',
                        borderRadius: '5px 5px 0 0',
                    }}
                ></div>
                <div className="pop-header">
                    <div className="image-containter">
                        <img
                            className="img"
                            src={chrome.runtime.getURL('/images/logo32.png')}
                            alt=""
                        />
                    </div>
                    <div className="header-right">
                        <span>
                            {props.credential.status === 'new'
                                ? t('new.item')
                                : t('update.item')}
                        </span>
                    </div>
                </div>
                <div className="pop-content">
                    <Form form={form} onFinish={handleSave}>
                        <Space
                            direction="vertical"
                            style={{ width: '100%' }}
                            size={14}
                        >
                            <FormGroup>
                                <FormItem
                                    name="description"
                                    rules={[{ required: true }]}
                                >
                                    <FormInput
                                        isEdit={true}
                                        title={t('description')}
                                        isRequiredField={true}
                                    >
                                        <Input />
                                    </FormInput>
                                </FormItem>
                            </FormGroup>
                            <FormGroup>
                                <FormItem
                                    name="username"
                                    rules={[{ required: true }]}
                                >
                                    <FormInput
                                        isEdit={true}
                                        title={t('login.userName')}
                                        isRequiredField={true}
                                    >
                                        <Input />
                                    </FormInput>
                                </FormItem>
                            </FormGroup>
                            <FormGroup>
                                <FormItem
                                    name="password"
                                    rules={[{ required: true }]}
                                >
                                    <FormInput
                                        isEdit={true}
                                        title={t('form.detail.login.password')}
                                        isRequiredField={true}
                                    >
                                        <Input.Password />
                                    </FormInput>
                                </FormItem>
                            </FormGroup>
                            <FormGroup
                                style={{ display: showMore ? '' : 'none' }}
                            >
                                <FormItem
                                    name="uri"
                                    rules={[{ required: true }]}
                                >
                                    <FormInput
                                        isEdit={true}
                                        title={t('form.detail.login.url')}
                                        isRequiredField={true}
                                    >
                                        <Input />
                                    </FormInput>
                                </FormItem>
                            </FormGroup>
                            <FormGroup
                                height={75}
                                style={{ display: showMore ? '' : 'none' }}
                            >
                                <FormItem name="note">
                                    <FormInput
                                        isEdit={true}
                                        title={t('form.detail.info.note')}
                                    >
                                        <Input.TextArea
                                            style={{ resize: 'none' }}
                                        />
                                    </FormInput>
                                </FormItem>
                            </FormGroup>
                        </Space>
                    </Form>
                    <div
                        style={{
                            padding: '10px 0 15px 0',
                            marginTop: showMore ? 0 : -28,
                        }}
                        onClick={() => setShowMore(!showMore)}
                        className="password-switch"
                    >
                        {showMore ? <UpOutlined /> : <DownOutlined />}
                    </div>
                </div>
                <div className="footer">
                    <Space>
                        <HubButton
                            width={90}
                            height={30}
                            onClick={handleCancel}
                            type="default"
                        >
                            {t('not.now')}
                        </HubButton>
                        <HubButton width={90} height={30} onClick={submit}>
                            {t('save')}
                        </HubButton>
                    </Space>
                </div>
            </div>
        </div>
    )
}

export default savePasswordTip
