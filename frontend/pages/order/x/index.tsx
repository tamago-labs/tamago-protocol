import type { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router';
import MultichainOrderPage from "../../../components/orderDetails/gateway"

const Order: NextPage = () => {

    const router = useRouter();

    const { cid } = router.query

    return (
        <div>
            <MultichainOrderPage
                cid={cid}
            />
        </div>
    )
}

export default Order
