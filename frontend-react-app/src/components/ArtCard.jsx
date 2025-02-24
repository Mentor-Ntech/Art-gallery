"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const ArtCard = ({ id, title, artist, imageUrl, price, fractionsAvailable, totalFractions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-2">by {artist}</p>
        <p className="text-lg font-bold mb-2">${price.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mb-4">
          {fractionsAvailable} of {totalFractions} fractions available
        </p>
        <Link
          to={`/artwork/${id}`}
          className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  )
}

export default ArtCard

