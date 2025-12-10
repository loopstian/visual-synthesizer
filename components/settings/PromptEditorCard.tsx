"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface PromptEditorCardProps {
    title: string
    description: string
    locationBadge: string
    usageContext: string
    value: string
    onSave: (value: string) => void
    onReset: () => void
}

export function PromptEditorCard({
    title,
    description,
    locationBadge,
    usageContext,
    value,
    onSave,
    onReset
}: PromptEditorCardProps) {
    const [localValue, setLocalValue] = React.useState(value)

    // Sync local state when external value changes (e.g. after Reset)
    React.useEffect(() => {
        setLocalValue(value)
    }, [value])

    const hasChanges = localValue !== value

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <CardTitle>{title}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{locationBadge}</Badge>
                        <span className="text-muted-foreground">•</span>
                        <Badge variant="outline" className="text-muted-foreground cursor-default">
                            {usageContext}
                        </Badge>
                    </div>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    className="min-h-[120px] font-mono text-sm resize-y"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Default
                </Button>

                <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSave(localValue)}
                    disabled={!hasChanges}
                >
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    )
}
