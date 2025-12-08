"use client"

import * as React from "react"
import { Layers, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"

export function EmptyState() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 p-8 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
                <Layers className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Start Building Your Palette</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
                Upload your assets to begin analyzing and generating components for your design system.
            </p>
            <Button className="gap-2">
                <UploadCloud className="h-4 w-4" />
                Upload Assets
            </Button>
        </div>
    )
}
