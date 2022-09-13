import { SvgProps } from '.'
const CryptoAddress = (props: SvgProps) => {
    return (
        <svg width={props.size} height={props.size} viewBox="0 0 200 200">
            <path
                id="a"
                data-name="a"
                fill="none"
                stroke={props.fill}
                strokeLinejoin="round"
                fillRule="evenodd"
                strokeWidth="15px"
                d="M17.5,23.377l55,26V178.623l-55-26V23.377Zm55,155.1,55-25.952V23.52l-55,25.952V178.48Zm55-154.989,56,25.962V178.509l-56-25.962V23.491Z"
            />
            <path
                id="b"
                data-name="b"
                fillRule="evenodd"
                fill={props.fill}
                d="M86,99.21L100.5,72,115,99.21H86Zm29,3.58L100.5,130,86,102.79h29Z"
            />
        </svg>
    )
}
export default CryptoAddress
