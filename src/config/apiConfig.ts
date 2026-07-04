export interface ApiConfig {
  corporateRegistryUrl: string;
  socialMediaDataUrl: string;
  customsDocumentUrl: string;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  corporateRegistryUrl: "https://api.vericred.org/v1/corporate/query",
  socialMediaDataUrl: "https://api.vericred.org/v1/social/profile",
  customsDocumentUrl: "https://api.vericred.org/v1/customs/validate"
};

/**
 * Retrieve the current API configurations, prioritizing localStorage values.
 */
export function getApiConfig(): ApiConfig {
  const saved = localStorage.getItem("vericred_api_config");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse saved API config, falling back to defaults.", e);
    }
  }
  return { ...DEFAULT_API_CONFIG };
}

/**
 * Save updated API configurations to localStorage.
 */
export function saveApiConfig(config: ApiConfig): void {
  localStorage.setItem("vericred_api_config", JSON.stringify(config));
}
