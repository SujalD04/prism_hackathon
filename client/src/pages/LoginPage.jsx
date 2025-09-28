// src/pages/LoginPage.jsx

const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
    <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-lg text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Sign In</h1>
      
      {/* Email Input */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-300">Email</label>
        <input 
          type="email" 
          placeholder="you@example.com"
          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password Input */}
      <div className="mb-2">
        <label className="block mb-1 text-sm font-medium text-gray-300">Password</label>
        <input 
          type="password" 
          placeholder="********"
          className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Forgot password */}
      <div className="text-right mb-4">
        <a href="#" className="text-blue-400 text-sm hover:underline">Forgot Password?</a>
      </div>

      {/* Sign In Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4 transition-colors">
        Sign In
      </button>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-4">
        <hr className="flex-grow border-slate-600" />
        <span className="text-gray-400 text-sm">or</span>
        <hr className="flex-grow border-slate-600" />
      </div>

      {/* Social Buttons */}
      <div className="flex flex-col gap-3">
        <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">
        {/* Replace Google icon with text */}
        Sign in with Google
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-500 text-white py-2 rounded-lg">
        {/* Replace Twitter icon with text */}
        Sign in with Twitter
        </button>

      </div>

      {/* Sign up link */}
      <p className="text-center text-gray-400 text-sm mt-6">
        Don't have an account?{' '}
        <a href="#" className="text-blue-400 hover:underline">Create one</a>
      </p>
    </div>
  </div>
);

export default LoginPage;
