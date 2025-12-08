import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    status: 'empty' | 'ready'
    generatedPrompt?: string
}

interface StudioState {
    assets: Asset[]
    components: ComponentFolder[]
    viewMode: ViewMode
    activeComponentId: string | null

    // Actions
    addAsset: (url: string, componentId?: string) => void
    updateAssetAnalysis: (id: string, data: Record<string, string[]>) => void
    deleteAsset: (id: string) => void
    addComponent: (name: string) => string
    saveComponentPrompt: (id: string, prompt: string) => void
    setActiveComponent: (id: string | null) => void
    setViewMode: (mode: ViewMode) => void
    resetProject: () => void
}

export const useStudioStore = create<StudioState>()(
    persist(
        (set) => ({
            assets: [],
            components: [],
            viewMode: 'main',
            activeComponentId: null,

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

            updateAssetAnalysis: (id: string, data: Record<string, string[]>) => {
                console.log("Store: updateAssetAnalysis triggered", id, data);
                set((state) => {
                    const newAssets = state.assets.map((asset) => {
                        if (asset.id === id) {
                            return {
                                ...asset,
                                analyzed: true,
                                extractors: Object.keys(data),
                                analysisData: data
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

            resetProject: () =>
                set({
                    assets: [],
                    components: [],
                    viewMode: 'main',
                    activeComponentId: null,
                }),
        }),
        {
            name: 'synth-studio-storage',
        }
    )
)
