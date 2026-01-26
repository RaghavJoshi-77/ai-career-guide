import Link from 'next/link';
import Image from 'next/image';
import bodybuilderImg from '@/public/bodybuilder.jpg';


export default function Home() {
  return (
<div className="bg-black min-h-screen overflow-hidden flex flex-col">

      {/* Header Navigation */}
      <header className="border-b border-gray-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="font-black text-3xl tracking-tighter">
            <span className="text-red-600">HEAVY</span>
            <span className="text-white">DUTY</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center text-sm font-semibold tracking-wide text-gray-300">
            <a href="#" className="hover:text-red-600 transition">
              PROGRAM
            </a>
            <a href="#" className="hover:text-red-600 transition">
              STORE
            </a>
            <a href="#" className="hover:text-red-600 transition">
              ABOUT
            </a>
            <Link href="/sign-in" className="text-white hover:text-red-600 transition">
              SIGN IN
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-grow relative flex items-center">
        {/* Subtle background gradient effect */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/20 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          {/* Left Column: Content */}
          <div className="flex flex-col space-y-8">
            {/* Pre-heading Badge */}
            <div className="inline-flex w-fit">
              <span className="text-sm font-black tracking-[0.3em] text-red-600 uppercase">Extended Sale</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
                <span className="text-red-600">GET</span>
                <br />
                <span className="text-white">JACKED</span>
              </h1>
              <div className="text-xl md:text-2xl font-black text-white tracking-tight">IN 2026</div>
            </div>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
              Build more muscle and finally get real results in the gym. Train smart with science-backed programming.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/guide">
                <button className="bg-red-600 text-white px-10 py-4 rounded-full font-black text-lg uppercase tracking-wider hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-600/50 w-full sm:w-auto">
                  Get Started
                </button>
              </Link>
              <button className="border-2 border-gray-600 text-white px-10 py-4 rounded-full font-bold text-lg uppercase tracking-wider hover:border-gray-400 hover:text-gray-400 transition-all duration-300 w-full sm:w-auto">
                Learn More
              </button>
            </div>

            {/* Stats or Trust Badges */}
            <div className="pt-6 space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold">✓</span>
                <span>Science-backed high-intensity training</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold">✓</span>
                <span>AI coaching optimized for results</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold">✓</span>
                <span>Join thousands getting real gains</span>
              </div>
            </div>
          </div>

          {/* Right Column: Image with Gradient Overlay */}
          <div className="h-[50vh] md:h-[70vh] lg:h-[85vh] relative flex justify-center items-end mt-10 lg:mt-0">
            {/* Placeholder image with gradient fade */}
            <div className="relative w-full h-full">
              <Image
                src={bodybuilderImg}
                alt="Muscular athlete demonstrating high-intensity training"
                fill
                priority
                unoptimized
                className="object-cover rounded-lg"
              />
              {/* Bottom gradient fade to black */}
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black via-black to-transparent"></div>
              {/* Corner accent */}
              <div className="absolute top-4 right-4 w-16 h-16 border-2 border-red-600 opacity-50"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          <p>© 2026 HEAVY DUTY AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
