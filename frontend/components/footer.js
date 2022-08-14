import styled from "styled-components";

const Wrapper = styled.footer`
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: black;
    color: white;
    padding: 10px;
    font-size: 12px;
    text-align: center;
    z-index: 100;

`

const A = styled.a`
    color: inherit;
    :hover {
        color: inherit;
    }
`
const Footer = () => {
    return (
        <Wrapper>
            Made  with ❤️ by{` `}<A href="https://tamago.finance" target="_blank">Tamago Protocol</A>
        </Wrapper> 
    )
}

export default Footer