import type { NextPage } from 'next'
import Header from "../components/header"
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import LaunchpadPage from "../components/launchpad"

const Launchpad: NextPage = () => {
  return (
    <div>
      <LaunchpadPage />
    </div>
  )
}

export default Launchpad
