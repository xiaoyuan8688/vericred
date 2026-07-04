/**
 * 内容加载桥接 —— 将 Decap CMS 产出的 JSON 数据接入 React 运行时。
 *
 * 工作流程：
 *   CMS 编辑 → 提交 JSON 到 public/data/ → Cloudflare Pages 重新构建
 *   → 新构建的站点加载最新 JSON 数据 → 前端展示更新
 *
 * 每种数据类型都优先从 JSON 文件加载，失败时退回到 TypeScript 硬编码数据。
 */

import { Supplier, MatchmakingRequest, initialMatchmakingQueue } from '../types';
import { MarketMerchant, SAMPLE_MARKET_MERCHANTS } from './marketServiceTypes';

// ─── 缓存 ────────────────────────────────────────────────────────
let _suppliersCache: Supplier[] | null = null;
let _merchantsCache: MarketMerchant[] | null = null;
let _matchmakingCache: MatchmakingRequest[] | null = null;
let _suppliersLoaded = false;
let _merchantsLoaded = false;
let _matchmakingLoaded = false;

async function tryFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const resp = await fetch(url, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return (await resp.json()) as T;
  } catch (err) {
    console.warn(`[ContentLoader] 无法加载 ${url}，使用内置数据:`, err);
    return fallback;
  }
}

// ─── 供应商 ──────────────────────────────────────────────────────

export async function loadSuppliers(): Promise<Supplier[]> {
  if (_suppliersLoaded) return _suppliersCache ?? [];

  const raw = await tryFetchJson<{ suppliers: Supplier[] }>(
    '/data/suppliers.json',
    { suppliers: [] } // types.ts 中的 sampleSuppliers 通过下方 getSuppliers 使用
  );

  if (raw.suppliers && raw.suppliers.length > 0) {
    _suppliersCache = raw.suppliers;
  } else {
    // 回退到 types.ts 硬编码数据
    _suppliersCache = (await import('../types')).sampleSuppliers;
  }

  _suppliersLoaded = true;
  return _suppliersCache;
}

/** 同步获取已缓存的供应商列表（假定 loadSuppliers 已调用） */
export function getCachedSuppliers(): Supplier[] {
  if (_suppliersCache) return _suppliersCache;
  // 尚未加载，同步回退
  return (await_sync_fallback_suppliers()) as Supplier[];
}

// 这个仅在模块初始化时使用，后续通过 loadSuppliers 覆盖
function await_sync_fallback_suppliers(): Supplier[] {
  // 延迟 import 自身 types.ts
  try {
    // 在 types.ts 中 sampleSuppliers 会被直接导入到使用处
    return [];
  } catch {
    return [];
  }
}

// ─── 市场商家 ────────────────────────────────────────────────────

export async function loadMerchants(): Promise<MarketMerchant[]> {
  if (_merchantsLoaded) return _merchantsCache ?? [];

  const raw = await tryFetchJson<{ merchants: MarketMerchant[] }>(
    '/data/merchants.json',
    { merchants: [] }
  );

  if (raw.merchants && raw.merchants.length > 0) {
    _merchantsCache = raw.merchants;
  } else {
    _merchantsCache = [...SAMPLE_MARKET_MERCHANTS];
  }

  _merchantsLoaded = true;
  return _merchantsCache;
}

/** 获取已缓存的商家数据 */
export function getCachedMerchants(): MarketMerchant[] {
  if (_merchantsCache) return _merchantsCache;
  return [...SAMPLE_MARKET_MERCHANTS];
}

// ─── 供需匹配 ────────────────────────────────────────────────────

export async function loadMatchmaking(): Promise<MatchmakingRequest[]> {
  if (_matchmakingLoaded) return _matchmakingCache ?? [];

  const raw = await tryFetchJson<{ requests: MatchmakingRequest[] }>(
    '/data/matchmaking.json',
    { requests: [] }
  );

  if (raw.requests && raw.requests.length > 0) {
    _matchmakingCache = raw.requests;
  } else {
    _matchmakingCache = [...initialMatchmakingQueue];
  }

  _matchmakingLoaded = true;
  return _matchmakingCache;
}

// ─── 预加载 ──────────────────────────────────────────────────────

/**
 * 应用启动时调用，并行加载所有 CMS 数据。
 * 返回 Promise，可以 await 以保证首批数据就绪。
 */
export async function preloadAllContent(): Promise<void> {
  await Promise.all([loadSuppliers(), loadMerchants(), loadMatchmaking()]);
  console.log('[ContentLoader] 所有内容数据加载完成');
}

/**
 * 清除缓存，强制下次重新加载（用于 CMS 保存后手动刷新）
 */
export function invalidateCache(): void {
  _suppliersCache = null;
  _merchantsCache = null;
  _matchmakingCache = null;
  _suppliersLoaded = false;
  _merchantsLoaded = false;
  _matchmakingLoaded = false;
}
