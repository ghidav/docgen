import { createClient } from "@/lib/supabase/client";
import type { Document, Section, Subsection, Block } from "@/types/document";

/**
 * Extract all image URLs from a document structure
 */
export function extractImageUrls(document: Document): string[] {
  const imageUrls: string[] = [];

  // Helper to extract URLs from blocks
  const extractFromBlocks = (blocks: Block[]) => {
    blocks.forEach((block) => {
      if (block.type === "image" && block.content) {
        imageUrls.push(block.content);
      }
    });
  };

  // Helper to extract URLs from subsections
  const extractFromSubsections = (subsections: Subsection[]) => {
    subsections.forEach((subsection) => {
      if (subsection.blocks) {
        extractFromBlocks(subsection.blocks);
      }
    });
  };

  // Extract from sections
  document.sections?.forEach((section: Section) => {
    // Section-level blocks
    if (section.blocks) {
      extractFromBlocks(section.blocks);
    }
    // Subsection blocks
    if (section.subsections) {
      extractFromSubsections(section.subsections);
    }
  });

  return imageUrls;
}

/**
 * Convert a Supabase public URL to a storage path
 * Example: https://[project].supabase.co/storage/v1/object/public/document-files/user_id/doc_id/images/file.png
 * Returns: user_id/doc_id/images/file.png
 */
export function getStoragePathFromUrl(url: string): string | null {
  try {
    // Match the pattern after "document-files/" in the URL
    const match = url.match(/document-files\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error parsing storage path from URL:", url, error);
    return null;
  }
}

/**
 * Find images that exist in oldUrls but not in newUrls (orphaned images)
 */
export function findOrphanedImages(
  oldUrls: string[],
  newUrls: string[],
): string[] {
  const newUrlSet = new Set(newUrls);
  return oldUrls.filter((url) => !newUrlSet.has(url));
}

/**
 * Delete images from Supabase Storage
 * Returns the number of successfully deleted files
 */
export async function deleteImagesFromStorage(
  imageUrls: string[],
): Promise<number> {
  if (imageUrls.length === 0) {
    return 0;
  }

  const supabase = createClient();

  // Convert URLs to storage paths
  const storagePaths = imageUrls
    .map((url) => getStoragePathFromUrl(url))
    .filter((path): path is string => path !== null);

  if (storagePaths.length === 0) {
    console.warn("No valid storage paths found for deletion");
    return 0;
  }

  try {
    const { data, error } = await supabase.storage
      .from("document-files")
      .remove(storagePaths);

    if (error) {
      console.error("Error deleting images from storage:", error);
      return 0;
    }

    console.log(
      `Successfully deleted ${storagePaths.length} orphaned images from storage`,
    );
    return storagePaths.length;
  } catch (error) {
    console.error("Exception while deleting images from storage:", error);
    return 0;
  }
}

/**
 * Clean up orphaned images by comparing old and new document states
 */
export async function cleanupOrphanedImages(
  oldDocument: Document,
  newDocument: Document,
): Promise<void> {
  const oldImageUrls = extractImageUrls(oldDocument);
  const newImageUrls = extractImageUrls(newDocument);

  const orphanedUrls = findOrphanedImages(oldImageUrls, newImageUrls);

  if (orphanedUrls.length > 0) {
    console.log(`Found ${orphanedUrls.length} orphaned images to delete`);
    await deleteImagesFromStorage(orphanedUrls);
  }
}
