export class TextPipeline {
    /**
     * Format output for delivery
     */
    format(output, options = { format: 'markdown', includeMetadata: false }) {
        let formatted = output.content;
        if (options.format === 'html') {
            formatted = this.markdownToHtml(formatted);
        }
        else if (options.format === 'plain') {
            formatted = this.stripMarkdown(formatted);
        }
        if (options.includeMetadata) {
            const metadata = this.formatMetadata(output);
            if (options.format === 'html') {
                formatted = `<div class="metadata">${metadata}</div>\n${formatted}`;
            }
            else {
                formatted = `${metadata}\n---\n${formatted}`;
            }
        }
        return formatted;
    }
    /**
     * Extract specific sections from output
     */
    getSections(output) {
        return output.sections;
    }
    /**
     * Get a specific section
     */
    getSection(output, sectionName) {
        return output.sections[sectionName];
    }
    /**
     * Simple markdown to HTML conversion
     */
    markdownToHtml(markdown) {
        return markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Lists
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.*)$/gm, (match) => {
            if (match.startsWith('<'))
                return match;
            return `<p>${match}</p>`;
        });
    }
    /**
     * Strip markdown formatting
     */
    stripMarkdown(markdown) {
        return markdown
            .replace(/^#{1,6}\s/gm, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/^\- /gm, '• ')
            .replace(/^\d+\.\s/gm, '');
    }
    /**
     * Format metadata header
     */
    formatMetadata(output) {
        return `Character: ${output.character_snapshot_id}
Overlay: ${output.overlay_id}
Task: ${output.task_id}
Generated: ${output.timestamp}`;
    }
    /**
     * Validate output meets task constraints
     */
    validateOutput(output, task) {
        const issues = [];
        // Check word count
        if (task.constraints.max_words) {
            const wordCount = output.content.split(/\s+/).length;
            if (wordCount > task.constraints.max_words) {
                issues.push(`Word count ${wordCount} exceeds limit of ${task.constraints.max_words}`);
            }
        }
        // Check required sections
        for (const required of task.outputs_required) {
            if (!output.sections[required] || output.sections[required].trim() === '') {
                issues.push(`Missing required section: ${required}`);
            }
        }
        return {
            valid: issues.length === 0,
            issues,
            wordCount: output.content.split(/\s+/).length,
            sectionCount: Object.keys(output.sections).filter(k => output.sections[k]).length,
        };
    }
}
// Export singleton
export const textPipeline = new TextPipeline();
export default TextPipeline;
//# sourceMappingURL=text.js.map