import { BigNumber, Wallet } from "ethers";
import { mainnet, taiko } from "../domain/chain";
import type { Bridge, BridgeOpts } from "../domain/bridge";
import ETHBridge from "./bridge";

const sendMessageTx = {
  accessList: [undefined],
  data: "0x123",
  feeData: {
    gasLimit: { hex: "0x01", type: "BigNumber" },
    gasPrice: { hex: "0x01", type: "BigNumber" },
    maxFeePerGas: { hex: "0x00", type: "BigNumber" },
    maxPriorityFeePerGas: {
      hex: "0x00",
      type: "BigNumber",
    },
  },
  from: "0x123",
  network: 1,
  nonce: 0,
  to: "0x123",
  hash: "0x123",
  type: 1,
  value: 100,
};

const mockSigner = {
  getAddress: jest.fn(),
};

const mockContract = {
  sendEther: jest.fn(),
};

jest.mock("ethers", () => ({
  /* eslint-disable-next-line */
  ...(jest.requireActual("ethers") as object),
  Wallet: function () {
    return mockSigner;
  },
  Signer: function () {
    return mockSigner;
  },
  Contract: function () {
    return mockContract;
  },
}));

describe("bridge tests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("approve returns empty transaction", async () => {
    const bridge: Bridge = new ETHBridge();

    const tx = await bridge.Approve({
      amountInWei: BigNumber.from(1),
      signer: new Wallet("0x"),
      contractAddress: "0x1234",
    });
  });

  it("bridges with processing fee", async () => {
    const bridge: Bridge = new ETHBridge();
    const wallet = new Wallet("0x");

    const opts: BridgeOpts = {
      amountInWei: BigNumber.from(1),
      signer: wallet,
      tokenAddress: "",
      fromChainId: mainnet.id,
      toChainId: taiko.id,
      bridgeAddress: "0x456",
      processingFeeInWei: BigNumber.from(2),
      memo: "memo",
    };

    expect(mockSigner.getAddress).not.toHaveBeenCalled();
    await bridge.Bridge(opts);

    expect(mockSigner.getAddress).toHaveBeenCalled();
    expect(mockContract.sendEther).toHaveBeenCalledWith(
      opts.toChainId,
      wallet.getAddress(),
      BigNumber.from(100000),
      opts.processingFeeInWei,
      wallet.getAddress(),
      opts.memo,
      {
        value: opts.amountInWei.add(opts.processingFeeInWei),
      }
    );
  });

  it("bridges without processing fee", async () => {
    const bridge: Bridge = new ETHBridge();

    const wallet = new Wallet("0x");

    const opts: BridgeOpts = {
      amountInWei: BigNumber.from(1),
      signer: wallet,
      tokenAddress: "",
      fromChainId: mainnet.id,
      toChainId: taiko.id,
      bridgeAddress: "0x456",
    };

    await bridge.Bridge(opts);
    expect(mockContract.sendEther).toHaveBeenCalledWith(
      opts.toChainId,
      wallet.getAddress(),
      BigNumber.from(0),
      BigNumber.from(0),
      wallet.getAddress(),
      "",
      { value: opts.amountInWei }
    );
  });
});