import { Space, Typography } from 'antd'
import styles from './index.less'
import Image from '@/popup/components/Image'

const { Text } = Typography

interface IFormHeader {
    title: string
    iconSrc: string
}
const FormHeader = (props: IFormHeader) => {
    return (
        <Space className={styles.hubFormTitle}>
            <div>
                <Image src={props.iconSrc} size={44} />
            </div>
            <div>
                <Text
                    style={{
                        fontSize: '18px',
                        width: '325px',
                        textAlign: 'left',
                    }}
                    ellipsis={{ tooltip: props.title }}
                >
                    {props.title}
                </Text>
            </div>
        </Space>
    )
}

export default FormHeader
