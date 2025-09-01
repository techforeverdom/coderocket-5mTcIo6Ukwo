import { CloudflareWidget } from './CloudflareWidget'

export function SecurityVerification() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Site Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="https://app.launchfundraising.com/favicon.ico" 
                alt="Launch Fundraising Icon" 
                className="w-8 h-8 mr-3"
              />
              <h1 className="text-2xl font-normal text-gray-800">
                app.launchfundraising.com
              </h1>
            </div>
            <p className="text-lg text-gray-700 font-normal">
              Verify you are human by completing the action below.
            </p>
          </div>

          {/* Cloudflare Widget */}
          <div className="mb-8">
            <CloudflareWidget />
          </div>

          {/* Security Message */}
          <div className="text-gray-700">
            <p className="text-base leading-relaxed">
              app.launchfundraising.com needs to review the security of your connection before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-600 border-t border-gray-200">
        <div className="mb-2">
          Ray ID: 96c137846f202ff6
        </div>
        <div>
          Performance & security by{' '}
          <a 
            href="https://www.cloudflare.com" 
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare
          </a>
        </div>
      </footer>
    </div>
  )
}