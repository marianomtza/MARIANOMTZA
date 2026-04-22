/**
 * Utility to generate properly formatted WhatsApp API links
 *
 * @param {string} phone - The raw phone number string (e.g. "+52 55 1234 5678")
 * @param {string} message - The message to pre-fill in the chat
 * @returns {string} The formatted wa.me URL
 */
export function buildWhatsAppLink(phone, message) {
  if (!phone) return ''
  
  // Clean phone number: keep only digits
  const cleanPhone = phone.replace(/\D/g, '')
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}
