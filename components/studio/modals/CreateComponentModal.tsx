"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateComponentModalProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (name: string) => void
}

export function CreateComponentModal({
    isOpen,
    onClose,
    onCreate,
}: CreateComponentModalProps) {
    const [name, setName] = React.useState("")

    const handleCreate = () => {
        if (!name.trim()) return
        onCreate(name)
        setName("")
        onClose()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCreate()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Component</DialogTitle>
                    <DialogDescription>
                        Create a dedicated workspace for a specific part of your image (e.g., Background, Character).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="sr-only">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="Component Name"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={!name.trim()}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
