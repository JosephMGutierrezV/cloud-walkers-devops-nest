/** Nest Imports */
import { Injectable } from '@nestjs/common';
/** Manejador de node-cache */
import { NodeCacheManager } from '../nodeCache';

@Injectable()
export class CacheManagerService {
  /** Manejador de memoria cache con node-cache */
  private readonly _nodeCacheManager: NodeCacheManager;

  constructor() {
    this._nodeCacheManager = NodeCacheManager.getInstance();
  }

  /**
   * Instancia de NodeCacheManager
   */
  get nodeCacheManager(): NodeCacheManager {
    return this._nodeCacheManager;
  }
}
