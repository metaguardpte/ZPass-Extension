import { InputProps, Tooltip } from 'antd'
import {
    useState,
    useContext,
    cloneElement,
    useCallback,
    useEffect,
    useRef,
} from 'react'
import { FormItemContent } from '../FormItem'
import styles from './index.less'
import { v4 } from 'uuid'
import utils from '@/utils/utils'
import { t } from 'i18next'

interface fieldButtion {
    icon: JSX.Element
    onclick: (e?: any) => void
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
    browserStatus?: number
}

const FormInput = (props: Props) => {
    const {
        title,
        wrapperStyle,
        children,
        isEdit,
        copyValue,
        outerStyle,
        onChange,
        anyClientMachine,
        isDomainItem,
        appId,
        containerId,
        browserStatus,
        fieldButtions,
        ...otherProps
    } = props
    const [validate, setValidate] = useState(true)
    const [focus, setFocus] = useState(false)
    const [showButtons, setShowButtions] = useState(false)
    const value = useContext(FormItemContent)
    const canCopy = copyValue !== undefined
    const datasetRef = useRef<boolean>(true)
    const [showPass, setShowPass] = useState<boolean>(false)
    useEffect(() => {
        datasetRef.current = true
        value
            ?.then(() => {
                if (datasetRef.current) {
                    setValidate(true)
                }
            })
            .catch((e) => {
                if (datasetRef.current) {
                    setValidate(false)
                }
            })
        return () => {
            datasetRef.current = false
        }
    }, [value])
    useEffect(() => {
        setValidate(true)
    }, [props])
    const handleFocus = useCallback(() => {
        const onFocus = children.props.onFocus
        if (typeof onFocus === 'function') {
            onFocus()
        }
        setFocus(true)
    }, [])
    const handleBlur = useCallback(() => {
        const onBlur = children.props.onBlur
        if (typeof onBlur === 'function') {
            onBlur()
        }
        setFocus(false)
    }, [])
    const handleChange = useCallback((e) => {
        onChange?.(e)
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

    if (children.type === 'div') {
        delete childrenProps.bordered
    }

    const Children = cloneElement(
        children,
        { ...children.props, ...otherProps, ...childrenProps },
        children.props.children
    )
    const Title = () => {
        return title !== undefined ? (
            <span className="hubFontColorLow" style={{ lineHeight: '18px' }}>
                {title}
            </span>
        ) : (
            <></>
        )
    }

    const Buttons = () => {
        const [mouseUp, setMouseUp] = useState<boolean>(false)
        let buttons: fieldButtion[] = []
        if (canCopy) {
            buttons.push({
                icon: (
                    <Tooltip title={t('copy')} visible={mouseUp}>
                        <img
                            onMouseEnter={() => setMouseUp(true)}
                            onMouseLeave={() => setMouseUp(false)}
                            style={{ marginTop: -2, height: 16, width: 16 }}
                            src={
                                mouseUp
                                    ? chrome.runtime.getURL(
                                          'images/icons/copy-blue.svg'
                                      )
                                    : chrome.runtime.getURL(
                                          'images/icons/copy.svg'
                                      )
                            }
                        ></img>
                    </Tooltip>
                ),
                onclick: () => {
                    utils.copyText(copyValue?.() ?? '')
                },
            })
        }
        if (fieldButtions !== undefined) {
            buttons = [
                ...buttons,
                ...fieldButtions.map((item) => {
                    return {
                        icon: (
                            <Tooltip title={showPass ? t('hide') : t('show')}>
                                <div className={styles.actionIcon}>
                                    {item.icon}
                                </div>
                            </Tooltip>
                        ),
                        onclick: () => {
                            setShowPass(!showPass)
                            item.onclick()
                        },
                    }
                }),
            ]
        }

        return (
            <div style={{ display: 'flex' }}>
                {buttons.reverse().map((btn) => (
                    <div
                        key={v4()}
                        style={{ cursor: 'pointer', marginLeft: 10 }}
                        onClick={() => btn.onclick()}
                    >
                        {btn.icon}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div
            className={styles.main}
            style={{ position: 'relative', width: '100%', ...outerStyle }}
        >
            <div
                className={`${styles.modal}`}
                onMouseEnter={() => setShowButtions(true)}
                onMouseLeave={() => setShowButtions(false)}
                style={{
                    ...wrapperStyle,
                    paddingRight: 25,
                    display: isEdit === true ? 'none' : 'flex',
                    justifyContent: 'flex-end',
                    // alignItems: 'center',
                }}
            >
                <div
                    style={{
                        display: showButtons ? 'flex' : 'none',
                        marginTop: 7,
                    }}
                >
                    <Buttons />
                </div>
            </div>
            <div
                className={`${styles.inputContainter} ${
                    isEdit ? styles.inputEditContainter : ''
                }`}
                style={{
                    borderColor: !validate ? 'red' : focus ? '#2AA7FF' : '',
                    ...wrapperStyle,
                }}
            >
                <Title></Title>
                {Children}
            </div>
        </div>
    )
}

export default FormInput
