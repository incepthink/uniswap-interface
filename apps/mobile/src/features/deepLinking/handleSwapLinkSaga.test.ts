import { URL } from 'react-native-url-polyfill'
import { expectSaga } from 'redux-saga-test-plan'
import { handleSwapLink } from 'src/features/deepLinking/handleSwapLinkSaga'
import { openModal } from 'src/features/modals/modalSlice'
import { DAI, UNI, USDC_UNICHAIN_SEPOLIA } from 'uniswap/src/constants/tokens'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { ModalName } from 'uniswap/src/features/telemetry/constants'
import { signerMnemonicAccount } from 'wallet/src/test/fixtures'

const account = signerMnemonicAccount()

function formSwapUrl({
  userAddress,
  chain,
  inputAddress,
  outputAddress,
  currencyField,
  amount,
}: {
  userAddress?: Address
  chain?: UniverseChainId | number
  inputAddress?: string
  outputAddress?: string
  currencyField?: string
  amount?: string
}): URL {
  return new URL(
    `https://uniswap.org/app?screen=swap
&userAddress=${userAddress}
&inputCurrencyId=${chain}-${inputAddress}
&outputCurrencyId=${chain}-${outputAddress}
&currencyField=${currencyField}
&amount=${amount}`.trim(),
  )
}

const swapUrl = formSwapUrl({
  userAddress: account.address,
  chain: UniverseChainId.Mainnet,
  inputAddress: DAI.address,
  outputAddress: UNI[UniverseChainId.Mainnet].address,
  currencyField: 'input',
  amount: '100',
})

const testnetSwapUrl = formSwapUrl({
  userAddress: account.address,
  chain: UniverseChainId.Sepolia,
  inputAddress: USDC_UNICHAIN_SEPOLIA.address,
  outputAddress: UNI[UniverseChainId.Sepolia].address,
  currencyField: 'input',
  amount: '100',
})

const invalidOutputCurrencySwapUrl = formSwapUrl({
  userAddress: account.address,
  chain: UniverseChainId.Mainnet,
  inputAddress: DAI.address,
  outputAddress: undefined,
  currencyField: 'input',
  amount: '100',
})

const invalidInputTokenSwapURl = formSwapUrl({
  userAddress: account.address,
  chain: UniverseChainId.Mainnet,
  inputAddress: '0x00',
  outputAddress: UNI[UniverseChainId.Mainnet].address,
  currencyField: 'input',
  amount: '100',
})

const invalidChainSwapUrl = formSwapUrl({
  userAddress: account.address,
  chain: 23,
  inputAddress: DAI.address,
  outputAddress: UNI[UniverseChainId.Mainnet].address,
  currencyField: 'input',
  amount: '100',
})

const invalidAmountSwapUrl = formSwapUrl({
  userAddress: account.address,
  chain: UniverseChainId.Mainnet,
  inputAddress: DAI.address,
  outputAddress: UNI[UniverseChainId.Mainnet].address,
  currencyField: 'input',
  amount: 'not a number',
})

const invalidCurrencyFieldSwapUrl = formSwapUrl({
  userAddress: account.address,
  chain: UniverseChainId.Mainnet,
  inputAddress: DAI.address,
  outputAddress: UNI[UniverseChainId.Mainnet].address,
  currencyField: 'token1',
  amount: '100',
})

describe(handleSwapLink, () => {
  describe('valid inputs', () => {
    it('Navigates to the swap screen with all params if all inputs are valid; testnet mode aligned', () => {
      return expectSaga(handleSwapLink, swapUrl)
        .put(openModal({ name: ModalName.Swap }))
        .silentRun()
    })
    it('Navigates to the swap screen with all params if all inputs are valid; testnet mode not aligned', () => {
      return expectSaga(handleSwapLink, testnetSwapUrl)
        .put(openModal({ name: ModalName.Swap }))
        .silentRun()
    })
  })

  describe('invalid inputs', () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
    })

    it('Navigates to an empty swap screen if outputCurrency is invalid', () => {
      return expectSaga(handleSwapLink, invalidOutputCurrencySwapUrl)
        .put(openModal({ name: ModalName.Swap }))
        .silentRun()
    })

    it('Navigates to an empty swap screen if inputToken is invalid', () => {
      return expectSaga(handleSwapLink, invalidInputTokenSwapURl)
        .put(openModal({ name: ModalName.Swap }))
        .silentRun()
    })

    it('Navigates to an empty swap screen if the chain is not supported', () => {
      return expectSaga(handleSwapLink, invalidChainSwapUrl)
        .put(openModal({ name: ModalName.Swap }))
        .silentRun()
    })

    it('Navigates to an empty swap screen if the swap amount is invalid', () => {
      return expectSaga(handleSwapLink, invalidAmountSwapUrl)
        .put(openModal({ name: ModalName.Swap }))
        .silentRun()
    })

    it('Navigates to an empty swap screen if currency field is invalid', () => {
      return expectSaga(handleSwapLink, invalidCurrencyFieldSwapUrl)
        .put(openModal({ name: ModalName.Swap }))
        .silentRun()
    })
  })
})
