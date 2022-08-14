import type { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router';
import CollectionPage from "../../components/collection"

const Collection: NextPage = () => {

    const router = useRouter();

    const { chain, address } = router.query

    return (
        <div>
            <CollectionPage
                chain={chain}
                address={address}
            />
        </div>
    )
}

export default Collection
