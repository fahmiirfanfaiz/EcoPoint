import Link from "next/link";
import Image from "next/image";
import { Camera, BrainCircuit, Gift, Download, Trophy, Play } from "lucide-react";
import RedirectIfLoggedIn from "@/components/auth/RedirectIfLoggedIn";

export default function HomePage() {
  return (
    <RedirectIfLoggedIn>
      <div className="w-full min-h-screen bg-emerald-50/30 flex flex-col font-nunito overflow-x-hidden">
        
        {/* Hero Section */}
        <section className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-12 lg:py-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Content */}
          <div className="flex flex-col items-start max-w-xl z-10">
            {/* Badge */}
            <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full flex items-center gap-2 mb-8 border border-emerald-500/20">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 9.33333L5.83333 7.55417L8.16667 9.33333L7.29167 6.44583L9.625 4.78333H6.76667L5.83333 1.75L4.9 4.78333H2.04167L4.375 6.44583L3.5 9.33333ZM5.83333 11.6667C5.02639 11.6667 4.26806 11.5135 3.55833 11.2073C2.84861 10.901 2.23125 10.4854 1.70625 9.96042C1.18125 9.43542 0.765625 8.81806 0.459375 8.10833C0.153125 7.39861 0 6.64028 0 5.83333C0 5.02639 0.153125 4.26806 0.459375 3.55833C0.765625 2.84861 1.18125 2.23125 1.70625 1.70625C2.23125 1.18125 2.84861 0.765625 3.55833 0.459375C4.26806 0.153125 5.02639 0 5.83333 0C6.64028 0 7.39861 0.153125 8.10833 0.459375C8.81806 0.765625 9.43542 1.18125 9.96042 1.70625C10.4854 2.23125 10.901 2.84861 11.2073 3.55833C11.5135 4.26806 11.6667 5.02639 11.6667 5.83333C11.6667 6.64028 11.5135 7.39861 11.2073 8.10833C10.901 8.81806 10.4854 9.43542 9.96042 9.96042C9.43542 10.4854 8.81806 10.901 8.10833 11.2073C7.39861 11.5135 6.64028 11.6667 5.83333 11.6667Z" fill="#10B981"/>
              </svg>
              <span className="text-emerald-600 text-xs font-extrabold uppercase tracking-widest">#1 Campus Green Initiative</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Gamify Your <br className="hidden md:block"/>
              <span className="text-emerald-500">Campus Waste</span>
            </h1>

            {/* Subheading */}
            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-lg">
              Snap, classify, and earn rewards while saving the planet. Join the greenest movement on campus and turn trash into real-world treats.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 rounded-full text-white text-lg font-bold text-center shadow-[0px_6px_0px_0px_#059669] hover:translate-y-1 hover:shadow-[0px_2px_0px_0px_#059669] active:translate-y-1.5 active:shadow-none transition-all"
              >
                Start Recycling Now
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white rounded-full text-slate-700 text-lg font-bold border-2 border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                <Play size={20} className="fill-slate-700" />
                See How
              </button>
            </div>

            {/* Avatars */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white overflow-hidden shadow-sm">
                  <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Idea" alt="User" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white overflow-hidden shadow-sm">
                  <img src="https://api.dicebear.com/9.x/micah/svg?seed=Cool" alt="User" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-500 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center text-white font-bold text-xs">
                  5k+
                </div>
              </div>
              <span className="text-slate-500 text-sm font-bold">Join 5,000+ students on campus</span>
            </div>
          </div>

          {/* Right Content / Image */}
          <div className="relative w-full max-w-[600px] lg:w-[50%] lg:flex-shrink-0 z-0">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-emerald-400/20 rounded-full blur-[80px] -z-10"></div>
            <img 
              src="/landing-page1.svg" 
              alt="EcoPoint App Preview" 
              className="w-full h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500 ease-out relative z-10"
            />
          </div>

        </section>

        {/* Features / Steps Section */}
        <section className="w-full bg-white py-24 px-6 md:px-16 mt-12 relative z-20">
          <div className="max-w-[1280px] mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Three steps to a cleaner campus</h2>
              <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">Our AI-powered system makes recycling feel like a game, not a chore.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="bg-emerald-50/50 rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center relative border border-emerald-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center border-4 border-white shadow-sm text-lg z-10">
                  1
                </div>
                <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                  <Camera size={36} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Snap a Photo</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Spot some waste? Just point your phone camera and take a quick snap in the EcoPoint app.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-emerald-50/50 rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center relative border border-emerald-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center border-4 border-white shadow-sm text-lg z-10">
                  2
                </div>
                <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                  <BrainCircuit size={36} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">AI Classification</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Our super-smart AI instantly identifies the material and tells you exactly which bin to use.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-emerald-50/50 rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center relative border border-emerald-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center border-4 border-white shadow-sm text-lg z-10">
                  3
                </div>
                <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                  <Gift size={36} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Earn & Redeem</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Collect EcoPoints for every correct action and swap them for coffee, bookstore credit, and more!</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="w-full px-4 md:px-16 py-12 relative z-20">
          <div className="max-w-[1280px] mx-auto bg-emerald-500 rounded-[3rem] p-10 md:p-20 flex flex-col items-center text-center text-white relative overflow-hidden shadow-xl shadow-emerald-500/20">
            {/* Background Decorations */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400 rounded-full mix-blend-screen opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-600 rounded-full mix-blend-multiply opacity-50 blur-3xl"></div>
            
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight max-w-3xl relative z-10 leading-[1.1]">
              Ready to level up your campus impact?
            </h2>
            <p className="text-emerald-50 text-lg md:text-xl font-medium mb-12 max-w-xl relative z-10">
              Join the thousands of students making our campus green, one snap at a time.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full sm:w-auto">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-white rounded-full text-emerald-600 text-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Download size={20} strokeWidth={2.5} />
                Download the App
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 rounded-full text-white text-lg font-bold flex items-center justify-center hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
              >
                View Leaderboard
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 mt-20 relative z-10 w-full max-w-4xl border-t border-emerald-400 pt-12">
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-black mb-2 tracking-tight">450k+</span>
                <span className="text-emerald-100 text-xs md:text-sm font-extrabold tracking-widest uppercase">Items Scanned</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-black mb-2 tracking-tight">12k</span>
                <span className="text-emerald-100 text-xs md:text-sm font-extrabold tracking-widest uppercase">Active Users</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-black mb-2 tracking-tight">15t</span>
                <span className="text-emerald-100 text-xs md:text-sm font-extrabold tracking-widest uppercase">Waste Diverted</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </RedirectIfLoggedIn>
  );
}
