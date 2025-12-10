"use client"

import * as React from "react"
import { Search, Plus, X, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Taxonomy Definition
export const TAXONOMY = {
    "Essentials": [
        "Lighting", "Mood", "Color Palette", "Medium", "Perspective"
    ],
    "Cinematography": [
        "Lighting", "Camera Angle", "Lens", "Framing", "Depth of Field", "Film Stock", "Focus", "Shutter Speed",
        "ISO", "Aspect Ratio", "Camera Movement", "Shot Type", "Exposure", "Color Grading", "Grain", "Bokeh",
        "Lens Flare", "Vignette", "Chromatic Aberration"
    ],
    "Art Style": [
        "Medium", "Palette", "Texture", "Brushwork", "Line Weight", "Rendering", "Surrealism", "Abstraction",
        "Digital Art", "Oil Painting", "Watercolor", "Sketch", "3D Render", "Anime", "Pixel Art", "Pop Art",
        "Impressionism", "Realism", "Minimalism", "Cyberpunk", "Steampunk", "Gothic", "Baroque", "Art Nouveau"
    ],
    "Atmosphere": [
        "Vibe", "Mood", "Weather", "Time of Day", "Season", "Chaos Level", "Era",
        "Lighting Quality", "Color Temperature", "Fog/Mist", "Humidity", "Wind", "Temperature",
        "Ethereal", "Gritty", "Melancholic", "Joyful", "Tense", "Serene"
    ],
    "Subject & Content": [
        "Main Subject", "Clothing", "Expression", "Pose", "Background", "Architecture", "Props", "Composition",
        "Crowd", "Vehicle", "Animal", "Plant", "Food", "Technology", "Nature", "Urban",
        "Interiors", "Exteriors", "Landscapes", "Portraits", "Still Life"
    ],
    "Technical": [
        "Resolution", "Sharpness", "Noise", "Artifacts", "Compression", "Dynamic Range", "Bit Depth",
        "Contrast Ratio", "White Balance", "Saturation", "Gamma"
    ],
    "Composition": [
        "Rule of Thirds", "Symmetry", "Leading Lines", "Negative Space", "Balance", "Perspective", "Golden Ratio",
        "Framing", "Scale", "Depth", "Foreground", "Background", "Center Weighted"
    ],
    "Color": [
        "Saturation", "Contrast", "Brightness", "Hue", "Tint", "Shade", "Vibrance", "Color Harmony",
        "Monochromatic", "Analogous", "Complementary", "Triadic", "Pastel", "Neon", "Muted"
    ],
    "Character": [
        "Age", "Gender", "Ethnicity", "Hair Style", "Eye Color", "Body Type", "Accessories", "Makeup",
        "Costume", "Emotion", "Action", "Interaction"
    ],
    "Adjectives": [
        "Detailed", "Intricate", "Massive", "Tiny", "Glowing", "Dark", "Bright", "Colorful",
        "Monochrome", "Vintage", "Modern", "Futuristic", "Ancient", "Organic", "Geometric",
        "Abstract", "Realistic", "Stylized", "Rough", "Smooth", "Sharp", "Blurry", "Dynamic",
        "Static", "Chaotic", "Ordered", "Elegant", "Grotesque", "Minimalist", "Ornate"
    ],
    "Concept Art": [
        "Character Design", "Environment Design", "Prop Design", "Vehicle Design", "Creature Design",
        "Weapon Design", "Mech Design", "Architecture Design", "Industrial Design", "Fashion Design",
        "Keyframe", "Storyboard", "Moodboard", "Turnaround", "Orthographic", "Isometric",
        "Cutaway", "Exploded View", "Thumbnail", "Silhouette", "Speedpaint"
    ]
}

// Helper to generate consistent IDs from labels
export const toId = (label: string) => label.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '')

interface TaxonomyPickerProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (selectedIds: string[]) => void
    alreadySelected: string[]
}

export function TaxonomyPicker({ isOpen, onClose, onAdd, alreadySelected }: TaxonomyPickerProps) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [localSelection, setLocalSelection] = React.useState<string[]>([])

    // Reset selection when opening
    React.useEffect(() => {
        if (isOpen) {
            setLocalSelection([])
            setSearchQuery("")
        }
    }, [isOpen])

    const handleToggle = (label: string) => {
        const id = toId(label)
        // Check given both local selection and already selected (though already selected serves as disabled/context)
        // The prompt implies we are adding NEW items, so we toggle in localSelection

        setLocalSelection(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id)
            } else {
                return [...prev, id]
            }
        })
    }

    // Derived filtered taxonomy
    const filteredTaxonomy = React.useMemo(() => {
        if (!searchQuery.trim()) return TAXONOMY

        const result: Record<string, string[]> = {}
        Object.entries(TAXONOMY).forEach(([category, items]) => {
            const filteredItems = items.filter(item =>
                item.toLowerCase().includes(searchQuery.toLowerCase())
            )
            if (filteredItems.length > 0) {
                result[category] = filteredItems
            }
        })
        return result
    }, [searchQuery])

    const handleConfirm = () => {
        onAdd(localSelection)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-6xl h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 shrink-0 border-b">
                    <DialogTitle>Select Analysis Targets</DialogTitle>
                    <DialogDescription>
                        Choose specific attributes to extract from the image
                    </DialogDescription>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter attributes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-muted/50"
                            autoFocus
                        />
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="columns-1 md:columns-2 lg:columns-4 gap-8 block">
                        {Object.entries(filteredTaxonomy).map(([category, items]) => (
                            <div key={category} className="break-inside-avoid flex flex-col gap-3 mb-8">
                                <h4 className="font-semibold text-sm text-foreground/80 border-b pb-2">{category}</h4>
                                <div className="flex flex-col gap-2">
                                    {items.map(label => {
                                        const id = toId(label)
                                        const isSelected = localSelection.includes(id)
                                        const isAlreadyActive = alreadySelected.includes(id)

                                        return (
                                            <Button
                                                key={id}
                                                variant={isSelected ? "default" : "outline"}
                                                size="sm"
                                                className={cn(
                                                    "justify-start h-auto py-2 px-3 whitespace-normal text-left font-normal",
                                                    isAlreadyActive && "opacity-50 cursor-not-allowed bg-muted hover:bg-muted text-muted-foreground border-transparent"
                                                )}
                                                onClick={() => !isAlreadyActive && handleToggle(label)}
                                                disabled={isAlreadyActive}
                                            >
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className={cn(
                                                        "h-4 w-4 rounded-sm border flex items-center justify-center shrink-0",
                                                        isSelected ? "border-primary-foreground" : "border-muted-foreground/30",
                                                        isAlreadyActive && "border-transparent"
                                                    )}>
                                                        {isSelected && <Check className="h-3 w-3" />}
                                                        {isAlreadyActive && <Check className="h-3 w-3" />}
                                                    </div>
                                                    <span>{label}</span>
                                                </div>
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        {Object.keys(filteredTaxonomy).length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No attributes found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t bg-background mt-auto flex justify-end gap-3 shrink-0">
                    <div className="text-sm text-muted-foreground mr-auto content-center">
                        {localSelection.length} item{localSelection.length !== 1 && 's'} selected
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={localSelection.length === 0}>
                        Add {localSelection.length > 0 ? localSelection.length : ''} Targets
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
