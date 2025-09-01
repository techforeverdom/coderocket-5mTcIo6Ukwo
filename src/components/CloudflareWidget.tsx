import { useState } from 'react'

export function CloudflareWidget() {
  const [isChecked, setIsChecked] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleCheckboxChange = () => {
    if (!isChecked) {
      setIsVerifying(true)
      // Simulate verification process
      setTimeout(() => {
        setIsChecked(true)
        setIsVerifying(false)
      }, 2000)
    }
  }

  return (
    <div className="border border-gray-300 rounded bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <input
              type="checkbox"
              id="human-verification"
              checked={isChecked}
              onChange={handleCheckboxChange}
              disabled={isVerifying}
              className="w-6 h-6 border-2 border-gray-400 rounded cursor-pointer disabled:cursor-not-allowed"
            />
            {isVerifying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <label 
            htmlFor="human-verification" 
            className="ml-3 text-gray-800 cursor-pointer select-none"
          >
            Verify you are human
          </label>
        </div>
        
        <div className="flex items-center">
          <div className="text-right">
            <div className="text-orange-500 font-bold text-sm">CLOUDFLARE</div>
            <div className="flex text-xs text-gray-500 space-x-1">
              <a href="#" className="hover:underline">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:underline">Terms</a>
            </div>
          </div>
          <div className="ml-2 w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  )
}