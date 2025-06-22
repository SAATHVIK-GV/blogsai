const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Inner ring */}
          <div className="absolute top-2 left-2 w-12 h-12 border-4 border-blue-200 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          
          {/* Center dot */}
          <div className="absolute top-6 left-6 w-4 h-4 bg-indigo-600 rounded-full animate-pulse"></div>
        </div>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to BlogAI</h2>
          <p className="text-gray-600">Loading your personalized experience...</p>
        </div>
        
        {/* Loading dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 