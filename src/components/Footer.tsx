export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/6"
            style={{ background: 'rgba(5, 3, 20, 0.6)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-5xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Built by */}
        <a
          href="https://confiatech.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Built by <span className="text-white/50 font-semibold">ConfiaTech.</span>
        </a>

        {/* Center — privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-white/20">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your data never leaves this browser
        </div>

        {/* Copyright */}
        <p className="text-xs text-white/20">
          © {year} Confiatech. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
