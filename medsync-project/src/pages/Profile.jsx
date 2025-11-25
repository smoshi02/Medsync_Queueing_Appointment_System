function Profile() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Profile</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100 max-w-2xl">
        <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-blue-100">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            RG
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Dr. Robert Green</h2>
            <p className="text-gray-600">Senior Physician</p>
            <p className="text-blue-600 text-sm font-semibold">ID: MED-2024-001</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-blue-50">
            <span className="font-semibold text-blue-900">Email:</span>
            <span className="text-gray-600">robert.green@medsync.com</span>
          </div>
          <div className="flex justify-between py-3 border-b border-blue-50">
            <span className="font-semibold text-blue-900">Department:</span>
            <span className="text-gray-600">Cardiology</span>
          </div>
          <div className="flex justify-between py-3 border-b border-blue-50">
            <span className="font-semibold text-blue-900">Phone:</span>
            <span className="text-gray-600">+1 (555) 123-4567</span>
          </div>
          <div className="flex justify-between py-3 border-b border-blue-50">
            <span className="font-semibold text-blue-900">License Number:</span>
            <span className="text-gray-600">MD-98765-CA</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="font-semibold text-blue-900">Years of Experience:</span>
            <span className="text-gray-600">15 years</span>
          </div>
        </div>
        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default Profile;