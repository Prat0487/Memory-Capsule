import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';
import { toast } from 'react-toastify';

function CreateMemoryPage() {
  const { account } = useWallet();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);

  // AI feature flags
  const [enhanceImage, setEnhanceImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle local preview and storing selected files
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    // Generate preview only for the first image file
    if (selectedFiles.length > 0 && selectedFiles[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFiles[0]);
    }
  };

  // Submit the form in multipart/form-data format
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Prepare multipart form data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('owner', account || '');
      formData.append('enhanceImage', enhanceImage ? 'true' : 'false');
      // If you have a "generateNarrative" flag, append that too:
      // formData.append('generateNarrative', 'true');

      // Append all selected files under "files"
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Make POST request with multipart/form-data
      const response = await axios.post(
        'http://localhost:3000/memories/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        }
      );

      if (response.data.success) {
        toast.success('Memory created successfully!');
        navigate('/memories');
      } else {
        setError('Failed to create memory');
        toast.error('Memory creation failed.');
      }
    } catch (err) {
      console.error('Error creating memory:', err);
      setError('Failed to create memory');
      toast.error('Failed to create memory');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Memory</h1>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Give your memory a title"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Describe this memory..."
              required
            />
          </div>

          {/* File Upload + Preview */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Upload Files</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {preview ? (
                <div className="mb-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded"
                  />
                </div>
              ) : (
                <div className="text-gray-500 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p>Drag and drop files here, or click to select</p>
                </div>
              )}

              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                multiple
                accept="image/*,audio/*,text/plain"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 cursor-pointer inline-block"
              >
                Select Files
              </label>

              {files.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          {/* AI Enhancement Toggle */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="enhance-image"
              checked={enhanceImage}
              onChange={(e) => setEnhanceImage(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="enhance-image" className="ml-2 text-gray-700">
              Enhance image with AI based on description
            </label>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center mt-2">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!account || files.length === 0 || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMemoryPage;