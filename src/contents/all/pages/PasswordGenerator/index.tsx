import generator from 'generate-password'
import { useEffect, useRef, useState } from 'react'
import owasp from 'owasp-password-strength-test'
import phrase, { SeparatorType } from '@/utils/passphrase/phrase'
import { SyncOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import comm from '@/utils/communication'
import { postPasswordHistory } from '@/services/api/appRequester'
import {
    Radio,
    InputNumber,
    Checkbox,
    RadioChangeEvent,
    Space,
    Typography,
    message,
    Tooltip,
} from 'antd'
import ZpSelect from '@/contents/all/components/ZpSelect'
import { Store } from '@/contents/all/store'

type PasswordType = 'char' | 'phrase'

const { Text } = Typography

let type: PasswordType = 'char'

interface PropsItem {
    store: Store
}

const SavedPasswords: { [k in string]: string } = {}

const PasswordGenerator = (props: PropsItem) => {
    const { t } = useTranslation()
    const [password, setPassword] = useState('')
    const [charLength, setCharLength] = useState<number>(12)
    const [phraseLength, setPhraseLength] = useState<number>(3)
    const [charOptions, setCharOptions] = useState([
        'lowercase',
        'uppercase',
        'numbers',
        'symbols',
        'exclude',
    ])
    const [level, setLevel] = useState<number>(0)
    const [separator, setSeparator] = useState<SeparatorType>('-')
    const [capitalize, setCapitalize] = useState(false)
    const [showSelect, setShowSelect] = useState(false)
    const [tooltipVisible, setTooltipVisible] = useState(false)
    const tooltipEnable = useRef(false)

    const createRandom = (length: number, options: string[]) => {
        const pass = generator.generate({
            length: length,
            numbers: options.includes('numbers'),
            uppercase: options.includes('uppercase'),
            lowercase: options.includes('lowercase'),
            symbols: options.includes('symbols'),
            exclude: options.includes('exclude') ? '1lI0o' : '',
            strict: true,
        })
        setLevel(100 - owasp.test(pass).errors.length * 20)
        setPassword(pass)
    }

    const createPhrase = (
        length: number,
        sep: SeparatorType,
        cap?: boolean
    ) => {
        let pass = phrase(length, sep, cap)
        while (pass.length < 20) {
            pass = phrase(length, sep, cap)
        }
        let score = 80
        if (length > 3) score = 100
        if (cap) score = 100
        if (sep === 'ns') score = 100
        setLevel(score)
        setPassword(pass)
    }

    useEffect(() => {
        createPassword()
    }, [])

    const fillPassword = () => {
        comm.fillGeneratorPassword(password, props.store.tabId)
        close()
        const host = window.location.hostname
        if (SavedPasswords[host] !== password) {
            postPasswordHistory(password, 2, host)
            SavedPasswords[host] = password
        }
    }

    const onChange = (e: RadioChangeEvent) => {
        const v = e.target.value
        type = v
        createPassword()
    }

    const options = [
        { label: t('password.use.number'), value: 'numbers' },
        { label: t('password.use.lowercase'), value: 'lowercase' },
        { label: t('password.use.upercase'), value: 'uppercase' },
        { label: t('password.use.symbols'), value: 'symbols' },
        { label: t('password.exclude.similar'), value: 'exclude' },
    ]

    const createPassword = () => {
        if (type === 'char') {
            createRandom(charLength, charOptions)
        } else {
            createPhrase(phraseLength, separator, capitalize)
        }
    }

    const strengthBackground = () => {
        if (level > 60) {
            return '#8ce32f'
        } else if (level < 60) {
            return '#ff4e00'
        } else {
            return '#ffc600'
        }
    }

    const Divider = () => {
        return (
            <div
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: 'rgba(168,168,168,0.3)',
                    margin: '7px 0',
                }}
            ></div>
        )
    }

    const onEllipsis = (ellipsis: boolean) => {
        tooltipEnable.current = ellipsis
    }

    const close = () => {
        props.store.setGeneratorIconCanShow(false)
    }

    return (
        <div
            style={{
                margin: -2,
                width: 310,
                height: 'auto',
                color: 'white',
                borderRadius: '5px',
                cursor: 'default',
            }}
        >
            <div
                style={{
                    backgroundColor: '#4B5DFE',
                    height: 30,
                    borderRadius: '5px 5px 0 0',
                }}
            ></div>
            <div style={{ color: 'black' }}>
                <div style={{ padding: 20 }}>
                    <div>
                        <div
                            style={{
                                height: '30px',
                                lineHeight: '30px',
                                width: 'auto',
                                display: 'flex',
                                padding: '0 5px',
                                borderRadius: '4px',
                                backgroundColor: '#e5e5e5',
                            }}
                        >
                            <div
                                style={{ flex: 1 }}
                                onMouseEnter={() => setTooltipVisible(true)}
                                onMouseLeave={() => setTooltipVisible(false)}
                            >
                                {tooltipEnable.current ? (
                                    <Tooltip
                                        placement="topLeft"
                                        visible={tooltipVisible}
                                        title={password}
                                        getPopupContainer={(t) =>
                                            t.parentElement
                                                ? t.parentElement
                                                : document.body
                                        }
                                    >
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: 15,
                                            }}
                                        ></span>
                                    </Tooltip>
                                ) : (
                                    <div></div>
                                )}
                                <Text
                                    style={{
                                        width: 240,
                                    }}
                                    ellipsis={{ onEllipsis: onEllipsis }}
                                >
                                    {password}
                                </Text>
                            </div>

                            <div style={{ width: 16, marginLeft: 5 }}>
                                <SyncOutlined onClick={createPassword} />
                            </div>
                        </div>
                    </div>
                    <div style={{ margin: '8px 0 0 0' }}>
                        <div
                            style={{
                                backgroundColor: strengthBackground(),
                                height: 3,
                                width: `${level}%`,
                            }}
                        ></div>
                    </div>
                </div>

                <div
                    style={{
                        padding: '10px 20px 20px 20px',
                        borderRadius: '0 0 5px 5px',
                    }}
                >
                    <div style={{ display: 'flex' }}>
                        <div className="primary-button" onClick={fillPassword}>
                            {t('password.use')}
                        </div>
                    </div>
                    <div>
                        <div
                            onClick={() => setShowSelect(!showSelect)}
                            className="password-switch"
                        >
                            {showSelect ? <UpOutlined /> : <DownOutlined />}
                        </div>
                    </div>
                    <div style={{ display: showSelect ? '' : 'none' }}>
                        <Divider />
                        <Radio.Group
                            onChange={onChange}
                            value={type}
                            style={{ width: '100%' }}
                        >
                            <Space>
                                <Radio value="char">
                                    {t('password.random')}
                                </Radio>
                                <Radio value="phrase">
                                    {t('password.phrase')}
                                </Radio>
                            </Space>
                        </Radio.Group>
                        <Divider />
                        <div
                            style={{
                                display: type === 'char' ? '' : 'none',
                                height: 155,
                            }}
                        >
                            <Space size={5}>
                                <span>{t('password.characters')}:</span>
                                <InputNumber
                                    size="small"
                                    min={8}
                                    max={60}
                                    style={{ width: 50, height: 20 }}
                                    defaultValue={charLength}
                                    onChange={(v) => {
                                        setCharLength(v)
                                        createRandom(v, charOptions)
                                    }}
                                />
                            </Space>
                            <Divider />
                            <Checkbox.Group
                                defaultValue={charOptions}
                                value={charOptions}
                                onChange={(v) => {
                                    if (
                                        v.length === 0 ||
                                        (v.length === 1 &&
                                            v.includes('exclude'))
                                    ) {
                                        return
                                    }
                                    setCharOptions(v)
                                    createRandom(charLength, v)
                                }}
                            >
                                <Space direction="vertical" size={2}>
                                    {options.map((item, i) => (
                                        <Checkbox key={i} value={item.value}>
                                            {item.label}
                                        </Checkbox>
                                    ))}
                                </Space>
                            </Checkbox.Group>
                        </div>
                        <div
                            style={{
                                display: type === 'phrase' ? '' : 'none',
                                height: 155,
                            }}
                        >
                            <Space size={5}>
                                <span>{t('password.words')}:</span>
                                <InputNumber
                                    size="small"
                                    min={3}
                                    max={12}
                                    style={{ width: 50, height: 20 }}
                                    defaultValue={phraseLength}
                                    onChange={(v) => {
                                        setPhraseLength(v)
                                        createPhrase(v, separator, capitalize)
                                    }}
                                />
                            </Space>
                            <Space style={{ float: 'right' }} size={5}>
                                <span>{t('password.separator')}:</span>
                                <ZpSelect
                                    defaultValue={'-'}
                                    onChange={(v: any) => {
                                        setSeparator(v)
                                        createPhrase(
                                            phraseLength,
                                            v,
                                            capitalize
                                        )
                                    }}
                                    options={[
                                        {
                                            label: t('password.hyphens'),
                                            value: '-',
                                        },
                                        {
                                            label: t('password.spaces'),
                                            value: ' ',
                                        },
                                        {
                                            label: t('password.periods'),
                                            value: '.',
                                        },
                                        {
                                            label: t('password.commas'),
                                            value: ',',
                                        },
                                        {
                                            label: t('password.underscores'),
                                            value: '_',
                                        },
                                        {
                                            label: t('password.numbers'),
                                            value: 'n',
                                        },
                                        {
                                            label: t(
                                                'password.numbers.symbols'
                                            ),
                                            value: 'ns',
                                        },
                                    ]}
                                ></ZpSelect>
                            </Space>

                            <Divider />
                            <Checkbox
                                onChange={(e) => {
                                    setCapitalize(e.target.checked)
                                    createPhrase(
                                        phraseLength,
                                        separator,
                                        e.target.checked
                                    )
                                }}
                            >
                                {t('password.use.upercase')}
                            </Checkbox>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PasswordGenerator
