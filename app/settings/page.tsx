"use client"

import * as React from "react"
import { StudioShell } from "@/components/layout/StudioShell"
import { PromptEditorCard } from "@/components/settings/PromptEditorCard"
import { useStudioStore } from "@/stores/useStudioStore"

export default function SettingsPage() {
    const {
        settings,
        updateSetting,
        resetSetting
    } = useStudioStore()

    return (
        <StudioShell>
            <div className="h-screen w-full overflow-y-auto bg-background">
                <div className="max-w-4xl mx-auto py-10 px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">System Intelligence</h1>
                        <p className="text-muted-foreground mt-2">
                            Customize the AI personas used throughout the application.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* 1. Visual Analyst */}
                        <PromptEditorCard
                            title="Visual Analyst"
                            locationBadge="Studio"
                            usageContext="Universal (Image Analysis)"
                            description="Controls how the AI sees images. Tweak vocabulary here to change the style of extracted keywords."
                            value={settings.analystPrompt}
                            onSave={(val) => updateSetting('analystPrompt', val)}
                            onReset={() => resetSetting('analystPrompt')}
                        />

                        {/* 2. Segment Writer */}
                        <PromptEditorCard
                            title="Segment Writer"
                            locationBadge="Lab"
                            usageContext="Text Blocks & JSON Nodes"
                            description="Used when you click 'Generate' on a single block or node. Controls how instructions are expanded into segments."
                            value={settings.segmentWriterPrompt}
                            onSave={(val) => updateSetting('segmentWriterPrompt', val)}
                            onReset={() => resetSetting('segmentWriterPrompt')}
                        />

                        {/* 3. Assembler */}
                        <PromptEditorCard
                            title="Assembler"
                            locationBadge="Lab"
                            usageContext="Text Mode Only"
                            description="Used when you click 'Assemble Final Paragraph' to stitch blocks together."
                            value={settings.assemblerPrompt}
                            onSave={(val) => updateSetting('assemblerPrompt', val)}
                            onReset={() => resetSetting('assemblerPrompt')}
                        />
                    </div>
                </div>
            </div>
        </StudioShell>
    )
}
