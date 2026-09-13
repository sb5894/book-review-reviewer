declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    GOOGLE_SERVICE_ACCOUNT_JSON?: string;
    GOOGLE_CLOUD_PROJECT?: string;
    GOOGLE_CLOUD_LOCATION?: string;
    VERTEX_MODEL?: string;
  }
}
