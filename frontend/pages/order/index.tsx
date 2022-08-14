import type { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router';
import OrderPage from "../../components/orderDetails"

const Order: NextPage = () => {

    const router = useRouter();

    const { cid } = router.query

    return (
        <div>
            <OrderPage
                cid={cid}
            />
        </div>
    )
}

export default Order
