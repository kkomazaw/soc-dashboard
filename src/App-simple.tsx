export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        SOC Dashboard - Test
      </h1>
      <p className="text-gray-700">
        If you can see this, React and Tailwind CSS are working correctly.
      </p>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  )
}
