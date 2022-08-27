import styled from "styled-components";
import Orders from "./orders" 
import Collections from "./collections"

const StyledContainer = styled.div`
    padding-bottom: 3rem;
`

const Home = () => {
    return (
        <StyledContainer>
            <Collections/>
            <Orders />
        </StyledContainer>
    )
}

export default Home
