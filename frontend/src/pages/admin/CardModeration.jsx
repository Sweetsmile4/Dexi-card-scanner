import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CardModeration() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCards();
  }, [page]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/cards', {
        params: { page, limit }
      });
      setCards(response.data.data.cards || []);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch cards');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await api.delete(`/admin/cards/${cardId}`);
      toast.success('Card deleted successfully');
      fetchCards();
    } catch (error) {
      toast.error('Failed to delete card');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Card Moderation</h1>
        <p className="text-gray-600 mt-2">Review and moderate uploaded cards</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No cards found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt="Card"
                    className="w-full h-48 object-cover bg-gray-200"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{card.companyName || 'Untitled'}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {card.email || 'No email'} • {card.phone || 'No phone'}
                  </p>
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-3">
                      Uploaded: {new Date(card.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDeleteCard(card._id)}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                    >
                      Delete Card
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
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
