const { BN } = require("@coral-xyz/anchor");
const {PoolFarmImpl,getFarmProgram,getFarmInfo,FARM_PROGRAM_ID} =require("./dist");
const { Wallet, AnchorProvider } =require("@coral-xyz/anchor");
const {Connection,PublicKey,Keypair,} =require("@solana/web3.js")

const mainnetConnection = new Connection("https://api.devnet.solana.com");


//pool address
const farmPubKey=new PublicKey("5gFfQht25Xs8YBmM29cQMJMnksiPRG583hzCiqL24umY");
// const farmPubKey=new PublicKey("51fAVF5KNT4RHFGuGUUmzXQ3dJXumThKyV7ByCraEiTD");

const depositAmount=new BN(1);
const myKeypair=Keypair.fromSecretKey(Uint8Array.from([178,199,1,39,193,209,78,232,148,203,100,7,184,222,56,79,201,146,50,86,0,21,148,196,253,174,127,183,156,92,239,101,149,222,25,163,176,134,12,148,73,213,243,158,212,188,8,157,93,28,82,77,3,101,127,254,215,232,11,57,89,219,24,170]))

const myWallet = new Wallet(myKeypair);
const provider = new AnchorProvider(mainnetConnection, myWallet, {
  commitment: "confirmed",
});

PoolFarmImpl.create(
    mainnetConnection,
    farmPubKey,
    {cluster:"devnet"}
)
.then(async farm=>{
    farm.deposit(myWallet.publicKey,depositAmount)
    .then(tx=>{
        provider.sendAndConfirm(tx)
        .then(data=>{
            console.log(data)
        })
    })
})
  
