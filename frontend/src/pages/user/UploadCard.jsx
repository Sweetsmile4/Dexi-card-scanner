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

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    if (!droppedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setFile(droppedFile);
    setPreview(URL.createObjectURL(droppedFile));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#11121a]">OCR Upload Center</h1>

      <section
        className="mx-auto max-w-5xl rounded-[2.2rem] border-2 border-dashed border-[#adadb4] bg-[#f3f3f4] px-6 py-10 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-5">
            <img src={preview} alt="Preview" className="mx-auto max-h-80 rounded-xl border border-[#ceced5]" />
              <p className="text-lg font-medium text-[#3f3f4d]">Ready to process this image</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                  className="rounded-xl border border-[#b8b8c1] px-5 py-3 text-base font-medium text-[#4e4e5c] transition hover:bg-white"
              >
                Choose Different Image
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#5f16bf] to-[#8c3ffb] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(99,38,184,0.28)] transition hover:brightness-105 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload and Process'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-xl bg-[#7a20f3] text-white shadow-[0_8px_24px_rgba(96,29,189,0.35)]">
              <Upload className="h-11 w-11" />
            </div>
              <p className="text-xl font-semibold text-[#1a1a23]">Drag & drop card images here</p>
              <p className="mt-2 text-base text-[#666672]">or click to browse files</p>
              <p className="mt-4 text-sm text-[#777781]">Supports JPG, PNG, WEBP • Max 10MB per file • Bulk upload supported</p>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
                className="mx-auto mt-6 inline-flex cursor-pointer items-center rounded-xl border border-[#b8b8c1] bg-white px-5 py-3 text-base font-medium text-[#4e4e5c] transition hover:bg-[#fafafa]"
            >
              Browse File
            </label>
          </div>
        )}
      </section>

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-[#5f16bf]">
          <CheckCircle className="h-5 w-5" />
            <span className="text-base font-medium">Processing OCR...</span>
        </div>
      )}
    </div>
  );
}
