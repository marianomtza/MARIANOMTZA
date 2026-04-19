// Vercel Web Analytics component
import { inject } from "@vercel/analytics";

// Initialize analytics
inject();

// Export empty component (analytics is injected globally)
function VercelAnalytics() {
  return null;
}
