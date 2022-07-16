
import { TabContent as TC, TabPane as TP, Nav as N, NavItem as NI, NavLink as NL } from 'reactstrap';
import styled from 'styled-components';

export const TabContent = styled(TC)`

`

export const TabPane = styled(TP)`
    padding-top: 1rem;
    padding-bottom: 1rem; 
    >div {
        display: flex;
        flex-wrap: wrap;
        max-height: 650px;
        overflow-x: auto;
    }
`

export const Nav = styled(N)`

`

export const NavItem = styled(NI)`

`

export const NavLink = styled(NL)`
    color: inherit;
    :hover {
        color: inherit;
    }
    cursor: pointer;
`
