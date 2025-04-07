import React from "react";
import { Shield, Heart } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface py-6 px-4 text-center border-t border-white/10">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-2 sm:space-y-0 sm:space-x-8">
          <div className="flex items-center text-white/70 text-sm">
            <Shield className="h-4 w-4 text-primary mr-2" />
            <span>Secure & Fair Gameplay</span>
          </div>
          <div className="flex items-center text-white/70 text-sm">
            <Heart className="h-4 w-4 text-rose-500 mr-2" />
            <span>Responsible Gaming</span>
          </div>
        </div>
        
        <p className="text-white/50 text-sm mb-2">
          This is a demonstration platform for entertainment purposes only. No real
          money is involved.
        </p>
        
        <div className="text-white/40 text-xs mt-4">
          <p className="inline-block bg-gradient-to-r from-amber-400 via-emerald-400 to-primary bg-clip-text text-transparent font-semibold">
            © {new Date().getFullYear()} StakePlay
          </p>
          <p className="mt-1">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
