
import { useRouter } from 'next/router'; 
import axios from "axios";
import CollectionPage from "../../components/collection"

const Collection = (props) => {

     const {collection} = props

    return (
        <div>
            <CollectionPage
                collection={collection}
            />
        </div>
    )
}

const list = async () => {
    const res = await axios.get(`https://api.tamagonft.xyz/v1/dashboard`);
    const { collections } = res.data;
    return collections
}

export const getStaticPaths = async () => {
    const res = await axios.get(`https://api.tamagonft.xyz/v1/dashboard`);
    const { collections } = res.data;
    const paths = collections.map((item) => `/collection/${item.slug}`);

    return { paths, fallback: "blocking" };
}

export async function getStaticProps(context) {

    try {

        const slug = context.params.id;
        const collections = await list()

        const collection = collections.find(item => item.slug === slug)

        const { data } = await axios.get(`https://api.tamagonft.xyz/v1/collection/${collection.chainId}/${collection.assetAddress}`)

        return {
            props: {
                collection: {
                    ...collection,
                    ...data
                }
            }, revalidate: 3600
        };
    } catch (error) {
        return { props: { collection : null, error: error.message } };
    }

};


export default Collection
