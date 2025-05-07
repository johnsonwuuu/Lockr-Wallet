const SendModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 bg-white rounded-lg w-96">
        <h2 className="mb-4 text-xl font-semibold">Send Crypto</h2>
        <form>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendModal; 