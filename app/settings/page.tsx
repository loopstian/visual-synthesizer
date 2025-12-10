"use client"

import * as React from "react"
import { StudioShell } from "@/components/layout/StudioShell"
import { PromptEditorCard } from "@/components/settings/PromptEditorCard"
import { ModelConfigTab } from "@/components/settings/ModelConfigTab"
import { UserProfileTab } from "@/components/settings/UserProfileTab"
import { CreditManagementTab } from "@/components/settings/CreditManagementTab"
import { useStudioStore, DEFAULT_SYSTEM_SETTINGS } from "@/stores/useStudioStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your application preferences and AI configurations.
                        </p>
                    </div>

                    <Tabs defaultValue="system" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="user">User Profile</TabsTrigger>
                            <TabsTrigger value="credits">Credits & Usage</TabsTrigger>
                            <TabsTrigger value="system">System Intelligence</TabsTrigger>
                            <TabsTrigger value="models">AI Models</TabsTrigger>
                        </TabsList>

                        <TabsContent value="user">
                            <UserProfileTab />
                        </TabsContent>

                        <TabsContent value="credits">
                            <CreditManagementTab />
                        </TabsContent>

                        <TabsContent value="system" className="space-y-6">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">System Intelligence</h2>
                                <p className="text-sm text-muted-foreground">
                                    Customize the AI personas used throughout the application.
                                </p>
                            </div>

                            {/* 1. Visual Analyst */}
                            <PromptEditorCard
                                title="Visual Analyst"
                                locationBadge="Studio"
                                usageContext="Universal (Image Analysis)"
                                description="Controls how the AI sees images. Tweak vocabulary here to change the style of extracted keywords."
                                value={settings.analystPrompt || DEFAULT_SYSTEM_SETTINGS.analystPrompt}
                                onSave={(val) => updateSetting('analystPrompt', val)}
                                onReset={() => resetSetting('analystPrompt')}
                            />

                            {/* 2. Segment Writer */}
                            <PromptEditorCard
                                title="Segment Writer"
                                locationBadge="Lab"
                                usageContext="Text Blocks & JSON Nodes"
                                description="Used when you click 'Generate' on a single block or node. Controls how instructions are expanded into segments."
                                value={settings.segmentWriterPrompt || DEFAULT_SYSTEM_SETTINGS.segmentWriterPrompt}
                                onSave={(val) => updateSetting('segmentWriterPrompt', val)}
                                onReset={() => resetSetting('segmentWriterPrompt')}
                            />

                            {/* 3. Assembler */}
                            <PromptEditorCard
                                title="Assembler"
                                locationBadge="Lab"
                                usageContext="Text Mode Only"
                                description="Used when you click 'Assemble Final Paragraph' to stitch blocks together."
                                value={settings.assemblerPrompt || DEFAULT_SYSTEM_SETTINGS.assemblerPrompt}
                                onSave={(val) => updateSetting('assemblerPrompt', val)}
                                onReset={() => resetSetting('assemblerPrompt')}
                            />

                            {/* 4. Markdown Architect */}
                            <PromptEditorCard
                                title="Markdown Architect"
                                locationBadge="Lab"
                                usageContext="Markdown Mode Only"
                                description="Controls how the AI formats text when 'Structured Markdown' is selected."
                                value={settings.markdownAssemblerPrompt || DEFAULT_SYSTEM_SETTINGS.markdownAssemblerPrompt}
                                onSave={(val) => updateSetting('markdownAssemblerPrompt', val)}
                                onReset={() => resetSetting('markdownAssemblerPrompt')}
                            />
                        </TabsContent>

                        <TabsContent value="models">
                            <ModelConfigTab />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </StudioShell>
    )
}
