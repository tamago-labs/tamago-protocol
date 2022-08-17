import styled from "styled-components";
import Orders from "./orders"
import Orders2 from "./orders2"

const StyledContainer = styled.div`
    padding-bottom: 3rem;
`

const Home = () => {
    return (
        <StyledContainer>
            {/* <Orders /> */}
            <Orders2/>
        </StyledContainer>
    )
}

export default Home
