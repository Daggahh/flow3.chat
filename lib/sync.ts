'use client';

import { db } from './db/local';
import { auth } from '@/app/(auth)/auth';
import { toast } from 'sonner';

type SyncItem = {
  id: string;
  type: 'chat' | 'message' | 'api_key';
  action: 'create' | 'update' | 'delete';
  timestamp: Date;
  data: any;
};

export class SyncManager {
  private isOnline = true;
  private syncInProgress = false;
  private syncQueue: Map<string, SyncItem> = new Map();
  private retryCount: Map<string, number> = new Map();
  private maxRetries = 3;

  constructor() {
    if (typeof window !== 'undefined') {
      // Monitor online status
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      
      // Initial online check
      this.isOnline = navigator.onLine;
      
      // Start periodic sync
      this.startPeriodicSync();
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    toast.success('Back online, syncing...');
    this.syncToServer();
  };

  private handleOffline = () => {
    this.isOnline = false;
    toast.error('You are offline. Changes will be synced when you reconnect.');
  };

  private startPeriodicSync = () => {
    // Attempt sync every minute if there are items in queue
    setInterval(() => {
      if (this.syncQueue.size > 0) {
        this.syncToServer();
      }
    }, 60000);
  };

  public async syncToServer() {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    try {
      const session = await auth();
      if (!session?.user) return;

      // Process queue in order
      for (const [id, item] of this.syncQueue) {
        try {
          await this.processSyncItem(item, session.user.id);
          this.syncQueue.delete(id);
          this.retryCount.delete(id);
        } catch (error) {
          const retries = (this.retryCount.get(id) || 0) + 1;
          this.retryCount.set(id, retries);
          
          if (retries >= this.maxRetries) {
            toast.error(`Failed to sync item after ${this.maxRetries} attempts`);
            this.syncQueue.delete(id);
            this.retryCount.delete(id);
          }
          console.error(`Sync error for item ${id}:`, error);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncItem(item: SyncItem, userId: string) {
    const endpoint = this.getEndpointForType(item.type);
    const method = this.getMethodForAction(item.action);
    
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item.data, userId }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    // Update local sync status
    await this.updateLocalSyncStatus(item);
  }

  private getEndpointForType(type: SyncItem['type']): string {
    switch (type) {
      case 'api_key': return '/api/keys';
      case 'chat': return '/api/chat';
      case 'message': return '/api/messages';
      default: throw new Error(`Unknown sync type: ${type}`);
    }
  }

  private getMethodForAction(action: SyncItem['action']): string {
    switch (action) {
      case 'create': return 'POST';
      case 'update': return 'PUT';
      case 'delete': return 'DELETE';
      default: throw new Error(`Unknown action: ${action}`);
    }
  }

  private async updateLocalSyncStatus(item: SyncItem) {
    switch (item.type) {
      case 'api_key':
        await db.api_keys.update(item.id, { synced: true });
        break;
      case 'chat':
        await db.conversations.update(item.id, { synced: true });
        break;
      case 'message':
        await db.messages.update(item.id, { synced: true });
        break;
    }
  }

  public addToQueue(item: SyncItem) {
    this.syncQueue.set(item.id, item);
    if (this.isOnline && !this.syncInProgress) {
      this.syncToServer();
    }
  }

  public removeFromQueue(id: string) {
    this.syncQueue.delete(id);
    this.retryCount.delete(id);
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
