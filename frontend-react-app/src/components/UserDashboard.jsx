import { Palette, DollarSign, TrendingUp } from "lucide-react"

const mockOwnedFractions = [
  { id: "1", title: "Digital Dreamscape", fractions: 10, value: 500 },
  { id: "2", title: "Neon Nights", fractions: 5, value: 175 },
  { id: "3", title: "Pixel Paradise", fractions: 15, value: 1050 },
]

const UserDashboard = () => {
  const totalValue = mockOwnedFractions.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 p-6 rounded-lg">
          <div className="flex items-center mb-2">
            <Palette className="mr-2" />
            <h2 className="text-xl font-semibold">Total Artworks</h2>
          </div>
          <p className="text-3xl font-bold">{mockOwnedFractions.length}</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg">
          <div className="flex items-center mb-2">
            <DollarSign className="mr-2" />
            <h2 className="text-xl font-semibold">Total Value</h2>
          </div>
          <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="mr-2" />
            <h2 className="text-xl font-semibold">Performance</h2>
          </div>
          <p className="text-3xl font-bold">+12.5%</p>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Your Owned Fractions</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artwork
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fractions Owned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockOwnedFractions.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{item.fractions}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">${item.value.toLocaleString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserDashboard

