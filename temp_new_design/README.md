
# AIBC Media - Site Replacement Handover

## Overview
This package contains the complete, high-fidelity React codebase to replace the existing `aibcmedia.com` homepage. The design has been upgraded to feature a "Neural Core" operating system aesthetic (inspired by Tavus) and organic, high-end visualization components.

## Deployment Instructions for Antigravity

### 1. File Structure & Placement
Ensure the following components are placed in the `src/components/` directory:

*   **`OperatingSystem.tsx`**: (CRITICAL) This replaces the old grid/computer section. It features the "Neural Core" and floating agent windows.
*   **`ExampleOutputs.tsx`**: (CRITICAL) New "Blob/HUD" style visualizations for Brand, Strategy, and Intelligence.
*   **`Deploy.tsx`**: The interactive onboarding flow found at the `/deploy` route.
*   **`Hero.tsx`**: The main landing video section.
*   **`AgentMarquee.tsx`**: The infinite scroll component.

### 2. Styling Requirements (`index.html`)
The `index.html` file includes specific **custom CSS keyframes** required for the floating animations. 
**Action**: Ensure the following Tailwind/CSS classes are available globally or in your CSS config:

*   `.animate-float`: `animation: float 6s ease-in-out infinite;`
*   `.animate-float-delayed`: `animation: float 7s ease-in-out infinite 1s;`
*   `.animate-float-slow`: `animation: float 8s ease-in-out infinite 2s;`

### 3. Fonts
The design relies on two specific Google Fonts. Ensure these are loaded:
*   `Instrument Serif` (Headers, Display text)
*   `Inter` (Body text, UI elements)

### 4. Integration
The `App.tsx` serves as the main layout controller. It handles:
*   Hash-based routing for `#deploy` and `#pricing`.
*   Smooth scrolling for landing page sections.

### 5. Specific Design Notes
*   **Operating System Section**: This has been redesigned to remove the "retro computer" and replace it with a central glowing "Neural Core" surrounded by floating glass-morphism cards.
*   **Example Outputs**: This section now uses high-end, organic "blob" backgrounds and specialized UI for different agent types (Strategy Map vs. Brand Visualizer).

## Technical Stack
*   React 18
*   Tailwind CSS
*   Lucide React (Icons)
