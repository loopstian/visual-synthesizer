"use client"

import * as React from "react"
import { Folder } from "lucide-react"

import { cn } from "@/lib/utils"

interface ComponentCardProps {
    name: string
    count: number
    className?: string
}

export function ComponentCard({ name, count, className }: ComponentCardProps) {
    return (
        <div
            className={cn(
                "group flex cursor-pointer flex-col items-start justify-between rounded-xl border bg-secondary/20 p-4 transition-all hover:bg-secondary/40 hover:border-primary/50",
                className
            )}
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm border mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Folder className="h-5 w-5" />
            </div>
            <div>
                <h4 className="font-semibold leading-none tracking-tight mb-1 group-hover:text-primary transition-colors">{name}</h4>
                <p className="text-xs text-muted-foreground">{count} items</p>
            </div>
        </div>
    )
}
