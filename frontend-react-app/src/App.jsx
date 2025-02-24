import { Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./components/Home"
import Gallery from "./components/Gallery"
import ArtworkDetails from "./components/ArtworkDetails"
import UserDashboard from "./components/UserDashboard"


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/artwork/:id" element={<ArtworkDetails />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </Layout>
  )
}

export default App


