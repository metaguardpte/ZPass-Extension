import generator from 'generate-password'
import { useEffect, useState } from 'react'
import owasp from 'owasp-password-strength-test'
import phrase, { SeparatorType } from '@/utils/passphrase/phrase'
import {
    Radio,
    InputNumber,
    Checkbox,
    RadioChangeEvent,
    Space,
    Row,
    Col,
    Select,
    Typography,
    Divider,
    Tooltip,
} from 'antd'
import styles from './index.less'
import { SyncOutlined, HistoryOutlined, LeftOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import comm from '@/utils/communication'
import { postPasswordHistory } from '@/services/api/appRequester'
import HubButton from '@/popup/components/HubButton'

type PasswordType = 'char' | 'phrase'
type PropsItem = {
    fillPassword?: (password: string) => void
    styles?: {}
    onSwitch: () => void
}

const { Option } = Select
const { Text } = Typography

let type: PasswordType = 'char'

const SavedPasswords: { [k in string]: string } = {}

const Generate = (props: PropsItem) => {
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
    const navigatge = useNavigate()

    const createRandom = (length: number, options: string[]) => {
        length = length < 8 ? 8 : length
        length = length > 60 ? 60 : length
        const pass = generator.generate({
            length: length,
            numbers: options.includes('numbers'),
            uppercase: options.includes('uppercase'),
            lowercase: options.includes('lowercase'),
            symbols: options.includes('symbols'),
            exclude: options.includes('exclude') ? '1lI0o' : '',
            strict: true,
        })
        let score = 0
        score += (length - 7) * 6
        if (options.includes('exclude')) {
            score += (options.length - 1) * 12
        } else {
            score += options.length * 12
        }
        if (score > 100) score = 100
        setLevel(score)
        setLevel(100 - owasp.test(pass).errors.length * 20)
        setPassword(pass)
    }

    const createPhrase = (
        length: number,
        sep: SeparatorType,
        cap?: boolean
    ) => {
        length = length < 3 ? 3 : length
        length = length > 12 ? 12 : length
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
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabInfo) {
                if (tabInfo.length > 0) {
                    let host = ''
                    const urls = tabInfo[0].url?.split('/')
                    if (urls && urls.length > 3) {
                        host = urls[2]
                    }
                    const tabId = tabInfo[0].id
                    if (tabId) {
                        comm.fillGeneratorPassword(password, tabId)
                        if (SavedPasswords[host] !== password) {
                            postPasswordHistory(password, 2, host)
                            SavedPasswords[host] = password
                        }
                    }
                }
            }
        )
    }

    const copyPassword = async () => {
        navigator.clipboard.writeText(password)
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabInfo) {
                let host = ''
                if (tabInfo.length > 0) {
                    const urls = tabInfo[0].url?.split('/')
                    if (urls && urls.length > 3) {
                        host = urls[2]
                    }
                }
                if (SavedPasswords[host] !== password) {
                    postPasswordHistory(password, 2, host)
                    SavedPasswords[host] = password
                }
            }
        )
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

    return (
        <div>
            <div style={{ display: 'flex', padding: '0px 0 20px 0' }}>
                <div
                    style={{ width: 30, marginLeft: -10 }}
                    className="action-icon"
                >
                    <div
                        className={styles.switchButton}
                        onClick={() => navigatge(-1)}
                    >
                        <LeftOutlined style={{ fontSize: 16 }} />
                    </div>
                </div>
                <div
                    style={{ flex: 1, textAlign: 'center', lineHeight: '30px' }}
                >
                    {t('password.generator')}
                </div>
                <div style={{ width: 30, marginRight: -10 }}>
                    <div
                        className={styles.switchButton}
                        onClick={props.onSwitch}
                    >
                        <Tooltip title={t('password.history')}>
                            <HistoryOutlined style={{ fontSize: 16 }} />
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div>
                <div className={styles.input}>
                    <div style={{ flex: 1 }}>
                        <Text
                            style={{ width: '260px' }}
                            ellipsis={{ tooltip: password }}
                        >
                            {password}
                        </Text>
                    </div>

                    <div style={{ width: 16, marginLeft: 5, opacity: '0.7' }}>
                        <Tooltip title={t('refresh')}>
                            <SyncOutlined onClick={createPassword} />
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div style={{ margin: '12px 0 12px 0' }}>
                <div
                    style={{
                        backgroundColor: strengthBackground(),
                        height: 3,
                        width: `${level}%`,
                    }}
                ></div>
            </div>
            <div style={{ display: 'flex' }}>
                <Space style={{ margin: 'auto' }}>
                    <HubButton width={89} height={30} onClick={copyPassword}>
                        {t('vault.more.btn.copy')}
                    </HubButton>
                    <HubButton width={89} height={30} onClick={fillPassword}>
                        {t('password.fill')}
                    </HubButton>
                </Space>
            </div>
            <Divider className={styles.divider} />

            <div className={styles.optionContainer}>
                <Radio.Group
                    onChange={onChange}
                    value={type}
                    style={{ width: '100%' }}
                >
                    <Row>
                        <Col span={12}>
                            <Radio value="char">{t('password.random')}</Radio>
                        </Col>
                        <Col span={12}>
                            <Radio value="phrase">{t('password.phrase')}</Radio>
                        </Col>
                    </Row>
                </Radio.Group>
                <Divider className={styles.divider} />
                <div style={{ display: type === 'char' ? '' : 'none' }}>
                    <Space>
                        <span>{t('password.characters')}:</span>
                        <InputNumber
                            size="small"
                            min={8}
                            max={60}
                            className={styles.inputNumber}
                            defaultValue={charLength}
                            onChange={(v) => {
                                setCharLength(v)
                                createRandom(v, charOptions)
                            }}
                        />
                    </Space>
                    <Divider className={styles.divider} />
                    <Checkbox.Group
                        defaultValue={charOptions}
                        value={charOptions}
                        onChange={(v) => {
                            if (
                                v.length === 0 ||
                                (v.length === 1 && v.includes('exclude'))
                            ) {
                                return
                            }
                            setCharOptions(v)
                            createRandom(charLength, v)
                        }}
                    >
                        <Space direction="vertical" size={7}>
                            {options.map((item, i) => (
                                <Checkbox key={i} value={item.value}>
                                    {item.label}
                                </Checkbox>
                            ))}
                        </Space>
                    </Checkbox.Group>
                </div>
                <div style={{ display: type === 'phrase' ? '' : 'none' }}>
                    <Row>
                        <Col span={12}>
                            <Space>
                                <span>{t('password.words')}:</span>
                                <InputNumber
                                    size="small"
                                    min={3}
                                    max={12}
                                    className={styles.inputNumber}
                                    defaultValue={phraseLength}
                                    onChange={(v) => {
                                        setPhraseLength(v)
                                        createPhrase(v, separator, capitalize)
                                    }}
                                />
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Space>
                                <span>{t('password.separator')}:</span>
                                <Select
                                    size="small"
                                    defaultValue={separator}
                                    onChange={(v) => {
                                        setSeparator(v)
                                        createPhrase(
                                            phraseLength,
                                            v,
                                            capitalize
                                        )
                                    }}
                                    dropdownMatchSelectWidth={false}
                                    dropdownStyle={{ fontSize: 12 }}
                                    style={{ width: 100 }}
                                    placement="bottomLeft"
                                >
                                    <Option className={styles.option} value="-">
                                        {t('password.hyphens')}
                                    </Option>
                                    <Option className={styles.option} value=" ">
                                        {t('password.spaces')}
                                    </Option>
                                    <Option className={styles.option} value=".">
                                        {t('password.periods')}
                                    </Option>
                                    <Option className={styles.option} value=",">
                                        {t('password.commas')}
                                    </Option>
                                    <Option className={styles.option} value="_">
                                        {t('password.underscores')}
                                    </Option>
                                    <Option className={styles.option} value="n">
                                        {t('password.numbers')}
                                    </Option>
                                    <Option
                                        className={styles.option}
                                        value="ns"
                                    >
                                        {t('password.numbers.symbols')}
                                    </Option>
                                </Select>
                            </Space>
                        </Col>
                    </Row>
                    <Divider className={styles.divider} />
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
    )
}

export default Generate
