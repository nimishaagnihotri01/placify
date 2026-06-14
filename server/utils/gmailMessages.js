const GMAIL_KEYWORDS = [
  'Placement',
  'Campus Drive',
  'Hiring',
  'Recruitment',
  'Registration Deadline',
  'Assessment',
  'Interview',
  'CTC',
  'Job Profile',
]

function decodeBase64Url(value = '') {
  if (!value) {
    return ''
  }

  return Buffer.from(value, 'base64url').toString('utf8')
}

function stripHtml(html = '') {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
}

function collectMimeText(part, result) {
  if (!part) {
    return
  }

  if (part.parts?.length) {
    part.parts.forEach((childPart) => collectMimeText(childPart, result))
  }

  const bodyText = decodeBase64Url(part.body?.data)
  if (!bodyText) {
    return
  }

  if (part.mimeType === 'text/plain') {
    result.plain.push(bodyText)
  }

  if (part.mimeType === 'text/html') {
    result.html.push(stripHtml(bodyText))
  }
}

export function getGmailSearchQuery() {
  const keywordQuery = GMAIL_KEYWORDS.map((keyword) =>
    keyword.includes(' ') ? `"${keyword}"` : keyword,
  ).join(' OR ')

  return `newer_than:90d (${keywordQuery})`
}

export function getMessageHeader(message, headerName) {
  return (
    message.payload?.headers?.find(
      (header) => header.name.toLowerCase() === headerName.toLowerCase(),
    )?.value || ''
  )
}

export function getMessageText(message) {
  const result = {
    plain: [],
    html: [],
  }

  collectMimeText(message.payload, result)

  return [...result.plain, ...result.html]
    .join('\n')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function normalizeOpportunityKey(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export { GMAIL_KEYWORDS }
