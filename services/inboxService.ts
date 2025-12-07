/**
 * Inbox Service - Manages content items waiting for user acceptance
 * Credits are only deducted when user accepts content
 */

export interface InboxItem {
  id: string;
  type: 'audio' | 'video' | 'text' | 'image';
  title: string;
  description?: string;
  content?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  cost: number;
  metadata?: Record<string, any>;
}

/**
 * Add a new item to the inbox (for audio/video generation)
 * Credits are NOT deducted here - only when user accepts
 */
export function addToInbox(
  type: 'audio' | 'video',
  title: string,
  description: string,
  content: string,
  cost: number,
  metadata?: Record<string, any>
): string {
  try {
    const existing = getInboxItems();
    
    const newItem: InboxItem = {
      id: `inbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description,
      content,
      status: 'pending',
      createdAt: new Date(),
      cost,
      metadata,
    };
    
    existing.unshift(newItem);
    
    // Keep only last 100 items
    if (existing.length > 100) {
      existing.splice(100);
    }
    
    localStorage.setItem('inboxItems', JSON.stringify(existing));
    
    return newItem.id;
  } catch (e) {
    console.error('Error adding to inbox:', e);
    throw e;
  }
}

/**
 * Get all inbox items
 */
export function getInboxItems(): InboxItem[] {
  try {
    const stored = localStorage.getItem('inboxItems');
    if (stored) {
      const items = JSON.parse(stored);
      return items.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    }
    return [];
  } catch (e) {
    console.error('Error loading inbox items:', e);
    return [];
  }
}

/**
 * Update inbox item status
 */
export function updateInboxItemStatus(
  itemId: string,
  status: 'pending' | 'accepted' | 'rejected'
): void {
  try {
    const items = getInboxItems();
    const updated = items.map(item =>
      item.id === itemId ? { ...item, status } : item
    );
    localStorage.setItem('inboxItems', JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating inbox item:', e);
  }
}

/**
 * Get pending items count
 */
export function getPendingCount(): number {
  return getInboxItems().filter(item => item.status === 'pending').length;
}

