import styled from "styled-components";
import Orders from "./orders"
import Collections from "./collections"

const StyledContainer = styled.div`
    padding-bottom: 3rem;
`

const Home = ({
    collections
}) => {
    return (
        <StyledContainer>
            <Collections
                collections={collections}
            />
            <Orders />
        </StyledContainer>
    )
}

export default Home
