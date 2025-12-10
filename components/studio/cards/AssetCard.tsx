"use client"

import * as React from "react"
import { Eye, Search, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle } from "lucide-react"

interface AssetCardProps {
    imageSrc: string
    analyzed?: boolean
    onDelete?: () => void
    className?: string
}

export function AssetCard({ imageSrc, analyzed, onDelete, className }: AssetCardProps) {
    return (
        <div className={cn("group relative overflow-hidden rounded-lg border bg-muted", className)}>
            <img
                src={imageSrc}
                alt="Asset"
                className="h-auto w-full object-cover transition-all duration-300 group-hover:scale-105"
            />
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-90">
                    <Search className="h-5 w-5 text-foreground" />
                </div>
            </div>

            {/* Top Right Actions */}
            <div className="absolute right-2 top-2 flex items-center gap-2">
                {onDelete && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white dark:ring-black animate-in zoom-in shadow-sm",
                                    analyzed ? "bg-green-500" : "bg-red-500"
                                )}
                            >
                                {analyzed ? (
                                    <Check className="h-3 w-3 text-white" />
                                ) : (
                                    <AlertCircle className="h-3 w-3 text-white" />
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{analyzed ? "Analyzed" : "Pending Analysis"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
