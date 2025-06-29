import { useAccount } from 'hooks/useAccount'
import { formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import './index.css'

const MaxButton = ({ token, setToken }: any) => {
  const { address } = useAccount()

  // pulls ERC-20 balance if `token` supplied, native balance otherwise
  const balanceQuery = useBalance({
    address,
    token: token as `0x${string}`, // omit for ETH
  })

  const maxHuman = balanceQuery.data ? formatUnits(balanceQuery.data.value, balanceQuery.data.decimals) : '0'

  const handleMaxClick = () => {
    setToken(parseFloat(maxHuman).toFixed(5))
  }

  return (
    <div className="max-btn">
      <span>Balance: </span>
      <span>{parseFloat(maxHuman).toFixed(5)}</span>
      <span onClick={handleMaxClick} className="max">
        Max
      </span>
    </div>
  )
}

export default MaxButton
