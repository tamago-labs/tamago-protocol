import { useCallback } from "react";
import axios from "axios";
import { COIN_GECKO_API_BASE } from "../constants";
import { ethers } from "ethers";

const useCoingecko = () => {

    const getLowestPrice = useCallback(async (orders) => {
        let usdPrice = [];

        //get price data from CoinGecko
        const priceData = await axios.get(
            `${COIN_GECKO_API_BASE}/simple/price?ids=wmatic,weth,dai,busd,wbnb,tether,usd-coin,crypto-com-chain&vs_currencies=usd`
        );

        let items = []

        //change token price to usd and keep it in array
        orders.map((order) => {
            const tokens = order.barterList.filter((item) => item.tokenType === 0);
            for (let token of tokens) {
                if (token) {
                    let tokenUsdPrice;
                    let tokenPrice = ethers.utils.formatUnits(
                        token.assetTokenIdOrAmount,
                        token.decimals
                    );
                    
                    switch (token.symbol.toLowerCase()) {
                        case "wmatic":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data.wmatic.usd;
                            break;
                        case "usdc":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data['usd-coin'].usd;
                            break;
                        case "usdc.e":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data['usd-coin'].usd;
                            break;
                        case "usdt":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data.tether.usd;
                            break;
                        case "usdt.e":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data.tether.usd;
                            break;
                        case "weth":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data.weth.usd;
                            break;
                        case "dai":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data.dai.usd;
                            break;
                        case "busd":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data.busd.usd;
                            break;
                        case "wbnb":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data.wbnb.usd;
                            break;
                        case "cro":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data['crypto-com-chain'].usd;
                            break;
                        case "wcro":
                            tokenUsdPrice = parseFloat(tokenPrice) * priceData.data['crypto-com-chain'].usd;
                            break;
                        default:
                            tokenUsdPrice = parseFloat(tokenPrice);
                            break;
                    }

                    usdPrice.push(tokenUsdPrice);
                    items.push({
                        cid: order.cid,
                        value: tokenUsdPrice
                    })
                }
            }
        });

        //sort
        usdPrice.sort((a, b) => a - b);

        return {
            all: usdPrice && usdPrice.length > 0 ? usdPrice[0] : 0,
            items
        };
    }, []);

    return { getLowestPrice };
};

export default useCoingecko;
