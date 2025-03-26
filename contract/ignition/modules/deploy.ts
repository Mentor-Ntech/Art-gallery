// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const deployFractionalArtGalleryModule = buildModule("DeployFractionalArtGalleryModule", (m) => {
  

  const fractionalArtGallery = m.contract("FractionalArtGallery");

  return { fractionalArtGallery };
});

export default deployFractionalArtGalleryModule;
