import React from "react";

export default function Custom404() {
  return (
    <div className="flex items-center justify-center h-screen bg-salt dark:bg-coal text-coal dark:text-salt">
      <div className="text-center">
        <h2 className="text-primary text-5xl py-2">
          404 <span className="text-coal dark:text-salt"> : Not Found</span>
        </h2>
        <h5 className="text-coal dark:text-salt text-xl py-2">We can't find the page you're looking for</h5>
      </div>
    </div>
  );
}
