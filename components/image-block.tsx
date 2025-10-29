"use client";

import { useState } from "react";
import { Block } from "@/types/document";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ImageBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  documentId: string;
}

export function ImageBlock({ block, onUpdate, documentId }: ImageBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(block.content);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const supabase = createClient();

  const ACCEPTED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleSave = () => {
    onUpdate({ ...block, content: imageUrl });
    setIsEditing(false);
    setImageError(false);
  };

  const handleCancel = () => {
    setImageUrl(block.content);
    setIsEditing(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload an image (PNG, JPG, GIF, WebP, or SVG).";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
    }
    return null;
  };

  const uploadImage = async (file: File) => {
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload images");
        return;
      }

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Create unique filename with timestamp to prevent conflicts
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = `${user.id}/${documentId}/images/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("document-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("document-files")
        .getPublicUrl(filePath);

      // Update image URL and save
      setImageUrl(urlData.publicUrl);
      onUpdate({ ...block, content: urlData.publicUrl });
      setIsEditing(false);
      setImageError(false);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2 border rounded-md p-4 bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <ImageIcon className="h-4 w-4" />
          <span>Add Image</span>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id={`image-upload-${block.id}`}
          />
          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium">Uploading image...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium mb-1">
                    Drag and drop an image here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF, WebP, SVG • Max 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-muted/30 px-2 text-muted-foreground">
              Or enter URL
            </span>
          </div>
        </div>

        {/* URL Input */}
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="font-mono text-sm"
          disabled={uploading}
        />
        {imageUrl && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div className="relative border rounded-md overflow-hidden bg-muted/50 flex items-center justify-center min-h-[150px]">
              {!imageError ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-[300px] object-contain"
                  onError={handleImageError}
                />
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Failed to load image</p>
                  <p className="text-xs">Check the URL and try again</p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  // View mode
  if (!block.content || block.content.trim() === "") {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full border-2 border-dashed rounded-md p-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2"
      >
        <ImageIcon className="h-8 w-8" />
        <span className="text-sm">Click to add image URL</span>
      </button>
    );
  }

  return (
    <div className="group relative">
      <div className="relative border rounded-md overflow-hidden bg-muted/30">
        {!imageError ? (
          <img
            src={block.content}
            alt="Block image"
            className="max-w-full h-auto mx-auto"
            onError={handleImageError}
          />
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-1">Failed to load image</p>
            <p className="text-xs text-muted-foreground/70 font-mono break-all px-4">
              {block.content}
            </p>
          </div>
        )}
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background border rounded-md p-2 shadow-sm"
        title="Edit image URL"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
