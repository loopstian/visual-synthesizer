"use client"

import * as React from "react"
import { ChevronRight, FolderPlus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopBarProps {
    projectName: string
    viewMode: "main" | "component"
    componentName?: string
    className?: string
    onNewComponent?: () => void
    onUpload?: () => void
    onBack?: () => void
}

export function TopBar({ projectName, viewMode, componentName, className, onNewComponent, onUpload, onBack }: TopBarProps) {
    return (
        <div className={cn("flex h-14 w-full items-center justify-between border-b bg-background px-4", className)}>
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm font-medium">
                <span
                    className={cn(
                        "transition-colors",
                        viewMode === "component" ? "cursor-pointer text-muted-foreground hover:text-foreground" : "text-foreground font-semibold"
                    )}
                    onClick={viewMode === "component" ? onBack : undefined}
                >
                    {projectName}
                </span>
                {viewMode === "component" && componentName && (
                    <>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground animate-in fade-in slide-in-from-left-2">{componentName}</span>
                    </>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {viewMode === "main" && (
                    <Button variant="outline" size="sm" className="gap-2" onClick={onNewComponent}>
                        <FolderPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Component</span>
                    </Button>
                )}
                <Button size="sm" className="gap-2" onClick={onUpload}>
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span>
                </Button>
            </div>
        </div>
    )
}
