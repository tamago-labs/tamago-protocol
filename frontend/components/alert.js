
import styled from "styled-components"

const Wrapper = styled.div`
    background: #20283E;
    padding: 10px 5px;
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    border: 1px solid white;
    border-radius: 8px;
    text-align: center;

`

export const Alert = ({ children }) => {
    return (
        <Wrapper>
            {children}
        </Wrapper>
    )
}

