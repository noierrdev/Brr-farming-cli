const { BN } = require("@coral-xyz/anchor");
const {PoolFarmImpl,getFarmProgram,getFarmInfo,FARM_PROGRAM_ID} =require("./dist");

const {Connection,PublicKey,Keypair} =require("@solana/web3.js")

const mainnetConnection = new Connection("https://api.devnet.solana.com");

//my wallet
const walletPubKey=new PublicKey("B62B4YnWXedeKD9hXj5yx2AKJb4exL1CGqxeqMTp9sUM");

//deployed contract address
const programPubKey=new PublicKey("AVNKaqUEhtb5XMfmV6yhfzfRQzSVBYevYXq7HXTzPqaq");

//pool address
const farmPubKey=new PublicKey("5gFfQht25Xs8YBmM29cQMJMnksiPRG583hzCiqL24umY");
// const farmPubKey=new PublicKey("51fAVF5KNT4RHFGuGUUmzXQ3dJXumThKyV7ByCraEiTD");

const depositAmount=new BN(1000);

PoolFarmImpl.create(
    mainnetConnection,
    farmPubKey,
    {cluster:"devnet"}
)
.then(async farm=>{
    console.log(farm)
})
  
