
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { uploadImage, deleteImageFromStorage } from "@/utils/uploadManager"
import { getImageDimensions } from "@/utils/imageHelpers"
import { supabase } from "@/lib/supabaseClient"
// Import new studio components
import { TopBar } from "@/components/studio/TopBar"
import { EmptyState } from "@/components/studio/EmptyState"
import { AssetCard } from "@/components/studio/cards/AssetCard"
import { ComponentCard } from "@/components/studio/cards/ComponentCard"
import { AnalysisModal } from "@/components/studio/modals/AnalysisModal"
import { CreateComponentModal } from "@/components/studio/modals/CreateComponentModal"
import { SynthesizerDrawer } from "@/components/studio/drawer/SynthesizerDrawer"
import { useStudioStore, Asset } from "@/stores/useStudioStore"

export function ImageStudio() {
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

    // Store State
    const {
        projects,
        currentProjectId,
        assets,
        components,
        viewMode,
        activeComponentId,
        addAsset,
        updateAssetAnalysis,
        addComponent,
        setActiveComponent,
        setViewMode,
        deleteAsset
    } = useStudioStore()

    const currentProject = projects.find(p => p.id === currentProjectId)
    const projectName = currentProject?.name || "Untitled Project"

    // UI Local State
    const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null)
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const [isLoadingExamples, setIsLoadingExamples] = React.useState(false)
    const [filter, setFilter] = React.useState<'all' | 'analyzed' | 'not-analyzed'>('all')

    // State for Multi-Tone Analysis
    const [extractionGroups, setExtractionGroups] = React.useState<Array<{ id: string, tone: string, targets: string[] }>>([
        { id: 'default', tone: '', targets: [] }
    ])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Handlers
    const handleLoadExampleAssets = async () => {
        setIsLoadingExamples(true)
        try {
            const { data, error } = await supabase
                .storage
                .from('uploads')
                .list('example', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                })

            if (data) {
                data.forEach((file, index) => {
                    if (file.name === '.emptyFolderPlaceholder') return

                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('uploads')
                        .getPublicUrl(`example/${file.name}`)

                    const assetId = addAsset(publicUrl)
                })
                toast.success("Example assets loaded successfully")
            }
        } catch (error) {
            console.error("Error loading example assets:", error)
            toast.error("Failed to load example assets")
        } finally {
            setIsLoadingExamples(false)
        }
    }

    const handleUpload = () => {
        // Trigger file input
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const count = files.length
        toast.loading(`Uploading ${count} image${count > 1 ? 's' : ''}...`, { id: "upload-toast" })

        try {
            const uploadPromises = Array.from(files).map(file => uploadImage(file))
            const results = await Promise.all(uploadPromises)
            
            const successfulUrls = results.filter((url): url is string => url !== null)
            
            if (successfulUrls.length > 0) {
                const targetComponentId = viewMode === "component" && activeComponentId ? activeComponentId : undefined
                
                // Add all successful uploads as assets
                successfulUrls.forEach(url => {
                    addAsset(url, targetComponentId)
                })
                
                console.log(`${successfulUrls.length} images uploaded successfully`)
                
                if (successfulUrls.length === count) {
                    toast.success(`Successfully uploaded ${count} image${count > 1 ? 's' : ''}`, { id: "upload-toast" })
                } else {
                    toast.warning(`Uploaded ${successfulUrls.length} of ${count} images`, { id: "upload-toast" })
                }
            } else {
                toast.error("Failed to upload images. Please try again.", { id: "upload-toast" })
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error("Upload failed", { id: "upload-toast" })
        } finally {
            setIsUploading(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleCreateComponent = (name: string) => {
        const newId = addComponent(name)
        setActiveComponent(newId)
        setViewMode("component")
    }

    const handleBackToMain = () => {
        setActiveComponent(null)
        setViewMode("main")
    }

    const handleDelete = async (id: string, url: string) => {
        // 1. Try to delete from cloud storage
        await deleteImageFromStorage(url)
        // 2. Always delete from local store (UI update)
        deleteAsset(id)
    }

    // Handlers
    // Extraction groups are managed directly by the AnalysisModal via setExtractionGroups
    // No simple toggle handler anymore

    const handleAnalyzeAsset = async (input: string[] | string | Blob) => {
        if (!selectedAsset) return
        setIsAnalyzing(true)

        try {
            // Step A: Prepare Image Data
            let imageBlob: Blob;

            // Check if input is Blob (from mask)
            if (input instanceof Blob) {
                imageBlob = input;
            } else {
                // Otherwise fetch original image
                // Import helper dynamically or use the one we just created
                const { urlToBlob } = await import("@/utils/imageHelpers");
                imageBlob = await urlToBlob(selectedAsset.url);
            }

            // Step B: Convert to Base64
            const { blobToBase64 } = await import("@/utils/imageHelpers");
            const base64Image = await blobToBase64(imageBlob);

            // Step C: Prepare Payload
            let payload: any = { image: base64Image };

            if (input instanceof Blob) {
                // Mask Mode - Use default "Analyze this specific area" prompt implicitly via backend fallback
                // or send a specific prompt if we had one.
                payload.prompt = "Analyze the specific visual elements in this masked area. Describe the texture, material, and key features.";
            } else if (Array.isArray(input) || (viewMode === 'main' && extractionGroups.some(g => g.targets.length > 0))) {
                // Main Mode: Multi-Tone Strategy
                // Only send active groups that have targets
                const strategies = extractionGroups.filter(g => g.targets.length > 0).map(g => ({
                    tone: g.tone,
                    targets: g.targets
                }))

                if (strategies.length > 0) {
                    payload.strategies = strategies
                } else {
                    // Fallback if no targets selected but analyzed pressed (unlikely due to disable logic)
                    payload.prompt = "Analyze the key visual elements of this image including subject, composition, and style."
                }
            } else if (typeof input === 'string') {
                // Legacy or direct prompt string
                payload.prompt = input;
            } else {
                // Component view fallback
                if (viewMode === 'component') {
                    payload.prompt = "Analyze this image to create a detailed description suitable for training a LoRA or creating a prompt for this specific object/style. Focus on key identifiers.";
                }
            }

            // Step D: Call API
            const settings = useStudioStore.getState().settings

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    systemOverride: settings.analystPrompt
                })
            });

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Step E: Update Store
            updateAssetAnalysis(selectedAsset.id, data);

            // Success indication (console for now, UI toast later)
            console.log("Analysis Complete", data);

        } catch (error) {
            console.error("Analysis Error:", error);
            // Ideally show a toast here
            toast.error("Analysis failed. Check console for details.", { id: "analysis-toast" });
        } finally {
            setIsAnalyzing(false)
            setSelectedAsset(null)
        }
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple
            />

            {/* Part A: Main Workspace */}
            <div className="flex-1 flex flex-col relative">
                {/* Floating Trigger */}
                <Button
                    variant="ghost"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-50 h-16 w-6 rounded-l-xl rounded-r-none border-y border-l bg-background shadow-md hover:bg-accent p-0"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    title={isDrawerOpen ? "Close Drawer" : "Open Drawer"}
                >
                    {isDrawerOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>

                {/* Overlay Block */}
                {isDrawerOpen && (
                    <div
                        className="absolute inset-0 z-40 bg-background/20 backdrop-blur-[1px] cursor-pointer"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                )}

                {/* Header */}
                <div className="flex items-center justify-between border-b bg-background">
                    <TopBar
                        projectName={projectName}
                        viewMode={viewMode}
                        componentName={activeComponentId ? components.find(c => c.id === activeComponentId)?.name : undefined}
                        className="border-b-0 flex-1"
                        onUpload={handleUpload}
                        onNewComponent={() => setIsCreateModalOpen(true)}
                        onBack={handleBackToMain}
                        isUploading={isUploading}
                    >
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2 h-8" 
                                onClick={handleLoadExampleAssets} 
                                disabled={isLoadingExamples}
                            >
                                {isLoadingExamples ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3 w-3 text-yellow-500" />
                                )}
                                <span className="hidden sm:inline">Load Examples</span>
                            </Button>
                            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Images</SelectItem>
                                    <SelectItem value="analyzed">Analyzed</SelectItem>
                                    <SelectItem value="not-analyzed">Not Analyzed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TopBar>
                </div>

                {/* Grid Area */}
                <div className="flex-1 bg-muted/10 overflow-y-auto p-4 z-0">
                    {assets.length === 0 && components.length === 0 ? (
                        <div onClickCapture={handleUpload} className="h-full">
                            <EmptyState />
                        </div>
                    ) : (
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-10 block">
                            {/* Render Components (Folders) only in Main View */}
                            {viewMode === "main" && components.map((comp) => (
                                <div key={comp.id} onClick={() => {
                                    setActiveComponent(comp.id)
                                    setViewMode("component")
                                }} className="break-inside-avoid mb-4">
                                    <ComponentCard name={comp.name} count={assets.filter(a => a.componentId === comp.id).length} />
                                </div>
                            ))}

                            {/* Render Assets */}
                            {assets
                                .filter(asset => {
                                    // View Mode Filtering
                                    if (viewMode === "main" && asset.componentId) return false
                                    if (viewMode === "component" && asset.componentId !== activeComponentId) return false
                                    
                                    // Status Filtering
                                    if (filter === 'analyzed' && !asset.analyzed) return false
                                    if (filter === 'not-analyzed' && asset.analyzed) return false
                                    
                                    return true
                                })
                                .map((asset) => (
                                    <div key={asset.id} onClick={() => setSelectedAsset(asset)} className="break-inside-avoid mb-4">
                                        <AssetCard
                                            imageSrc={asset.url}
                                            analyzed={asset.analyzed}
                                            onDelete={() => handleDelete(asset.id, asset.url)}
                                            className="cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2"
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Part B: Synthesizer Drawer */}
            <div
                className={cn(
                    "bg-background border-l transition-all duration-300 ease-in-out flex flex-col z-50",
                    isDrawerOpen ? "w-96" : "w-0 overflow-hidden border-l-0"
                )}
            >
                <div className="w-96 flex-1 h-full overflow-hidden">
                    <SynthesizerDrawer />
                </div>
            </div>

            {/* Analysis Modal */}
            <AnalysisModal
                isOpen={!!selectedAsset}
                onClose={() => setSelectedAsset(null)}
                imageUrl={selectedAsset?.url || ""}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyzeAsset}
                extractionGroups={extractionGroups}
                setExtractionGroups={setExtractionGroups}
                viewMode={viewMode}
            />

            {/* Create Component Modal */}
            <CreateComponentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateComponent}
            />
        </div>
    )
}
