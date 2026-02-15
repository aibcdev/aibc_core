import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkspaceNav } from './WorkspaceNav';
import { ErrorBoundary } from './ErrorBoundary';
import type { WorkspaceId } from '../lib/types/marketing-os';

// Import workspace components
import { HeadquartersWorkspace } from './workspaces/HeadquartersWorkspace';
import { IntelligenceWorkspace } from './workspaces/IntelligenceWorkspace';
import { CampaignsWorkspace } from './workspaces/CampaignsWorkspace';
import { ContentStudioWorkspace } from './workspaces/ContentStudioWorkspace';
import { BrandSystemWorkspace } from './workspaces/BrandSystemWorkspace';
import { ReportsWorkspace } from './workspaces/ReportsWorkspace';
export function Dashboard() {
    const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('headquarters');

    const renderWorkspace = () => {
        switch (activeWorkspace) {
            case 'headquarters':
                return <ErrorBoundary name="Headquarters"><HeadquartersWorkspace /></ErrorBoundary>;
            case 'intelligence':
                return <ErrorBoundary name="Intelligence"><IntelligenceWorkspace /></ErrorBoundary>;
            case 'campaigns':
                return <ErrorBoundary name="Campaigns"><CampaignsWorkspace /></ErrorBoundary>;
            case 'content_studio':
                return <ErrorBoundary name="ContentStudio"><ContentStudioWorkspace /></ErrorBoundary>;
            case 'brand_system':
                return <ErrorBoundary name="BrandSystem"><BrandSystemWorkspace /></ErrorBoundary>;
            case 'reports':
                return <ErrorBoundary name="Reports"><ReportsWorkspace /></ErrorBoundary>;
            default:
                return <ErrorBoundary name="Headquarters"><HeadquartersWorkspace /></ErrorBoundary>;
        }
    };

    return (
        <div className="h-screen bg-[#0d0d0d] text-white flex overflow-hidden">
            {/* Left Navigation */}
            <ErrorBoundary name="WorkspaceNav">
                <WorkspaceNav
                    activeWorkspace={activeWorkspace}
                    onWorkspaceChange={setActiveWorkspace}
                    activeAgent={null} // Deprecated but keeping signature if needed or removing if interface changed
                    onAgentSelect={() => { }} // Deprecated
                />
            </ErrorBoundary>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeWorkspace}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {renderWorkspace()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
