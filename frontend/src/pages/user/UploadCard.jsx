import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadCard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('card', file);

    setUploading(true);
    try {
      await api.post('/cards/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Card uploaded! Processing OCR...');
      setTimeout(() => navigate('/contacts'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Visiting Card</h1>
      
      <div className="card">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
              <button onClick={() => { setFile(null); setPreview(null); }} className="btn btn-outline">
                Choose Different Image
              </button>
            </div>
          ) : (
            <div>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-4">Click to upload or drag and drop</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="btn btn-primary cursor-pointer">
                Select Image
              </label>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full btn btn-primary py-3 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload and Process'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
