function Header({ onSidebartoggle }) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Sidebar Toggle */}
        <div>
          <button
            onClick={onSidebartoggle}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#1f1f1f"
            >
              <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-6 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#9ca3af"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notification */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#1f1f1f"
            >
              <path d="M480-120q-34 0-57-23t-23-57h160q0 34-23 57t-57 23ZM280-320v-200q0-88 61-161t148-100q1-3 1-7t0-7q0-12 8-20t20-8q12 0 20 8t8 20q0 3 0 7t1 7q87 25 148 100t61 161v200l40 40v40H240v-40l40-40Z" />
            </svg>
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar / Initials */}
          <div className="w-10 h-10 flex items-center justify-center bg-violet-500 text-white font-semibold rounded-full shadow">
            UJ
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
