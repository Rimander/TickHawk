import React from 'react';

/**
 * Footer component displaying application name and version
 * Intended to be used in authenticated layouts only
 */
function Footer() {
  return (
    <footer className="py-2 px-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <p>
            TickHawk <span className="text-xs">v0.4.0</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;