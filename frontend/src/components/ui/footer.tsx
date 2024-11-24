export default function Footer() {
  return (
    <footer className="absolute bottom-0 w-full bg-white border-t border-gray-200 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-600">
        <a href="#" className="hover:text-[#0a66c2] hover:underline">About</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline">Accessibility</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline">Help Center</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline">Privacy & Terms</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline">Ad Choices</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline">Advertising</a>
        <a href="#" className="hover:text-[#0a66c2] hover:underline">Business Services</a>
          <span className="text-gray-400">LinkedInPurry Corporation © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}