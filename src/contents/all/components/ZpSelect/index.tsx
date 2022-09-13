import { useEffect, useState, memo, CSSProperties } from 'react'
import { DownOutlined } from '@ant-design/icons'

type ValueType = string | number | JSX.Element

interface DataItem {
    label: string | JSX.Element
    value: string
}

interface OptionItem {
    children: string | JSX.Element
    value: string
    onClick?: () => void
    selected?: boolean
}

interface SelectItem {
    options: DataItem[]
    defaultValue?: ValueType
    children?: JSX.Element[]
    onChange?: (value: ValueType) => void
    inputStyles?: CSSProperties
    optionStyles?: CSSProperties
}

const Option = (props: OptionItem) => {
    return (
        <div
            onClick={props.onClick}
            className="select-option-list"
            style={
                props.selected
                    ? {
                          backgroundColor: '#e6f7ff',
                          color: '#000000',
                      }
                    : {}
            }
        >
            {props.children}
        </div>
    )
}

const Select = (props: SelectItem) => {
    const [selectItem, setSelectItem] = useState<DataItem>(initItem())
    const [showOptions, setShowOptions] = useState(false)

    function initItem() {
        if (props.defaultValue) {
            for (const opt of props.options) {
                if (opt.value === props.defaultValue) {
                    return opt
                }
            }
        }
        return props.options[0]
    }

    useEffect(() => {
        if (selectItem) props.onChange?.(selectItem.value)
    }, [selectItem])

    const closeOption = () => {
        setShowOptions(false)
    }

    useEffect(() => {
        if (showOptions) {
            document.addEventListener('click', closeOption, false)
        }
        return () => {
            document.removeEventListener('click', closeOption, false)
        }
    }, [showOptions])

    return (
        <div style={{ fontSize: '12px' }}>
            <div
                onClick={() => setShowOptions(!showOptions)}
                style={{
                    ...props.inputStyles,
                }}
                className={`zp-select ${showOptions ? 'select-open' : ''}`}
            >
                <div
                    style={{
                        flex: 1,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {selectItem?.label || props.options[0]?.label}
                </div>
                <div style={{ width: 12 }}>
                    <DownOutlined />
                </div>
            </div>
            <div
                style={{
                    display: showOptions ? '' : 'none',
                    position: 'absolute',
                    width: 140,
                    backgroundColor: '#ffffff',
                    minWidth: 100,
                    borderRadius: 2,
                    marginTop: 2,
                    marginLeft: -50,
                    boxShadow:
                        '0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%)',
                    ...props.optionStyles,
                }}
            >
                {props.options.map((item) => (
                    <Option
                        key={item.value}
                        value={item.value}
                        selected={item.value === selectItem?.value}
                        onClick={() => setSelectItem(item)}
                    >
                        {item.label}
                    </Option>
                ))}
            </div>
        </div>
    )
}

const ZpSelect = memo(Select)

export default ZpSelect
