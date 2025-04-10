// import { Link } from "react-router-dom"
// import { Home, Image, User } from "lucide-react"

// const Navigation = () => {
//   return (
//     <nav className="bg-gray-800 text-white p-4">
//       <div className="container mx-auto flex justify-between items-center">
//         <Link to="/" className="text-xl font-bold">
//           Fractional Art Gallery
//         </Link>
//         <ul className="flex space-x-4">
//           <li>
//             <Link to="/" className="flex items-center">
//               <Home className="mr-1" size={18} />
//               Home
//             </Link>
//           </li>
//           <li>
//             <Link to="/gallery" className="flex items-center">
//               <Image className="mr-1" size={18} />
//               Gallery
//             </Link>
//           </li>
//           <li>
//             <Link to="/dashboard" className="flex items-center">
//               <User className="mr-1" size={18} />
//               Dashboard
//             </Link>
//           </li>
//         </ul>

//         <button className="bg-[#f2df63] py-4 px-8 rounded-full">Connect wallet</button>
//       </div>
//     </nav>
//   )
// }

// export default Navigation



import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Image, User } from "lucide-react";

const Navigation = () => {
  // State for wallet address
  const [walletAddress, setWalletAddress] = useState("");

  // Function to handle wallet connection
  const connectWalletPressed = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]); // Set the first connected account
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.");
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Fractional Art Gallery
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="flex items-center">
              <Home className="mr-1" size={18} />
              Home
            </Link>
          </li>
          <li>
            <Link to="/gallery" className="flex items-center">
              <Image className="mr-1" size={18} />
              Gallery
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="flex items-center">
              <User className="mr-1" size={18} />
              Dashboard
            </Link>
          </li>
        </ul>

        {/* Wallet Connection Button */}
        <button
          className="bg-[#f2df63] py-2 px-6 rounded-full text-black font-medium"
          id="walletButton"
          onClick={connectWalletPressed}
        >
          {walletAddress ? (
            `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
