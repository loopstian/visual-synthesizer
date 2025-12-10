
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadImage, deleteImageFromStorage } from "@/utils/uploadManager"
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

    // UI Local State
    const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null)
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)

    // State for Multi-Tone Analysis
    const [extractionGroups, setExtractionGroups] = React.useState<Array<{ id: string, tone: string, targets: string[] }>>([
        { id: 'default', tone: '', targets: [] }
    ])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Handlers
    const handleUpload = () => {
        // Trigger file input
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        toast.loading("Uploading image...", { id: "upload-toast" })

        try {
            const url = await uploadImage(file)
            if (url) {
                const targetComponentId = viewMode === "component" && activeComponentId ? activeComponentId : undefined
                addAsset(url, targetComponentId)
                console.log('Image uploaded successfully:', url)
                toast.success("Image uploaded successfully", { id: "upload-toast" })
            } else {
                toast.error("Failed to upload image. Please try again.", { id: "upload-toast" })
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
                        projectName="Project Alpha"
                        viewMode={viewMode}
                        componentName={activeComponentId ? components.find(c => c.id === activeComponentId)?.name : undefined}
                        className="border-b-0 flex-1"
                        onUpload={handleUpload}
                        onNewComponent={() => setIsCreateModalOpen(true)}
                        onBack={handleBackToMain}
                        isUploading={isUploading}
                    />
                </div>

                {/* Grid Area */}
                <div className="flex-1 bg-muted/10 overflow-y-auto p-4 z-0">
                    {assets.length === 0 && components.length === 0 ? (
                        <div onClickCapture={handleUpload} className="h-full">
                            <EmptyState />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
                            {/* Render Components (Folders) only in Main View */}
                            {viewMode === "main" && components.map((comp) => (
                                <div key={comp.id} onClick={() => {
                                    setActiveComponent(comp.id)
                                    setViewMode("component")
                                }}>
                                    <ComponentCard name={comp.name} count={assets.filter(a => a.componentId === comp.id).length} />
                                </div>
                            ))}

                            {/* Render Assets */}
                            {assets
                                .filter(asset => {
                                    if (viewMode === "main") return !asset.componentId
                                    if (viewMode === "component") return asset.componentId === activeComponentId
                                    return true
                                })
                                .map((asset) => (
                                    <div key={asset.id} onClick={() => setSelectedAsset(asset)}>
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
