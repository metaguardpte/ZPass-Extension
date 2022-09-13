import { useEffect, useState, useRef } from 'react'
import utils from '@/utils/utils'
import {
    Typography,
    Form,
    Input,
    Space,
    Spin,
    Tooltip,
    Select,
    Row,
    Col,
} from 'antd'
import styles from './index.less'
import FormInput from '../FormInput'
import FormItem from '../FormItem'
import { decryptDetailContent } from '@/services/api/appRequester'
import TextArea from 'antd/lib/input/TextArea'
import { useTranslation } from 'react-i18next'
import country from '@/utils/country'
import FormHeader from './FormHeader'

interface LoginFormProps {
    item: Message.VaultItem<Message.EncryptDetail>
}

const { Title, Text } = Typography

const MAX_LENGTH = 255

const PersonalInfoForm = (props: LoginFormProps) => {
    const { t } = useTranslation()
    const [iconSrc, setIconSrc] = useState<string>('')
    const datasetRef = useRef<boolean>(true)
    const [decryptDetail, setDecryptDetail] =
        useState<Message.PersonalInfoDetail>()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState<boolean>(true)
    const [mouseUp, setMouseUp] = useState<boolean>(false)

    const decryptLogin = async (item: Message.VaultItem) => {
        const infoItem = item as Message.VaultItem<Message.EncryptDetail>
        const ret = await decryptDetailContent<Message.PersonalInfoDetail>(
            infoItem
        )
        if (ret === undefined) {
            return
        }
        if (datasetRef.current === false) {
            return
        }
        setIconSrc(utils.getIconUrl(infoItem))
        setDecryptDetail(ret)
        form.setFieldsValue(ret)
        setLoading(false)
    }

    const handleAddressGroupCopy = () => {
        const addrs: string[] = []
        if (decryptDetail?.address1) addrs.push(decryptDetail.address1)
        if (decryptDetail?.address2) addrs.push(decryptDetail.address2)
        if (decryptDetail?.city) addrs.push(decryptDetail.city)
        if (decryptDetail?.province) addrs.push(decryptDetail.province)
        if (decryptDetail?.country) {
            addrs.push(t(`country.${decryptDetail.country}`))
        }
        const address = addrs.join(' ')
        utils.copyText(address ?? '')
    }

    const handleFieldRadius = (fieldName: string, original: string): string => {
        if (loading) {
            return original
        }
        const calculateAddressGroupRadius = (fieldName: string) => {
            const fields = [
                'address1',
                'address2',
                'city',
                'province',
                'zipCode',
                'country',
            ]
            const radius = '10px'
            const zeroRadius = '0'

            const firstField = fields.find((field) => !isEmptyField(field))
            const lastField = fields
                .reverse()
                .find((field) => !isEmptyField(field))

            const pair = { left: 'city', right: 'province' }
            if (fieldName === pair.left) {
                const leftTop = firstField === pair.left ? radius : zeroRadius
                const leftButtom =
                    lastField === pair.left || lastField === pair.right
                        ? radius
                        : zeroRadius
                const rightTop =
                    firstField === pair.left && isEmptyField(pair.right)
                        ? radius
                        : zeroRadius
                const rightButtom =
                    lastField === pair.left && isEmptyField(pair.right)
                        ? radius
                        : zeroRadius
                return `${leftTop} ${rightTop} ${rightButtom} ${leftButtom}`
            } else if (fieldName === pair.right) {
                const leftTop = firstField === pair.right ? radius : zeroRadius
                const leftButtom =
                    lastField === pair.right && isEmptyField(pair.left)
                        ? radius
                        : zeroRadius
                const rightTop =
                    firstField === pair.right || firstField === pair.left
                        ? radius
                        : zeroRadius
                const rightButtom =
                    lastField === pair.right ? radius : zeroRadius
                return `${leftTop} ${rightTop} ${rightButtom} ${leftButtom}`
            }
            const topRadius =
                firstField === fieldName
                    ? `${radius} ${radius}`
                    : `${zeroRadius} ${zeroRadius}`
            const bottomRadius =
                lastField === fieldName
                    ? `${radius} ${radius}`
                    : `${zeroRadius} ${zeroRadius}`
            return topRadius + ' ' + bottomRadius
        }
        switch (fieldName) {
            case 'address1':
            case 'city':
            case 'province':
            case 'zipCode':
            case 'address2':
            case 'country':
                return calculateAddressGroupRadius(fieldName)
            default:
                return original
        }
    }

    const SectionOne = ['fullName', 'email', 'phone']

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

    const isEmptyField = (fieldName: string) => {
        if (loading) {
            return true
        }
        return (
            form.getFieldValue(fieldName) === '' ||
            !form.getFieldValue(fieldName)
        )
    }

    const handleFieldVisible = (fieldName: string): string => {
        if (loading) {
            return 'none'
        }
        const isEmptyAddressGroup = () => {
            return (
                isEmptyField('address1') &&
                isEmptyField('address2') &&
                isEmptyField('city') &&
                isEmptyField('province') &&
                isEmptyField('zipCode') &&
                isEmptyField('country')
            )
        }

        switch (fieldName) {
            case 'groupAddress':
                return isEmptyAddressGroup() ? 'none' : 'flex'
            case 'groupOther':
                return isEmptyField('note') ? 'none' : 'block'
            default:
                return isEmptyField(fieldName) ? 'none' : 'block'
        }
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
            <div style={{ marginBottom: '10px' }}>
                <Form initialValues={{ dump: '' }} form={form}>
                    <Space style={{ margin: '10px 0' }}>
                        <Text>{t('form.detail.info.contactDetails')}</Text>
                    </Space>
                    <FormItem name="fullName" noStyle>
                        <FormInput
                            title={t('form.detail.info.fullName')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'fullName',
                                    SectionOne
                                ),
                                display: handleFieldVisible('fullName'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.fullName ?? ''}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="email" noStyle>
                        <FormInput
                            title={t('form.detail.info.email')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'email',
                                    SectionOne
                                ),
                                display: handleFieldVisible('email'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.email ?? ''}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="phone" noStyle>
                        <FormInput
                            title={t('form.detail.info.phone')}
                            wrapperStyle={{
                                borderRadius: getFieldBorderRadius(
                                    'phone',
                                    SectionOne
                                ),
                                display: handleFieldVisible('phone'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.phone ?? ''}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>

                    <Space
                        style={{
                            margin: '10px 0',
                            display: handleFieldVisible('groupAddress'),
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text>{t('form.detail.info.addressDetails')}</Text>

                        <Tooltip title={t('copy')} visible={mouseUp}>
                            <img
                                onMouseEnter={() => setMouseUp(true)}
                                onMouseLeave={() => setMouseUp(false)}
                                style={{ marginTop: -2 }}
                                src={
                                    mouseUp
                                        ? 'images/icons/copy-blue.svg'
                                        : 'images/icons/copy.svg'
                                }
                                onClick={handleAddressGroupCopy}
                            ></img>
                        </Tooltip>
                    </Space>
                    <FormItem name="address1" noStyle>
                        <FormInput
                            title={t('form.detail.info.address1')}
                            wrapperStyle={{
                                borderRadius: handleFieldRadius(
                                    'address1',
                                    '10px 10px 0 0'
                                ),
                                display: handleFieldVisible('address1'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.address1 ?? ''}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="address2" noStyle>
                        <FormInput
                            title={t('form.detail.info.address2')}
                            wrapperStyle={{
                                borderRadius: handleFieldRadius(
                                    'address2',
                                    '0'
                                ),
                                display: handleFieldVisible('address2'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.address2 ?? ''}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <Row>
                        <Col
                            span={
                                handleFieldVisible('province') === 'none'
                                    ? 24
                                    : 12
                            }
                            style={{ display: handleFieldVisible('city') }}
                        >
                            <FormItem name="city" noStyle>
                                <FormInput
                                    title={t('form.detail.info.city')}
                                    wrapperStyle={{
                                        borderRadius: handleFieldRadius(
                                            'city',
                                            '0'
                                        ),
                                        display: handleFieldVisible('city'),
                                    }}
                                    isEdit={false}
                                    copyValue={() => decryptDetail?.city ?? ''}
                                >
                                    <Input
                                        maxLength={MAX_LENGTH}
                                        className={styles.input}
                                    />
                                </FormInput>
                            </FormItem>
                        </Col>
                        <Col
                            span={
                                handleFieldVisible('city') === 'none' ? 24 : 12
                            }
                            style={{ display: handleFieldVisible('province') }}
                        >
                            <FormItem name="province" noStyle>
                                <FormInput
                                    title={t('form.detail.info.province')}
                                    wrapperStyle={{
                                        borderRadius: handleFieldRadius(
                                            'province',
                                            '0'
                                        ),
                                        display: handleFieldVisible('province'),
                                    }}
                                    isEdit={false}
                                    copyValue={() =>
                                        decryptDetail?.province ?? ''
                                    }
                                >
                                    <Input
                                        maxLength={MAX_LENGTH}
                                        className={styles.input}
                                    />
                                </FormInput>
                            </FormItem>
                        </Col>
                    </Row>
                    <FormItem name="zipCode" noStyle>
                        <FormInput
                            title={t('form.detail.info.zipCode')}
                            wrapperStyle={{
                                borderRadius: handleFieldRadius('zipCode', '0'),
                                display: handleFieldVisible('zipCode'),
                            }}
                            isEdit={false}
                            copyValue={() => decryptDetail?.zipCode ?? ''}
                        >
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="country" noStyle>
                        <FormInput
                            title={t('form.detail.info.country')}
                            wrapperStyle={{
                                borderRadius: handleFieldRadius(
                                    'country',
                                    '0 0 10px 10px'
                                ),
                                display: handleFieldVisible('country'),
                            }}
                            isEdit={false}
                            copyValue={() =>
                                t(`country.${decryptDetail?.country}`) ?? ''
                            }
                        >
                            <Select
                                className={styles.inputSelect}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {Object.keys(country).map((key) => (
                                    <Select.Option value={key} key={key}>
                                        {t(`country.${key}`)}
                                    </Select.Option>
                                ))}
                            </Select>
                            {/* <Input maxLength={MAX_LENGTH} className={styles.input} value={t(`country.${decryptDetail?.country}`) as string ?? ''} /> */}
                        </FormInput>
                    </FormItem>

                    <Space
                        style={{
                            margin: '10px 0',
                            display: handleFieldVisible('groupOther'),
                        }}
                    >
                        <Text>{t('form.detail.info.other')}</Text>
                    </Space>
                    <FormItem name="note" noStyle>
                        <FormInput
                            title={t('form.detail.info.note')}
                            wrapperStyle={{
                                borderRadius: '10px',
                                display: handleFieldVisible('note'),
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

export default PersonalInfoForm
