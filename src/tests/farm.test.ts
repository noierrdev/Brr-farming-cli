import { Cluster, Connection, Keypair, PublicKey } from "@solana/web3.js";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { PoolFarmImpl } from "../farm";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { airDropSol, getFarmProgram } from "../utils";
import { DEVNET_COIN } from "../constant";
import { TokenListProvider } from "@solana/spl-token-registry";

const DEVNET_POOL = new PublicKey(
  "BAHscmu1NncGS7t4rc5gSBPv1UFEMkvLaon1Ahdd5rHi"
);
const MAINNET_POOL = new PublicKey(
  "6ZLKLjMd2KzH7PPHCXUPgbMAtdTT37VgTtdeXWLoJppr"
);

const DEVNET = {
  connection: new Connection("https://api.devnet.solana.com/", {
    commitment: "confirmed",
  }),
  cluster: "devnet",
};

const MAINNET = {
  connection: new Connection(process.env.MAINNET_RPC_ENDPOINT as string),
  cluster: "mainnet-beta",
};

const mockWallet = new Wallet(
  process.env.WALLET_PRIVATE_KEY
    ? Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY))
    : new Keypair()
);

describe("Interact with devnet farm", () => {
  const provider = new AnchorProvider(DEVNET.connection, mockWallet, {
    commitment: "confirmed",
  });

  let farm: PoolFarmImpl;
  let lpBalance: BN;
  let stakedBalance: BN;
  beforeAll(async () => {
    await airDropSol(DEVNET.connection, mockWallet.publicKey).catch(() => {});

    const USDT = DEVNET_COIN.find(
      (token) =>
        token.address === "9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9"
    );
    const USDC = DEVNET_COIN.find(
      (token) => token.address === "zVzi5VAf4qMEwzv7NXECVx5v2pQ7xnqVVjCXZwS9XzA"
    );

    const pool = await AmmImpl.create(
      DEVNET.connection,
      new PublicKey(DEVNET_POOL),
      USDT!,
      USDC!,
      {
        cluster: DEVNET.cluster as Cluster,
      }
    );

    const inAmountALamport = new BN(0.1 * 10 ** pool.tokenA.decimals);
    const inAmountBLamport = new BN(0.1 * 10 ** pool.tokenB.decimals);

    const { minPoolTokenAmountOut, tokenAInAmount, tokenBInAmount } =
      pool.getDepositQuote(inAmountALamport, inAmountBLamport, false, 1);

    const depositTx = await pool.deposit(
      mockWallet.publicKey,
      tokenAInAmount,
      tokenBInAmount,
      minPoolTokenAmountOut
    );

    try {
      const depositResult = await provider.sendAndConfirm(depositTx);
      expect(typeof depositResult).toBe("string");
      lpBalance = await pool.getUserBalance(mockWallet.publicKey);
      expect(lpBalance.toNumber()).toBeGreaterThan(0);
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }

    const farmingPool = await PoolFarmImpl.getFarmAddressesByPoolAddress(
      DEVNET_POOL,
      "devnet"
    );
    farm = await PoolFarmImpl.create(
      DEVNET.connection,
      farmingPool[0].farmAddress
    );
  });

  test("Stake farm", async () => {
    const stakeTx = await farm.deposit(mockWallet.publicKey, lpBalance);
    try {
      const stakeResult = await provider.sendAndConfirm(stakeTx);
      expect(typeof stakeResult).toBe("string");

      stakedBalance = await farm.getUserBalance(mockWallet.publicKey);

      expect(stakedBalance.toNumber()).toBeGreaterThan(0);
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test("Unstake farm", async () => {
    const unStakeTx = await farm.withdraw(mockWallet.publicKey, stakedBalance);
    try {
      const unStakeResult = await provider.sendAndConfirm(unStakeTx);
      expect(typeof unStakeResult).toBe("string");

      const stakedBalanceMap = await PoolFarmImpl.getUserBalances(
        DEVNET.connection,
        mockWallet.publicKey,
        [farm.address]
      );

      expect(stakedBalanceMap.size).toBe(0);
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });
});

describe("Interact with mainnet farm", () => {
  const provider = new AnchorProvider(MAINNET.connection, mockWallet, {
    commitment: "confirmed",
  });

  let farm: PoolFarmImpl;
  beforeAll(async () => {
    const farmingPool = await PoolFarmImpl.getFarmAddressesByPoolAddress(
      MAINNET_POOL
    );
    farm = await PoolFarmImpl.create(
      MAINNET.connection,
      farmingPool[0].farmAddress
    );
  });

  test("Get farm info", () => {
    expect(farm.address.toBase58()).toBe(
      "9dGX6N3FLAVfKmvtkwHA9MVGsvEqGKnLFDQQFbw5dprr"
    );
  });
});
