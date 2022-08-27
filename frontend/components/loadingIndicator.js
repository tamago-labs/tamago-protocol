import { Puff } from "react-loading-icons"

const LoadingIndicator = () => {
    return (
        <div style={{ marginLeft :"auto", marginRight : "auto", justifyContent : "center", textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
            <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
                <Puff height="24px" />{` `}<div>Loading...</div>
            </div>
        </div>
    )
}

export default LoadingIndicator