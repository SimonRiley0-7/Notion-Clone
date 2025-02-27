"use client";
import { Cover } from "@/components/cover";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Toolbar } from "@/components/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">;
    };
};

const DocumentIdPage = ({
    params
}: DocumentIdPageProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isNewPage, setIsNewPage] = useState(false);
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    // Load editor with dynamic import
    const Editor = dynamic(() => import("@/components/editor"), {
        ssr: false,
        loading: () => <div className="p-4 text-center">Loading editor...</div>
    });
    
    // Get document from database
    const document = useQuery(api.documents.getById, {
        documentId: params.documentId,
    });
    
    // Mutation for updating document
    const update = useMutation(api.documents.update);
    
    // Debounce timer reference
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Check if we're on a new page
    useEffect(() => {
        const isNew = searchParams.get('new') === 'true';
        setIsNewPage(isNew);
    }, [searchParams]);
    
    // Track document loading state
    useEffect(() => {
        if (document !== undefined) {
            setIsDocumentLoaded(true);
        }
    }, [document]);
    
    // Function to handle manual saving - useful for debugging
    const handleManualSave = () => {
        if (!document || !document.content) {
            setErrorMessage("No content to save");
            return;
        }
        
        setSaveStatus('saving');
        
        update({
            id: params.documentId,
            content: document.content
        })
        .then(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        })
        .catch(error => {
            setSaveStatus('error');
            setErrorMessage(error.message);
        });
    };
    
    // Function to handle content changes
    const handleContentChange = (content: string) => {
        setSaveStatus('saving');
        
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Set a new timeout
        saveTimeoutRef.current = setTimeout(() => {
            try {
                // Validate content
                if (!content) {
                    throw new Error("Content is empty");
                }
                
                // Try parsing to validate JSON
                JSON.parse(content);
                
                // Log for debugging
                console.log(`Saving document content, length: ${content.length}`);
                
                // Save to database
                update({
                    id: params.documentId,
                    content: content
                })
                .then(() => {
                    console.log("Document saved successfully");
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                    setErrorMessage(null);
                })
                .catch(error => {
                    console.error("Failed to save document:", error);
                    setSaveStatus('error');
                    setErrorMessage(`Save failed: ${error.message}`);
                });
            } catch (error) {
                console.error("Invalid content format:", error);
                setSaveStatus('error');
                setErrorMessage("Invalid content format - not saving");
            }
            
            saveTimeoutRef.current = null;
        }, 1000);
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);
    
    // Loading state
    if (document === undefined) {
        return (
            <div>
                <Cover.Skeleton/>
                <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
                    <div className="space-y-4 pl-8 pt-4">
                        <Skeleton className="h-14 w-[50%]"/>
                        <Skeleton className="h-4 w-[80%]"/>
                        <Skeleton className="h-4 w-[40%]"/>
                        <Skeleton className="h-4 w-[60%]"/>
                    </div>
                </div>
                <div className="text-center mt-4">Loading document...</div>
            </div>
        );
    }
    
    // Not found state
    if (document === null) {
        return <div className="p-4">Document not found</div>;
    }
    
    // Prepare safe initial content
    let safeInitialContent = JSON.stringify([{ type: "paragraph", content: [] }]);
    
    if (document.content) {
        try {
            // Validate content
            const parsed = JSON.parse(document.content);
            if (Array.isArray(parsed) && parsed.length > 0) {
                safeInitialContent = document.content;
            } else {
                console.warn("Document content is not a valid block array");
            }
        } catch (e) {
            console.warn("Invalid document content:", e);
        }
    }
    
    // Render save status indicator
    const renderSaveStatus = () => {
        switch(saveStatus) {
            case 'saving':
                return <span className="text-blue-500">Saving...</span>;
            case 'saved':
                return <span className="text-green-500">Saved</span>;
            case 'error':
                return <span className="text-red-500">Error: {errorMessage}</span>;
            default:
                return null;
        }
    };
    
    return ( 
        <div className="pb-40">
            <Cover url={document.coverImage}/>
            <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
                <Toolbar initialData={document}/>
                
                {/* Status indicator */}
                <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
                    <div>
                        {renderSaveStatus()}
                    </div>
                    <button 
                        onClick={handleManualSave}
                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
                    >
                        Force Save
                    </button>
                </div>
                
                {/* Editor */}
                {isDocumentLoaded && (
                    <Editor 
                        initialContent={safeInitialContent}
                        onChange={handleContentChange}
                        editable={true}
                        newPage={isNewPage}
                    />
                )}
            </div>
        </div> 
    );
}
 
export default DocumentIdPage;