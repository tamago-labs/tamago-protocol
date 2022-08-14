import styled from "styled-components";
import Orders from "./orders"

const StyledContainer = styled.div`
    padding-bottom: 3rem;
`

const Home = () => {
    return (
        <StyledContainer>
            <Orders />
        </StyledContainer>
    )
}

export default Home
