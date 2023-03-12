import axios from "axios";

export const getCMCPrices = async (): Promise<{ [property: string]: number; }> => {
  return new Promise (async (resolve) =>{
    let prices = await axios.get("https://comms.globalxchange.com/coin/getCmcprices") as any;
    prices = prices.data;
    if(!prices.status) prices = {};

    const rates: { [property: string]: number; } = prices

    return resolve(rates);
  })
}