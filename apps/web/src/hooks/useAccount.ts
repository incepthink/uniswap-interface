import { useMemo } from 'react'
import { useSupportedChainIdWithConnector } from 'uniswap/src/features/chains/hooks/useSupportedChainId'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {
  useAccount as useAccountWagmi,
  useChainId,
  type Register,
  type UseAccountReturnType as UseAccountReturnTypeWagmi,
} from 'wagmi'

type ReplaceChainId<T> = T extends { chainId: number }
  ? Omit<T, 'chainId'> & { chainId: UniverseChainId | undefined }
  : T extends { chainId: number | undefined }
    ? Omit<T, 'chainId'> & { chainId: UniverseChainId | undefined }
    : T

type UseAccountReturnType = ReplaceChainId<UseAccountReturnTypeWagmi<Register['config']>>

export function useAccount(): UseAccountReturnType {
  const { chainId, ...rest } = useAccountWagmi()
  const fallbackChainId = useChainId()
  const supportedChainId = useSupportedChainIdWithConnector(chainId ?? fallbackChainId, rest.connector)

  return useMemo(
    () => ({
      ...rest,
      chainId: supportedChainId,
    }),
    [rest, supportedChainId],
  )
}
