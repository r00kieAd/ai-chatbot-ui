declare module 'markdown' {
    interface MarkdownLib {
        toHTML(markdownText: string): string;
    }
    
    const markdown: MarkdownLib;
    export { markdown };
}
