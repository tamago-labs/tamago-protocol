import type { NextPage } from 'next'
import Header from "../../components/header"
import Image from 'next/image'
import Link from "next/link"
import styles from '../styles/Home.module.css'
import AccountPage from "../../components/account"
import { Flex, Box } from 'reflexbox'
import styled from "styled-components"
import Container from "../../components/container"
import MyNFTs from "../../components/account/mynfts"

interface INavItem {
  active?: boolean;
}

const Body = styled(Flex).attrs(() => ({ flexWrap: "wrap" }))`
  
`

const Nav = styled(Box).attrs(() => ({ width: [1 / 3] }))`
  padding: 10px;
  
`

const NavCard = styled.div` 
  background-color: white;
  border: 1px solid white;
  border-radius: 5px;
  color: black;
  box-shadow: 5px 7px black;
`

const Content = styled(Box).attrs(() => ({ width: [2 / 3] }))`
   
`

const Divider = styled.hr`

`


const NavItem = styled.div<INavItem>`
  padding: 5px 20px;
  cursor: pointer;

  :last-child {
    padding-bottom: 15px;
  }

  :hover {
    text-decoration: underline;
  }

  ${props => props.active && `
    text-decoration: underline;
  `}
`

const Title = styled.div`
    font-size: 22px;
    font-weight: 600;
    padding: 10px 20px;
    padding-bottom: 5px;
`

interface IAccountBase {
  children: any
}

export const AccountBase = ({ children }: IAccountBase) => {
  return (
    <Container>
      <Body>
        <Nav>
          <NavCard>
            <Title>
              Account
            </Title>
            <hr />
            <NavItem>
              <Link href="/account">
                Your NFTs
              </Link>
            </NavItem>
            <hr />
            {/* <NavItem>
              <Link href="/account/wl">
                Whitelist Tickets
              </Link>
            </NavItem>
            <hr /> */}
            <NavItem>
              <Link href="/account/orders">
                Opened Orders
              </Link>
            </NavItem>
            {/* <hr />
            <NavItem>
              <Link href="/account/profile">
                Creator Profile
              </Link>
            </NavItem> */}
            {/* <hr />
            <NavItem>
              <Link href="/account/email">
                Email Addresses
              </Link>
            </NavItem> */}
          </NavCard>
        </Nav>
        <Content>
          {children}
        </Content>
      </Body>
    </Container>
  )
}

const Account: NextPage = () => {

  return (
    <AccountBase>
      <MyNFTs/>
    </AccountBase>
  )
}

export default Account
