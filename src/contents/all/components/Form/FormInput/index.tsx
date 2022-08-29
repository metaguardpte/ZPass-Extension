import { CopyOutlined } from '@ant-design/icons'
import { Input, InputProps, Tooltip, Space, Col } from 'antd'
import {
    cloneElement,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { FormItemContent } from '../FormItem'
import { useTranslation } from 'react-i18next'

interface fieldButtion {
    icon: JSX.Element
    onclick: (e?: any) => void
}

export type FormatResult = {
    formattedValue: string
    separator?: string
}
export interface Props extends InputProps {
    title?: string
    children: JSX.Element
    outerStyle?: React.HTMLAttributes<HTMLDivElement>['style']
    wrapperStyle?: React.HTMLAttributes<HTMLDivElement>['style']
    fieldButtions?: fieldButtion[]
    isEdit?: boolean
    copyValue?: () => string
    anyClientMachine?: boolean
    isDomainItem?: boolean
    appId?: number
    containerId?: string
    isRequiredField?: boolean
    formatter?: (preValue: string, currentValue: string) => FormatResult
    label?: string | JSX.Element
}

const FormInput = (props: Props) => {
    const {
        title,
        wrapperStyle = {},
        children,
        isEdit,
        copyValue,
        outerStyle,
        onChange,
        onBlur,
        anyClientMachine,
        isDomainItem,
        appId,
        containerId,
        isRequiredField = false,
        formatter,
        ...otherProps
    } = props
    const { t } = useTranslation()
    const [validate, setValidate] = useState(true)
    const [focus, setFocus] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const value = useContext(FormItemContent)
    const canCopy = copyValue !== undefined
    const inputRef = useRef<Input>()
    const [preValue, setPreValue] = useState('')
    const [currentValue, setCurrentValue] = useState('')
    const [cursor, setCursor] = useState<number>(0)
    const [forceRender, setForceRender] = useState(false)
    const [msg, setMsg] = useState<JSX.Element | string>()
    useEffect(() => {
        value
            ?.then((res: any) => {
                setValidate(true)
            })
            .catch((e) => {
                setValidate(false)
            })
    }, [value])

    const findFirstDifference = (pre: string, changed: string) => {
        let i = 0
        for (; pre[i] !== undefined && changed[i] !== undefined; i++) {
            if (pre[i] !== changed[i]) {
                return i
            }
        }
        return i
    }

    useEffect(() => {
        if (
            !(
                formatter &&
                typeof inputRef.current?.setSelectionRange === 'function'
            )
        ) {
            return
        }
        const { formattedValue, separator } = formatter(preValue, currentValue)

        let curPos = cursor
        if (cursor === currentValue.length) {
            curPos = formattedValue.length
        } else if (formattedValue.length === preValue.length) {
            if (formattedValue.length < currentValue.length) {
                curPos = findFirstDifference(currentValue, formattedValue)
            } else {
                curPos = cursor
            }
        } else if (formattedValue.length > preValue.length) {
            curPos =
                formattedValue[cursor - 1] === separator ? cursor + 1 : cursor
        } else {
            curPos = cursor
        }
        inputRef.current?.setSelectionRange(curPos, curPos)
        setPreValue(formattedValue)
    }, [forceRender])

    useEffect(() => {
        setValidate(true)
    }, [props])

    const handleFocus = useCallback((e) => {
        const onFocus = children.props.onFocus
        if (typeof onFocus === 'function') {
            onFocus()
        }
        setPreValue(e.target.value)
        setCursor(e.target.value?.length)
        setFocus(true)
    }, [])

    const handleBlur = useCallback((e) => {
        onBlur?.(e)
        const childOnBlur = children.props.onBlur
        if (typeof childOnBlur === 'function') {
            childOnBlur(e)
        }
        setFocus(false)
    }, [])

    const handleChange = useCallback((e) => {
        onChange?.(e)
        if (e.target) {
            setCursor(e.target.selectionStart)
            setCurrentValue(e.target.value)
        } else {
            setCurrentValue(e)
        }
        setForceRender((pre) => !pre)
        const childrenOnChange = children.props.onChange
        if (typeof childrenOnChange === 'function') {
            childrenOnChange(e)
        }
    }, [])

    const childrenProps = {
        onFocus: handleFocus,
        bordered: false,
        onBlur: handleBlur,
        onChange: handleChange,
    }

    const Children = cloneElement(
        children,
        { ...children.props, ...otherProps, ...childrenProps, ref: inputRef },
        children.props.children
    )
    const Title = () => {
        return title || props.label ? (
            <div className={'form-label'}>
                {title ? t(title) : props.label}
                {isRequiredField ? '*' : ''}
            </div>
        ) : (
            <></>
        )
    }

    let buttons: fieldButtion[] = []
    const Buttons = () => {
        if (canCopy) {
            buttons.push({
                icon: (
                    <Tooltip title={t('common.copy')}>
                        <CopyOutlined className={'actionIcon'} />
                    </Tooltip>
                ),
                onclick: () => {
                    navigator.clipboard.writeText(copyValue?.() ?? '')
                },
            })
        }
        buttons = props.fieldButtions
            ? [...buttons, ...props.fieldButtions]
            : buttons

        return (
            <div style={{ display: 'flex' }}>
                {buttons.reverse().map((btn, index) => (
                    <div
                        style={{ cursor: 'pointer', marginLeft: 10 }}
                        onClick={() => btn.onclick()}
                        key={index}
                    >
                        {btn.icon}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div
            className={'form-base'}
            style={{ position: 'relative', width: '100%', ...outerStyle }}
        >
            <div
                className={'form-modal'}
                onMouseEnter={() => setShowModal(true)}
                onMouseLeave={() => setShowModal(false)}
                style={{
                    paddingRight: 25,
                    display: isEdit !== false ? 'none' : 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                }}
            >
                <div
                    style={{
                        display: showModal ? 'flex' : 'none',
                        marginTop: 10,
                    }}
                >
                    <Buttons />
                </div>
            </div>
            <div
                className={`inputContainter ${
                    isEdit !== false ? 'inputEditContainter' : ''
                }`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: !validate
                        ? '1px solid #ff4d4f'
                        : focus
                        ? '1px solid #2AA7FF'
                        : '',
                    ...wrapperStyle,
                    ...{
                        backgroundColor: showModal
                            ? 'rgba(0, 0, 0, 0.05)'
                            : wrapperStyle.backgroundColor,
                    },
                }}
            >
                <Space style={{ flex: 0.4, height: 14 }} size={20}>
                    <Title></Title>
                    <div style={{ lineHeight: '12px' }}>{msg}</div>
                </Space>
                <div
                    style={{ flex: 0.6, display: 'flex', alignItems: 'center' }}
                >
                    {Children}
                </div>
            </div>
        </div>
    )
}

export default FormInput
