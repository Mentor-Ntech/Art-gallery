import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Fractional Art Gallery</h1>
      <p className="text-xl mb-8">Discover and own fractions of unique digital artworks.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Browse Gallery</h2>
          <p className="mb-4">
            Explore our curated collection of digital artworks from talented artists around the world.
          </p>
          <Link to="/gallery" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Gallery
          </Link>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Dashboard</h2>
          <p className="mb-4">Manage your fractional ownership and track your digital art portfolio.</p>
          <Link to="/dashboard" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

