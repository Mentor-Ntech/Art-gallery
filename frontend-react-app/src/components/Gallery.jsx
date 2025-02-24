"use client"

import { useState, useEffect } from "react"
import ArtCard from "./ArtCard"
import { Search, Loader } from "lucide-react"

// Mock data for the gallery
const mockArtworks = [
  {
    id: "1",
    title: "Digital Dreamscape",
    artist: "Alice Wonder",
    imageUrl: "/placeholder.svg?height=300&width=400",
    price: 5000,
    fractionsAvailable: 75,
    totalFractions: 100,
  },
  {
    id: "2",
    title: "Neon Nights",
    artist: "Bob Bright",
    imageUrl: "/placeholder.svg?height=300&width=400",
    price: 3500,
    fractionsAvailable: 50,
    totalFractions: 100,
  },
  {
    id: "3",
    title: "Pixel Paradise",
    artist: "Charlie Crisp",
    imageUrl: "/placeholder.svg?height=300&width=400",
    price: 7000,
    fractionsAvailable: 90,
    totalFractions: 100,
  },
  // Add more mock artworks here
]

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simulate API call
    const fetchArtworks = async () => {
      try {
        setLoading(true)
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setArtworks(mockArtworks)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch artworks. Please try again later.")
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  const filteredArtworks = artworks.filter(
    (artwork) =>
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader className="animate-spin text-blue-500" size={48} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Digital Art Gallery</h1>
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title or artist"
            className="w-full p-2 pl-10 border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>
      {filteredArtworks.length === 0 ? (
        <div className="text-center text-gray-500">No artworks found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <ArtCard key={artwork.id} {...artwork} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Gallery

