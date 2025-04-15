"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { DollarSign, Framer } from "lucide-react"

// Mock data for a single artwork
const mockArtwork = {
  id: "1",
  title: "Digital Dreamscape",
  artist: "Alice Wonder",
  imageUrl: "/placeholder.svg?height=600&width=800",
  price: 5000,
  fractionsAvailable: 75,
  totalFractions: 100,
  description:
    "A mesmerizing digital artwork that blends surreal landscapes with futuristic elements, creating a dreamlike atmosphere that captivates the viewer.",
}

const ArtworkDetails = () => {
  const { id } = useParams()
  const [fractionsToBuy, setFractionsToBuy] = useState(1)

  const artwork = mockArtwork

  const handleBuy = () => {
    // Implement the buying logic here
    console.log(`Buying ${fractionsToBuy} fractions of artwork ${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={artwork.imageUrl || "/placeholder.svg"}
            alt={artwork.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{artwork.title}</h1>
          <p className="text-xl text-gray-600 mb-4">by {artwork.artist}</p>
          <div className="flex items-center mb-4">
            <DollarSign className="mr-2" />
            <span className="text-2xl font-bold">${artwork.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center mb-4">
            <Framer className="mr-2" />
            <span>
              {artwork.fractionsAvailable} of {artwork.totalFractions} fractions available
            </span>
          </div>
          <p className="mb-6">{artwork.description}</p>
          <div className="mb-6">
            <label htmlFor="fractions" className="block mb-2">
              Number of fractions to buy:
            </label>
            <input
              type="number"
              id="fractions"
              min="1"
              max={artwork.fractionsAvailable}
              value={fractionsToBuy}
              onChange={(e) => setFractionsToBuy(Number.parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button onClick={handleBuy} className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Buy Fractions
          </button>
        </div>
      </div>
    </div>
  )
}

export default ArtworkDetails

