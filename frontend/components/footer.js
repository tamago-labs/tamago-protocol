import styled from "styled-components";
import { Flex, Box } from 'reflexbox'
import Link from "next/link"

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
    div {
        :first-child {
            text-align: left;
            padding-left: 10px;
        }
        :last-child {
            text-align: right;
            padding-right: 10px;
        }
    }

    a {
        margin-right: 7px;
    }
    

`

const A = styled.a`
    
`
const Footer = () => {
    return (
        <Wrapper>
            <Flex flexWrap='wrap'>
                <Box width={[1, 1 / 3]}>
                    Made  with ❤️ by{` `}<A rel="noreferrer" href="https://tamago.finance" target="_blank">Tamago Protocol</A>
                </Box>
                <Box width={[1, 2 / 3]}>
                    <Link href="/privacy">
                        Privacy Policy
                    </Link>
                    {` `}
                    <Link href="/terms">
                        Terms & Conditions
                    </Link>
                </Box>
            </Flex>
        </Wrapper>
    )
}

export default Footer