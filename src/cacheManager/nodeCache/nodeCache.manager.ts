/** Node Cache */
import * as NodeCache from 'node-cache';

export class NodeCacheManager {
  /** Instancia de la clase NodeCacheManager - Singleton */
  private static _instance: NodeCacheManager;
  /** Intancia de NodeCache */
  private readonly _nodeCache: NodeCache;

  private constructor() {
    this._nodeCache = new NodeCache({
      deleteOnExpire: true,
      checkperiod: 600,
      useClones: true,
    });
  }

  /**
   * Crear una instancia de la Clase NodeCacheManager
   */
  static getInstance(): NodeCacheManager {
    if (this._instance === null || this._instance === undefined) {
      this._instance = new NodeCacheManager();
    }

    return this._instance;
  }

  /**
   * Obtener un valor almacenado en memoria cache, si el objeto no existe retorna el valor null
   */
  get(cacheKey: string): any | any[] {
    const cacheObj: string = this._nodeCache.get<string>(cacheKey);
    if (cacheObj !== null && cacheObj !== undefined) {
      return JSON.parse(cacheObj);
    }
    return null;
  }

  /**
   * Setear un valor en memoria cache
   */
  set(cacheKey: string, obj: any): void {
    this._nodeCache.set<string>(cacheKey, JSON.stringify(obj));
  }

  /**
   * Eliminar un Valor almacenado en memoria cache
   */
  delete(cacheKey: string): void {
    this._nodeCache.del(cacheKey);
  }

  /**
   * Obtener un String almacenado en memoria cache, si el String no existe retorna el valor null
   */
  getString(cacheKey: string): any | any[] {
    const cacheString: string = this._nodeCache.get<string>(cacheKey);
    if (cacheString !== null && cacheString !== undefined) {
      return cacheString;
    }
    return null;
  }
}
