/**
 * Global centralized API configuration endpoints.
 * Perfect for Cloudflare Pages and worker gateway decoupling.
 */

export const API_BASE_URL = "/api";
export const AGENT_VERIFY_URL = "/api/verify/agent";
export const FACTORY_DETAIL_URL = "/api/factory/detail";

// Sub-page API endpoints for live and cached multi-agent verification modules
export const VIDEO_API_URL = "/api/video";
export const REGISTRY_API_URL = "/api/registry";
export const CROSS_API_URL = "/api/cross";
export const RISK_API_URL = "/api/risk";
export const FACTORY_IMAGES_API_URL = "/api/factory_images";
export const PRODUCT_PHOTOS_API_URL = "/api/product_photos";
