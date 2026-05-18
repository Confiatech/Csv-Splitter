export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">

        <div>
          <p className="text-sm font-semibold text-slate-900">CSV Splitter</p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">
            Free, private, browser-based tool to split large CSV files by row count or size.
          </p>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-slate-600">
            <li><a href="#features" className="hover:text-[#3F7FBC]">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-[#3F7FBC]">How it works</a></li>
            <li><a href="#faq" className="hover:text-[#3F7FBC]">FAQ</a></li>
          </ul>
        </nav>

        <div className="sm:text-right">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Your data never leaves this browser
          </div>
          <p className="mt-2 text-xs text-slate-400">
            © {year}{' '}
            <a href="https://confiatech.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#3F7FBC]">
              ConfiaTech
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
