"use client"

import * as React from "react"
import { Pencil } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ComponentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    component: {
        id: string
        name: string
        generatedPrompt?: string
    } | null
    keywords: string[]
    onEdit: () => void
}

export function ComponentDetailsModal({
    isOpen,
    onClose,
    component,
    keywords,
    onEdit
}: ComponentDetailsModalProps) {
    if (!component) return null

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{component.name}</DialogTitle>
                    <DialogDescription>
                        Review component details and extracted elements.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Description Section */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <div className="rounded-md border bg-muted/50 p-4 text-sm text-muted-foreground min-h-[100px] whitespace-pre-wrap">
                            {component.generatedPrompt || "No description available."}
                        </div>
                    </div>

                    {/* Keywords Section */}
                    {keywords.length > 0 && (
                        <div className="space-y-2">
                            <Label>Extracted Elements</Label>
                            <div className="flex flex-wrap gap-2">
                                {keywords.map((keyword, index) => (
                                    <Badge key={index} variant="secondary">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onEdit} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit Component
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
