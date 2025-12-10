// Re-saving file to fix export issue
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
    width?: number
    height?: number
    aspectRatio?: number
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
    markdownAssemblerPrompt: string
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    analystPrompt: "You are an expert visual analyst for AI art generation. Analyze the provided image focusing strictly on these aspects: [targets]. Output ONLY valid JSON.",
    segmentWriterPrompt: "You are a creative assistant for AI Art prompts. Transform the raw data into a descriptive phrase based on the instruction. Return ONLY the text.",
    assemblerPrompt: "You are an expert prompt engineer. Combine these disjointed text blocks into a single, fluid, cohesive paragraph for an image generator. Preserve the details, fix the grammar/flow.",
    markdownAssemblerPrompt: "You are a technical documentation expert. Organize these text blocks into a clean Markdown document. Use H2/H3 Headers for main concepts, Bullet Points for details, and Bold text for keywords. Do not just write a paragraph."
}

export interface Project {
    id: string
    name: string
    updatedAt: number
    assets: Asset[]
    components: ComponentFolder[]
    viewMode: ViewMode
    activeComponentId: string | null
    mainSubject: string
    labMode: 'text' | 'json' | 'markdown'
    labTextBlocks: Block[]
    labMarkdownBlocks: Block[]
    labJsonNodes: JsonNode[]
}

interface StudioState {
    // Global State
    projects: Project[]
    currentProjectId: string | null

    // Active Project State
    assets: Asset[]
    components: ComponentFolder[]
    viewMode: ViewMode
    activeComponentId: string | null
    mainSubject: string

    // Actions
    addAsset: (url: string, componentId?: string, dimensions?: { width: number, height: number, aspectRatio: number }) => string
    updateAssetAnalysis: (id: string, data: Record<string, string[]>) => void
    deleteAsset: (id: string) => void
    addComponent: (name: string) => string
    saveComponentPrompt: (id: string, prompt: string) => void
    setActiveComponent: (id: string | null) => void
    setViewMode: (mode: ViewMode) => void
    setMainSubject: (text: string) => void
    resetProject: () => void

    // Project Management Actions
    createProject: (name: string) => void
    loadProject: (id: string) => void
    saveCurrentProject: () => void
    deleteProject: (id: string) => void

    labMode: 'text' | 'json' | 'markdown'
    labTextBlocks: Block[]
    labMarkdownBlocks: Block[]
    labJsonNodes: JsonNode[]

    setLabMode: (mode: 'text' | 'json' | 'markdown') => void
    setLabTextBlocks: (blocks: Block[]) => void
    setLabMarkdownBlocks: (blocks: Block[]) => void
    setLabJsonNodes: (nodes: JsonNode[]) => void

    settings: SystemSettings
    updateSetting: (key: keyof SystemSettings, value: string) => void
    resetSetting: (key: keyof SystemSettings) => void
    resetAllSettings: () => void
}

const useStudioStore = create<StudioState>()(
    persist(
        (set, get) => ({
            projects: [],
            currentProjectId: null,

            assets: [],
            components: [],
            viewMode: 'main',
            activeComponentId: null,
            mainSubject: '',

            addAsset: (url: string, componentId?: string, dimensions?: { width: number, height: number, aspectRatio: number }) => {
                const id = Math.random().toString(36).substring(2, 9)
                set((state) => ({
                    assets: [
                        ...state.assets,
                        {
                            id,
                            url,
                            analyzed: false,
                            extractors: [],
                            componentId,
                            ...dimensions
                        },
                    ],
                }))
                return id
            },

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
                const id = Math.random().toString(36).substring(2, 9)
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

            labMode: 'json',
            labTextBlocks: [],
            labMarkdownBlocks: [],
            labJsonNodes: [],

            setLabMode: (mode) => set({ labMode: mode }),
            setLabTextBlocks: (blocks) => set({ labTextBlocks: blocks }),
            setLabMarkdownBlocks: (blocks) => set({ labMarkdownBlocks: blocks }),
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
                    labMode: 'json',
                    labTextBlocks: [],
                    labMarkdownBlocks: [],
                    labJsonNodes: [],
                    currentProjectId: null
                }),

            saveCurrentProject: () => {
                const state = get()
                if (!state.currentProjectId) return

                const projectData: Project = {
                    id: state.currentProjectId,
                    name: state.projects.find(p => p.id === state.currentProjectId)?.name || 'Untitled Project',
                    updatedAt: Date.now(),
                    assets: state.assets,
                    components: state.components,
                    viewMode: state.viewMode,
                    activeComponentId: state.activeComponentId,
                    mainSubject: state.mainSubject,
                    labMode: state.labMode,
                    labTextBlocks: state.labTextBlocks,
                    labMarkdownBlocks: state.labMarkdownBlocks,
                    labJsonNodes: state.labJsonNodes
                }

                set(state => ({
                    projects: state.projects.map(p => p.id === projectData.id ? projectData : p)
                }))
            },

            createProject: (name: string) => {
                const state = get()
                // Save current if exists
                if (state.currentProjectId) {
                    state.saveCurrentProject()
                }

                const newProject: Project = {
                    id: Math.random().toString(36).substring(2, 9),
                    name,
                    updatedAt: Date.now(),
                    assets: [],
                    components: [],
                    viewMode: 'main',
                    activeComponentId: null,
                    mainSubject: '',
                    labMode: 'json',
                    labTextBlocks: [],
                    labMarkdownBlocks: [],
                    labJsonNodes: []
                }

                set(state => ({
                    projects: [...state.projects, newProject],
                    currentProjectId: newProject.id,
                    // Reset active state
                    assets: [],
                    components: [],
                    viewMode: 'main',
                    activeComponentId: null,
                    mainSubject: '',
                    labMode: 'json',
                    labTextBlocks: [],
                    labMarkdownBlocks: [],
                    labJsonNodes: []
                }))
            },

            loadProject: (id: string) => {
                const state = get()
                if (state.currentProjectId === id) return

                if (state.currentProjectId) {
                    state.saveCurrentProject()
                }

                const project = state.projects.find(p => p.id === id)
                if (!project) return

                set({
                    currentProjectId: project.id,
                    assets: project.assets,
                    components: project.components,
                    viewMode: project.viewMode,
                    activeComponentId: project.activeComponentId,
                    mainSubject: project.mainSubject,
                    labMode: project.labMode,
                    labTextBlocks: project.labTextBlocks,
                    labMarkdownBlocks: project.labMarkdownBlocks || [],
                    labJsonNodes: project.labJsonNodes
                })
            },

            deleteProject: (id: string) => {
                set(state => {
                    const newProjects = state.projects.filter(p => p.id !== id)
                    // If deleting current project, reset state
                    if (state.currentProjectId === id) {
                        return {
                            projects: newProjects,
                            currentProjectId: null,
                            assets: [],
                            components: [],
                            viewMode: 'main',
                            activeComponentId: null,
                            mainSubject: '',
                            labMode: 'json',
                            labTextBlocks: [],
                            labMarkdownBlocks: [],
                            labJsonNodes: []
                        }
                    }
                    return { projects: newProjects }
                })
            },
        }),
        {
            name: 'synth-studio-storage',
        }
    )
)

export { useStudioStore }
