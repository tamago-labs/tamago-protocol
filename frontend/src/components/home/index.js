import styled from "styled-components"; 
import { Container } from "reactstrap";
import Orders from "./orders"

const StyledContainer = styled(Container)`

`

const Home = () => {
    return (
        <StyledContainer>
                <Orders/>
        </StyledContainer>
    )
}

export default Home
