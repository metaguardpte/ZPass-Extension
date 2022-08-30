import { useEffect, useState, useRef } from 'react'
import utils from '@/utils/utils'
import { Typography, Form, Input, Space, Spin } from 'antd'
import styles from './index.less'
import FormInput from '../FormInput'
import FormItem from '../FormItem'
import { decryptDetailContent } from '@/services/api/appRequester'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import { useTranslation } from 'react-i18next'
import FormHeader from './FormHeader'

interface LoginFormProps {
    item: Message.VaultItem<Message.EncryptDetail>
}

const { Title, Text } = Typography

const NoteForm = (props: LoginFormProps) => {
    const { t } = useTranslation()
    const [iconSrc, setIconSrc] = useState<string>('')
    const datasetRef = useRef<boolean>(true)
    const [decryptDetail, setDecryptDetail] =
        useState<Message.SecureNoteDetail>()
    const [form] = useForm()
    const [loading, setLoading] = useState<boolean>(true)

    const decryptLogin = async (item: Message.VaultItem) => {
        const noteItem = item as Message.VaultItem<Message.EncryptDetail>
        const ret = await decryptDetailContent<Message.SecureNoteDetail>(
            noteItem
        )
        if (ret === undefined) {
            return
        }
        if (datasetRef.current === false) {
            return
        }
        setIconSrc(utils.getIconUrl(noteItem))
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

    return (
        <Spin spinning={loading} className={styles.hubFormLoading}>
            <FormHeader
                title={props.item.alias ?? props.item.name}
                iconSrc={iconSrc}
            />
            <div>
                <Form form={form}>
                    <FormItem name="note" noStyle>
                        <FormInput
                            title={t('form.detail.note.note')}
                            wrapperStyle={{ borderRadius: '10px' }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.note ?? ''}
                        >
                            <TextArea
                                autoSize={{
                                    minRows: 10,
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

export default NoteForm
