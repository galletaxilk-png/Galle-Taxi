/**
 * Cloudflare Pages Function: /api/send-confirmation
 * Alias endpoint for booking confirmation & tax invoice delivery
 */
export { onRequestPost, onRequestOptions, onRequest } from './send-receipt.js';
