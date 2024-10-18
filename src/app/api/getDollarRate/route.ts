import { getDollarRate } from "~/lib/wallet/utils"

export const GET = async (req:Request,res:Response) => {
    const rate=await getDollarRate()
    return new Response(rate)    
}