import { Link } from "react-router-dom"
import { Home, Image, User } from "lucide-react"

const Navigation = () => {
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
      </div>
    </nav>
  )
}

export default Navigation

