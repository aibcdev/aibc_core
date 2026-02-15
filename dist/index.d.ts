/**
 * AIBC Core Platform - Main Entry Point
 *
 * Two-company architecture:
 * - Agentwood: Character IP (immutable snapshots)
 * - AIBC: Marketing platform (overlays + tasks)
 */
export * from './shared/types.js';
export { characterRegistry, initializeDefaultCharacters, getCharacterSnapshot, listAvailableCharacters, listAvailableArchetypes, ARCHETYPES, createCharacterFromArchetype, CharacterSnapshotSchema, validateCharacterSnapshot, isValidCharacterSnapshot, createCharacterSnapshot, CHATTERBOX_VOICES, getVoiceProfile, createCustomVoiceProfile, } from './agentwood/export.js';
export { BrandOverlaySchema, validateBrandOverlay, isValidBrandOverlay, createBrandOverlay, createBrandOverlayFromPreset, INDUSTRY_PRESETS, } from './aibc/schemas/overlay.js';
export { TaskDefinitionSchema, validateTaskDefinition, isValidTaskDefinition, createTaskDefinition, createTaskFromTemplate, TASK_TEMPLATES, } from './aibc/schemas/task.js';
export { PromptGenerator, promptGenerator } from './aibc/engines/prompt.js';
export { BrandEngine, brandEngine } from './aibc/engines/brand.js';
export { TaskEngine, createTaskEngine } from './aibc/engines/task.js';
export { TextPipeline, textPipeline } from './aibc/pipelines/text.js';
export { AudioPipeline, createAudioPipeline } from './aibc/pipelines/audio.js';
export { VideoFulfillmentEngine, createVideoFulfillmentEngine } from './aibc/pipelines/video.js';
//# sourceMappingURL=index.d.ts.map