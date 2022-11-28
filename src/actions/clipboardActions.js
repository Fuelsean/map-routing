
export const CopyContent = async (content) => {
    try {
        await navigator.clipboard.writeText(content);
        //console.log('Content copied to clipboard');
        /* Resolved - text copied to clipboard successfully */
    } catch (err) {
        console.error('Failed to copy: ', err);
        /* Rejected - text failed to copy to the clipboard */
    }
};