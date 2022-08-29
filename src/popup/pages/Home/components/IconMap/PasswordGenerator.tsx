import { useState } from 'react'
import { SvgProps } from '.'
const PasswordGenerator = (props: SvgProps) => {
    const [mouseUp, setMouseUp] = useState(false)

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size}
            height={props.size}
            viewBox="0 0 1163 1163"
            onMouseEnter={() => {
                if (props.hover) return setMouseUp(true)
            }}
            onMouseLeave={() => setMouseUp(false)}
        >
            <path
                fill={mouseUp ? props.hover : props.fill}
                fillRule="evenodd"
                d="M1159,1049.14c-0.99,10.08-2.53,20-6.21,29.55q-25.53,66.165-94.65,81.65c-7.46,1.66-15.2,1.37-22.87,1.3H127.852c-51.787.07-87.916-25.36-112.109-69.57C8.672,1079.15,5.071,1064.91,4,1050.14v-6c0.963-1.73.49-3.6,0.49-5.4q0.036-457.162,0-914.334c0-1.8.473-3.669-.49-5.39v-6a109.03,109.03,0,0,1,9.359-36.939c16.061-34.8,42.129-58.395,78.717-70.262C98.92,3.595,105.964,2.928,113,2h936a103.37,103.37,0,0,1,44.42,13.284c28.06,15.666,48.18,38.241,59.23,68.709,3.66,10.086,5.42,20.439,6.35,31.022v5c-0.96,1.722-.49,3.6-0.49,5.391q-0.03,456.169,0,912.334c0,1.8-.47,3.67.49,5.39v6.01ZM1075.46,128.7c0-25.675-17.99-43.685-43.56-43.685H131.445c-26.065,0-43.909,17.774-43.909,43.741q0,226.268,0,452.534V1033.82c0,26.32,17.793,44.31,43.985,44.31q449.975,0.03,899.949,0c25.89,0,43.99-18.09,43.99-43.87Q1075.475,581.482,1075.46,128.7ZM796,792H736.1v79.1H656V792H597.1v79.1H517V791h79V736.1H516V656h80V594.1H516V514h80.1v78H656V514h80.1v78H795V514h80.1v80.1H796V652h80.1v80.1H796V791h80.1v80.1H796V792ZM739,297H875V433H739V297Zm-225,0H650V433H514V297ZM292,731H428V867H292V731Zm0-217H428V650H292V514Zm0-217H428V433H292V297Z"
            />
        </svg>
    )
}

export default PasswordGenerator
