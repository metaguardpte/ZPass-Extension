import List, { DataType } from './components/List'
import store from '@/contents/all/store'

type Props = {
    style: React.HTMLAttributes<HTMLDivElement>['style']
    type: DataType
}

function ControlIcon(props: Props) {
    return (
        <div style={{ color: 'black' }}>
            <div style={props.style} draggable="false" id="box">
                <div className="boxContent">
                    <div className="iconContainter">
                        <span>
                            <div className="iconContent">
                                <img
                                    src={chrome.runtime.getURL(
                                        'images/logo32.png'
                                    )}
                                    className="icon"
                                ></img>
                            </div>
                        </span>
                    </div>
                    <div className="listWrapper">
                        <div className="listContainter" id="list">
                            <List store={store} type={props.type} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ControlIcon
