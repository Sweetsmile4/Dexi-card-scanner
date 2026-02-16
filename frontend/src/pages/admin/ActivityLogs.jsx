import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/logs', {
        params: { page, limit }
      });
      setLogs(response.data.data.logs || []);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch activity logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('login')) return 'bg-blue-100 text-blue-800';
    if (action.includes('create') || action.includes('upload')) return 'bg-green-100 text-green-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('update') || action.includes('edit')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('disabled') || action.includes('enabled')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">System activity and user actions</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No activity logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Entity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.userId?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.entityType} {log.entityId && `(${log.entityId})`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.metadata && typeof log.metadata === 'object' 
                        ? Object.entries(log.metadata)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 disabled:opacity-50 rounded hover:bg-gray-400"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-300 disabled:opacity-50 rounded hover:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
