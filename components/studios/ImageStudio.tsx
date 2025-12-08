
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

    const [selectedExtractors, setSelectedExtractors] = React.useState<string[]>([])

    // Handlers
    const handleUpload = () => {
        // Mock Unsplash URL for testing
        // Pass activeComponentId if in component view, otherwise undefined (main project)
        const targetComponentId = viewMode === "component" && activeComponentId ? activeComponentId : undefined
        addAsset("https://images.unsplash.com/photo-1707343843437-caacff5cfa74", targetComponentId)
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

    const handleToggleExtractor = (id: string) => {
        setSelectedExtractors(current =>
            current.includes(id)
                ? current.filter(item => item !== id)
                : [...current, id]
        )
    }

    const handleAnalyzeAsset = async (input: string[] | string | Blob) => {
        if (!selectedAsset) return

        setIsAnalyzing(true)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Generate Mock Data Object
        const mockData: Record<string, string[]> = {}

        if (input instanceof Blob) {
            // Handle Blob Analysis (Mask Mode)
            // For mock purposes, we'll assume it's like a focused subject analysis
            mockData['Focused Analysis'] = ['Detailed Texture', 'Specific Feature', 'Masked Region']
        } else if (Array.isArray(input)) {
            // Main Mode: Array of Extractors is PASSED IN? 
            // Actually AnalysisModal calls onAnalyze(payload). 
            // In main mode, payload was... imageUrl (string) or Blob? 
            // Wait, AnalysisModal logic:
            // if (mask) payload = blob
            // else payload = imageUrl (string)

            // But verify logic in ImageStudio: 
            // logic used to be: if (Array.isArray(input)) ...

            // If AnalysisModal passes `selectedExtractors` to `onAnalyze`, then input is string[].
            // BUT, the new AnalysisModal passes `imageUrl` or `Blob`.

            // WE NEED TO CHANGE ImageStudio logic to use `selectedExtractors` STATE directly for main mode logic,
            // because `input` argument is now the IMAGE SOURCE (string or Blob).

            const extractors = selectedExtractors // Use state instead of input arg if input is image

            // Note: If input IS array, we use it (legacy support?), but new Modal passes Image.
            // Let's support both or switch.
            // The Modal passes `image: string | Blob`.

            if (extractors.includes('subject')) mockData['Subject'] = ['Cyberpunk City', 'Neon Lights', 'Futuristic Building']
            if (extractors.includes('composition')) mockData['Composition'] = ['Wide Shot', 'Leading Lines', 'Rule of Thirds']
            if (extractors.includes('lighting')) mockData['Lighting'] = ['Neon Signs', 'Volumetric Fog', 'Low Key']
            if (extractors.includes('color')) mockData['Colors'] = ['Neon Cyan', 'Magma Red', 'Deep Purple']

        } else {
            // Component Mode: Freeform String (if input is string and NOT a url we treat as prompt?)
            // Or we check viewMode.

            if (viewMode === 'component') {
                // Mock Component Analysis
                // input might be the customized prompt string OR the image URL/Blob.
                // In the modified Modal, for component mode, we passed payload = imageUrl/Blob. 
                // We didn't pass the custom prompt text in the payload.
                // This is a disconnect.

                // For now, let's just generate generic component keywords
                mockData['Keywords'] = ['Cinematic', 'Detailed', '8k', 'Refined']
            } else {
                // Fallback for Main mode if input is string/blob (using selectedExtractors state)
                const extractors = selectedExtractors
                if (extractors.includes('subject')) mockData['Subject'] = ['Cyberpunk City', 'Neon Lights', 'Futuristic Building']
                if (extractors.includes('composition')) mockData['Composition'] = ['Wide Shot', 'Leading Lines', 'Rule of Thirds']
                if (extractors.includes('lighting')) mockData['Lighting'] = ['Neon Signs', 'Volumetric Fog', 'Low Key']
                if (extractors.includes('color')) mockData['Colors'] = ['Neon Cyan', 'Magma Red', 'Deep Purple']
            }
        }

        // Call the Global Store Action
        updateAssetAnalysis(selectedAsset.id, mockData)

        setIsAnalyzing(false)
        setSelectedAsset(null)
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
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
                                            onDelete={() => deleteAsset(asset.id)}
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
                selectedExtractors={selectedExtractors}
                onToggleExtractor={handleToggleExtractor}
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
