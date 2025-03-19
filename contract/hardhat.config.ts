import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.PRIVATE_KEY) {
  throw new Error("No private key");
}

if (!process.env.CELOSCAN_API_KEY) {
  throw new Error("No celoscan key");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",

  networks: {
    alfajores: {
        // can be replaced with the RPC url of your choice.
        url: "https://alfajores-forno.celo-testnet.org",
        accounts: [
            process.env.API_KEY as string
        ],
    },
},

etherscan: {
    apiKey: {
      alfajores: process.env.Ether_API_KEY as string
    },
    customChains: [
        {
            network: "alfajores",
            chainId: 44787,
            urls: {
                apiURL: "https://api-alfajores.celoscan.io/api",
                browserURL: "https://alfajores.celoscan.io",
            },
        },
       
    ]
},

};

export default config;


