function Profile() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddUser, setShowAddUser] = useState(false);

  const users = [
    { id: "P-001", name: "Tyronne Smith", email: "tyronne@email.com", role: "Admin", status: "Active" },
    { id: "P-002", name: "Rhayven Johnson", email: "rhayven@email.com", role: "Editor", status: "Active" },
    { id: "P-003", name: "Ulysses Brown", email: "ulysses@email.com", role: "Viewer", status: "Inactive" },
    { id: "P-004", name: "Zedric Wilson", email: "zedric@email.com", role: "Admin", status: "Active" },
    { id: "P-005", name: "Marcus Davis", email: "marcus@email.com", role: "Editor", status: "Active" }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-900">Patient Profiles</h1>
        <button onClick={() => setShowAddUser(!showAddUser)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Add New User
        </button>
      </div>

      {showAddUser && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Add New User</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Name" className="border border-gray-300 rounded-lg px-4 py-2" />
            <input type="email" placeholder="Email" className="border border-gray-300 rounded-lg px-4 py-2" />
            <select className="border border-gray-300 rounded-lg px-4 py-2">
              <option>Admin</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
            <button className="bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save User</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2">
            <option>All</option>
            <option>Admin</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{user.id}</td>
                  <td className="px-4 py-3 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Profile;