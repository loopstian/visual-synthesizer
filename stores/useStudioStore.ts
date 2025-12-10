import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EditorState, JsonNode, Block } from '@/components/lab/types'

export type ViewMode = 'main' | 'component'

export interface Asset {
    id: string
    url: string
    analyzed: boolean
    extractors: string[]
    analysisData?: Record<string, string[]>
    componentId?: string
}

export interface ComponentFolder {
    id: string
    name: string
    generatedPrompt?: string
}

export interface SystemSettings {
    analystPrompt: string
    segmentWriterPrompt: string
    assemblerPrompt: string
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    analystPrompt: "You are an expert visual analyst for AI art generation. Analyze the provided image focusing strictly on these aspects: [targets]. Output ONLY valid JSON.",
    segmentWriterPrompt: "You are a creative assistant for AI Art prompts. Transform the raw data into a descriptive phrase based on the instruction. Return ONLY the text.",
    assemblerPrompt: "You are an expert prompt engineer. Combine these disjointed text blocks into a single, fluid, cohesive paragraph for an image generator. Preserve the details, fix the grammar/flow."
}

interface StudioState {
    assets: Asset[]
    components: ComponentFolder[]
    viewMode: ViewMode
    activeComponentId: string | null
    mainSubject: string

    // Actions
    addAsset: (url: string, componentId?: string) => void
    updateAssetAnalysis: (id: string, data: Record<string, string[]>) => void
    deleteAsset: (id: string) => void
    addComponent: (name: string) => string
    saveComponentPrompt: (id: string, prompt: string) => void
    setActiveComponent: (id: string | null) => void
    setViewMode: (mode: ViewMode) => void
    setMainSubject: (text: string) => void
    resetProject: () => void

    labMode: 'text' | 'json'
    labTextBlocks: Block[]
    labJsonNodes: JsonNode[]

    setLabMode: (mode: 'text' | 'json') => void
    setLabTextBlocks: (blocks: Block[]) => void
    setLabJsonNodes: (nodes: JsonNode[]) => void

    settings: SystemSettings
    updateSetting: (key: keyof SystemSettings, value: string) => void
    resetSetting: (key: keyof SystemSettings) => void
    resetAllSettings: () => void
}

export const useStudioStore = create<StudioState>()(
    persist(
        (set) => ({
            assets: [],
            components: [],
            viewMode: 'main',
            activeComponentId: null,
            mainSubject: '',

            addAsset: (url: string, componentId?: string) =>
                set((state) => ({
                    assets: [
                        ...state.assets,
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            url,
                            analyzed: false,
                            extractors: [],
                            componentId,
                        },
                    ],
                })),

            updateAssetAnalysis: (id: string, newData: Record<string, string[]>) => {
                console.log("Store: updateAssetAnalysis deep merge", id, newData);
                set((state) => {
                    const newAssets = state.assets.map((asset) => {
                        if (asset.id === id) {
                            // Deep Merge Logic
                            const currentData = asset.analysisData || {};
                            const mergedData = { ...currentData };

                            Object.keys(newData).forEach(key => {
                                const existingValues = mergedData[key] || [];
                                const newValues = newData[key] || [];
                                // Merge and deduplicate
                                mergedData[key] = Array.from(new Set([...existingValues, ...newValues]));
                            });

                            return {
                                ...asset,
                                analyzed: true,
                                extractors: Object.keys(mergedData),
                                analysisData: mergedData
                            };
                        }
                        return asset;
                    });
                    return { assets: newAssets };
                });
            },

            deleteAsset: (id: string) =>
                set((state) => ({
                    assets: state.assets.filter((a) => a.id !== id),
                })),

            addComponent: (name: string) => {
                const id = Math.random().toString(36).substr(2, 9)
                set((state) => ({
                    components: [
                        ...state.components,
                        {
                            id,
                            name,
                            status: 'empty',
                        },
                    ],
                }))
                return id
            },

            saveComponentPrompt: (id: string, prompt: string) =>
                set((state) => ({
                    components: state.components.map((c) =>
                        c.id === id ? { ...c, generatedPrompt: prompt } : c
                    ),
                })),

            setActiveComponent: (id: string | null) => set({ activeComponentId: id }),

            setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
            setMainSubject: (text: string) => set({ mainSubject: text }),

            labMode: 'text',
            labTextBlocks: [],
            labJsonNodes: [],

            setLabMode: (mode) => set({ labMode: mode }),
            setLabTextBlocks: (blocks) => set({ labTextBlocks: blocks }),
            setLabJsonNodes: (nodes) => set({ labJsonNodes: nodes }),

            settings: DEFAULT_SYSTEM_SETTINGS,
            updateSetting: (key, value) =>
                set((state) => ({
                    settings: { ...state.settings, [key]: value }
                })),
            resetSetting: (key) =>
                set((state) => ({
                    settings: { ...state.settings, [key]: DEFAULT_SYSTEM_SETTINGS[key] }
                })),
            resetAllSettings: () => set({ settings: DEFAULT_SYSTEM_SETTINGS }),

            resetProject: () =>
                set({
                    assets: [],
                    components: [],
                    viewMode: 'main',
                    activeComponentId: null,
                    labMode: 'text',
                    labTextBlocks: [],
                    labJsonNodes: []
                }),
        }),
        {
            name: 'synth-studio-storage',
        }
    )
)
