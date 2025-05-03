'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Upload, Trash2, Edit, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface GalleryImage {
  id: string;
  url: string;
  altText?: string | null;
  title?: string | null;
  createdAt: Date;
}

export default function GalleryManagementPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [title, setTitle] = useState('');
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editText, setEditText] = useState({ alt: '', title: '' });

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/gallery');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data: GalleryImage[] = await response.json();
      setImages(data.map(img => ({...img, createdAt: new Date(img.createdAt)})));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('altText', altText);
    formData.append('title', title);

    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      await fetchGalleryImages(); // Refresh list
      toast.success('Image uploaded successfully!');
      // Reset form
      setSelectedFile(null);
      setAltText('');
      setTitle('');
      // Clear the file input visually (may need more specific handling)
      const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }
      toast.success('Image deleted successfully');
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handleEditClick = (image: GalleryImage) => {
    setEditingImageId(image.id);
    setEditText({ alt: image.altText || '', title: image.title || '' });
  };

  const handleCancelEdit = () => {
    setEditingImageId(null);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          altText: editText.alt || null, // Send null if empty 
          title: editText.title || null 
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
      }
      toast.success('Image metadata updated');
      setEditingImageId(null);
      await fetchGalleryImages(); // Refresh to show updated data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label htmlFor="gallery-upload" className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
              <Input id="gallery-upload" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFileChange} required />
              {selectedFile && <p className="text-xs text-gray-500 mt-1">Selected: {selectedFile.name}</p>}
            </div>
            <div>
              <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-1">Alt Text (Optional)</label>
              <Input id="altText" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Descriptive text for accessibility" />
            </div>
             <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title/Caption (Optional)</label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional image title or caption" />
            </div>
            <Button type="submit" disabled={uploading || !selectedFile} className="bg-[#8B5C9E] hover:bg-[#7A4C8C]">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Image Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#8B5C9E]" /></div>
        ) : images.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No images found in the gallery yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="h-40 w-full relative bg-gray-100">
                   <img 
                      src={image.url}
                      alt={image.altText || 'Gallery image'}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80 hover:bg-white" onClick={() => handleEditClick(image)} title="Edit Metadata">
                         <Edit className="h-3.5 w-3.5 text-blue-600" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80 hover:bg-white" onClick={() => handleDelete(image.id)} title="Delete Image">
                         <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                   </div>
                </div>
                {editingImageId === image.id ? (
                   <CardContent className="p-3 space-y-2">
                      <Input 
                         value={editText.title}
                         onChange={(e) => setEditText(prev => ({...prev, title: e.target.value}))}
                         placeholder="Title/Caption"
                         className="text-xs"
                      />
                      <Textarea 
                         value={editText.alt}
                         onChange={(e) => setEditText(prev => ({...prev, alt: e.target.value}))}
                         placeholder="Alt Text"
                         rows={2}
                         className="text-xs"
                      />
                      <div className="flex justify-end gap-2">
                         <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                         <Button size="sm" onClick={() => handleSaveEdit(image.id)} className="bg-[#8B5C9E] hover:bg-[#7A4C8C]">Save</Button>
                      </div>
                   </CardContent>
                ) : (
                   <CardContent className="p-3">
                     <p className="text-sm font-medium truncate" title={image.title || 'No title'}>{image.title || 'Untitled'}</p>
                     <p className="text-xs text-gray-500 truncate" title={image.altText || 'No alt text'}>{image.altText || 'No alt text'}</p>
                     <p className="text-xs text-gray-400 mt-1">Uploaded: {image.createdAt.toLocaleDateString()}</p>
                   </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 