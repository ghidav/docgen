"use client";

import { useEffect, useState } from "react";
import type { Document } from "@/types/document";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Plus, Trash2, Eye, RefreshCw, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentPolling } from "@/hooks/use-document-polling";
import { DocumentUploadDialog } from "@/components/document-upload-dialog";

interface DocumentListProps {
  onSelectDocument: (doc: Document) => void;
  onCreateNew: () => void;
}

export function DocumentList({
  onSelectDocument,
  onCreateNew,
}: DocumentListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();

  // Use polling hook to automatically refresh documents
  const { documents, lastFetch, refresh } = useDocumentPolling({
    enabled: true,
    interval: 5000, // Poll every 5 seconds
    onUpdate: (docs) => {
      setLoading(false);
      setError(null);
    },
  });

  useEffect(() => {
    // Initial load
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load documents",
        );
        toast({
          title: "Error",
          description: "Failed to load documents from API",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await apiClient.deleteDocument(id);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleCreateBlank = () => {
    setPopoverOpen(false);
    onCreateNew();
  };

  const handleCreateFromUpload = () => {
    console.log("handleCreateFromUpload called");
    console.log("Current uploadDialogOpen state:", uploadDialogOpen);
    setPopoverOpen(false);
    setUploadDialogOpen(true);
    console.log("After setUploadDialogOpen(true)");
  };

  const handleDocumentUploaded = (doc: Document) => {
    refresh();
    onSelectDocument(doc);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, "/");
  };

  const formatLastFetch = () => {
    const seconds = Math.floor((Date.now() - lastFetch) / 1000);
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const filteredDocuments = documents.filter((doc) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const inTitle = doc.title?.toLowerCase().includes(query) ?? false;
    const inSubtitle = doc.subtitle?.toLowerCase().includes(query) ?? false;
    const inClient = doc.client?.toLowerCase().includes(query) ?? false;
    const inAuthors =
      doc.authors?.some((author) => author.toLowerCase().includes(query)) ??
      false;
    const inSections = doc.sections.some((section) => {
      const sectionMatches =
        section.title?.toLowerCase().includes(query) ?? false;
      const blockMatches = section.blocks.some((block) =>
        block.content.toLowerCase().includes(query),
      );
      const subsectionMatches = section.subsections.some((subsection) => {
        const subsectionTitleMatches =
          subsection.title?.toLowerCase().includes(query) ?? false;
        const subsectionBlockMatches = subsection.blocks.some((block) =>
          block.content.toLowerCase().includes(query),
        );
        return subsectionTitleMatches || subsectionBlockMatches;
      });

      return sectionMatches || blockMatches || subsectionMatches;
    });

    return inTitle || inSubtitle || inClient || inAuthors || inSections;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Documents</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-5xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-2">
            {filteredDocuments.length}{" "}
            {filteredDocuments.length === 1 ? "document" : "documents"} shown
            {searchTerm && (
              <span className="ml-1 text-sm text-muted-foreground/80">
                of {documents.length}
              </span>
            )}
            <span className="ml-2 text-xs">• Updated {formatLastFetch()}</span>
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full md:w-64"
          />
          <div className="flex gap-2">
            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={handleCreateBlank}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Blank Document
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Upload Document button clicked!");
                      handleCreateFromUpload();
                    }}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No documents yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first document or use MCP to add documents
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No matching documents</p>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Try a different search term or clear the current filter to see all
              documents.
            </p>
            <Button variant="secondary" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-border/50"
              onClick={() => onSelectDocument(doc)}
            >
              <CardContent className="p-6">
                {/* Header with icons */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold truncate mb-1">
                      {doc.title || "Untitled"}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      <span>{doc.client || "No client specified"}</span>
                      <span className="mx-2">•</span>
                      <span>{doc.sections.length} sections</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDocument(doc);
                      }}
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(doc.id, e)}
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    Created | {formatDate(doc.created_at)}
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    Updated | {formatDate(doc.updated_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          console.log("Dialog onOpenChange called with:", open);
          console.trace("Call stack:");
          setUploadDialogOpen(open);
        }}
        onDocumentCreated={handleDocumentUploaded}
      />
    </div>
  );
}
