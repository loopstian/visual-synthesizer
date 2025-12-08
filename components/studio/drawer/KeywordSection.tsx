"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"

interface KeywordSectionProps {
    keywords: string[]
    className?: string
}

export function KeywordSection({ keywords, className }: KeywordSectionProps) {
    return (
        <div className={cn("flex flex-col gap-2 py-2", className)}>

            {/* Slider removed as per requirement */}
            <div className="flex flex-wrap gap-2">
                {keywords.length > 0 ? (
                    keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="px-2 py-1 text-xs">
                            {keyword}
                        </Badge>
                    ))
                ) : (
                    <span className="text-xs text-muted-foreground italic">No textures extracted</span>
                )}
            </div>
        </div>
    )
}
