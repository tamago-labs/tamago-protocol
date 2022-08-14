import type { NextPage } from 'next'
import Header from "../components/header"
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import FaucetPage from "../components/faucet"

const Faucet: NextPage = () => {
  return (
    <div>
     <FaucetPage/>
    </div>
  )
}

export default Faucet
