/**
 * AIBC Core Platform - Main Entry Point
 *
 * Two-company architecture:
 * - Agentwood: Character IP (immutable snapshots)
 * - AIBC: Marketing platform (overlays + tasks)
 */
// ============================================
// SHARED TYPES
// ============================================
export * from './shared/types.js';
// ============================================
// AGENTWOOD (Character IP)
// ============================================
export { 
// Character export API
characterRegistry, initializeDefaultCharacters, getCharacterSnapshot, listAvailableCharacters, listAvailableArchetypes, 
// Archetypes
ARCHETYPES, createCharacterFromArchetype, 
// Character schemas
CharacterSnapshotSchema, validateCharacterSnapshot, isValidCharacterSnapshot, createCharacterSnapshot, 
// Voice profiles
CHATTERBOX_VOICES, getVoiceProfile, createCustomVoiceProfile, } from './agentwood/export.js';
// ============================================
// AIBC (Marketing Platform)
// ============================================
// Brand overlay
export { BrandOverlaySchema, validateBrandOverlay, isValidBrandOverlay, createBrandOverlay, createBrandOverlayFromPreset, INDUSTRY_PRESETS, } from './aibc/schemas/overlay.js';
// Task definitions
export { TaskDefinitionSchema, validateTaskDefinition, isValidTaskDefinition, createTaskDefinition, createTaskFromTemplate, TASK_TEMPLATES, } from './aibc/schemas/task.js';
// Engines
export { PromptGenerator, promptGenerator } from './aibc/engines/prompt.js';
export { BrandEngine, brandEngine } from './aibc/engines/brand.js';
export { TaskEngine, createTaskEngine } from './aibc/engines/task.js';
// Pipelines
export { TextPipeline, textPipeline } from './aibc/pipelines/text.js';
export { AudioPipeline, createAudioPipeline } from './aibc/pipelines/audio.js';
export { VideoFulfillmentEngine, createVideoFulfillmentEngine } from './aibc/pipelines/video.js';
//# sourceMappingURL=index.js.map