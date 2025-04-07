import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface py-4 px-4 text-center text-white/50 text-sm">
      <p>
        This is a demonstration platform for entertainment purposes only. No real
        money is involved.
      </p>
      <p className="mt-1">© {new Date().getFullYear()} StakePlay. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
