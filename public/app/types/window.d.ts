// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export declare global {
  interface Window {
    __grafana_app_bundle_loaded: boolean;
    __grafana_public_path__: string;
    __grafana_load_failed: () => void;
    public_cdn_path: string;
  }
}
