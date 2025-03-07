// Add this to the top of your existing Home page component
const isAuthenticated = localStorage.getItem('authToken');

// Inside your return statement, right below the hero section:
{!isAuthenticated && (
  <div className="w-full max-w-md mx-auto mt-8 mb-12 p-6 bg-white rounded-xl shadow-lg">
    <h3 className="text-xl font-bold text-center mb-4">Get Started Now</h3>
    <div className="space-y-4">
      <Link 
        to="/signup" 
        className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
      >
        Create an Account
      </Link>
      <Link 
        to="/login" 
        className="block w-full py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-800 text-center font-medium rounded-lg transition-colors"
      >
        Log In
      </Link>
    </div>
  </div>
)}
