const MONTHS = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

const LABELS = [
  'company',
  'company name',
  'organization',
  'employer',
  'role',
  'position',
  'designation',
  'profile',
  'job title',
  'job role',
  'registration deadline',
  'application deadline',
  'last date to register',
  'last date for registration',
  'last date to apply',
  'register by',
  'apply by',
  'deadline',
  'test date',
  'assessment date',
  'online assessment',
  'oa date',
  'coding test',
  'interview date',
  'interview',
  'eligibility',
  'eligibility criteria',
  'eligible branches',
  'criteria',
  'package/ctc',
  'package',
  'ctc',
  'compensation',
  'salary',
  'stipend',
  'notes',
  'important notes',
  'selection process',
  'process',
  'rounds',
]

const DATE_PATTERN =
  '(?:\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}|\\d{1,2}(?:st|nd|rd|th)?[\\s\\-/.]+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t)?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\\d{1,2})[\\s\\-/.,]+\\d{2,4}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t)?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\\s.,-]+\\d{1,2}(?:st|nd|rd|th)?(?:,)?\\s+\\d{2,4})'

const SAMPLE_PLACEMENT_EMAILS = [
  {
    title: 'Campus hiring notice',
    content: `Subject: Placement Opportunity - NovaTech Labs

Dear Students,

NovaTech Labs is visiting campus for the role of Software Engineer Intern.

Company Name: NovaTech Labs
Role: Software Engineer Intern
Package/CTC: 12 LPA + internship stipend of 45,000 per month
Eligibility Criteria:
- B.Tech CSE/IT/ECE 2027 batch
- Minimum CGPA 7.0
- No active backlogs

Registration Deadline: 14 June 2026, 5:00 PM
Online Assessment Date: 18 June 2026
Interview Date: 22 June 2026

Selection Process: Online coding test, technical interview, HR discussion.
Notes: Keep resume and college ID ready during registration.`,
  },
  {
    title: 'Short deadline format',
    content: `Greetings,

We are pleased to announce that BrightStack will be conducting a recruitment drive for Associate Product Engineer.

Eligible branches: CSE, IT, AIML, ECE
Criteria: 70% in 10th/12th and 6.5 CGPA in degree. No current backlog.
CTC offered: INR 8.5 LPA

Register by: 12/06/2026
Test: 15/06/2026
Interviews: 19/06/2026

Important: The registration form link will close at 11:59 PM.`,
  },
  {
    title: 'Bulletin style email',
    content: `Placement Cell Update

Company - Ardent Analytics
Profile - Data Analyst Trainee
Application Deadline - June 20, 2026
Assessment Date - June 24, 2026
Interview - To be announced
Compensation - 6 LPA
Eligibility - B.E/B.Tech/MCA, all circuit branches, CGPA 6.0 and above.

Rounds: Aptitude test, SQL case study, manager interview.
Please check the portal for the detailed job description.`,
  },
]

function normalizeEmail(text) {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
}

function cleanLine(line) {
  return line.replace(/^\s*(?:[-*#]|\d+[.)])\s*/, '').trim()
}

function isLikelyLabel(line) {
  const cleaned = cleanLine(line).toLowerCase()
  return LABELS.some((label) =>
    new RegExp(
      `^${escapeRegex(label)}\\b(?:\\s+(?:offered|details|date))?\\s*(?:[:=\\-]|$)`,
      'i',
    ).test(cleaned),
  )
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function compactValue(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
}

function cleanShortValue(value) {
  return compactValue(value).replace(/[.;,\s]+$/, '')
}

function toDateInput(date) {
  if (!date || Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeYear(yearValue) {
  const year = Number(yearValue)

  if (yearValue.length === 2) {
    return year >= 70 ? 1900 + year : 2000 + year
  }

  return year
}

function parseDateValue(rawValue) {
  if (!rawValue) {
    return ''
  }

  const value = rawValue
    .toLowerCase()
    .replace(/\b(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)\b,?/g, '')
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/g, '$1')
    .replace(/\bat\b.*$/i, '')
    .replace(/\bby\b.*$/i, '')
    .replace(/\bto be announced\b|\btba\b|\bnot announced\b/g, '')
    .trim()

  if (!value) {
    return ''
  }

  const isoMatch = value.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return toDateInput(new Date(Number(year), Number(month) - 1, Number(day)))
  }

  const monthFirstMatch = value.match(
    /\b([a-z]{3,9})[\s.,-]+(\d{1,2})(?:,)?\s+(\d{2,4})\b/i,
  )
  if (monthFirstMatch && MONTHS[monthFirstMatch[1].toLowerCase()] !== undefined) {
    const [, monthName, day, year] = monthFirstMatch
    return toDateInput(
      new Date(normalizeYear(year), MONTHS[monthName.toLowerCase()], Number(day)),
    )
  }

  const dayFirstMonthNameMatch = value.match(
    /\b(\d{1,2})[\s\-/.]+([a-z]{3,9})[\s\-/.]+(\d{2,4})\b/i,
  )
  if (
    dayFirstMonthNameMatch &&
    MONTHS[dayFirstMonthNameMatch[2].toLowerCase()] !== undefined
  ) {
    const [, day, monthName, year] = dayFirstMonthNameMatch
    return toDateInput(
      new Date(normalizeYear(year), MONTHS[monthName.toLowerCase()], Number(day)),
    )
  }

  const numericMatch = value.match(/\b(\d{1,2})[\-/.](\d{1,2})[\-/.](\d{2,4})\b/)
  if (numericMatch) {
    const [, first, second, year] = numericMatch
    const firstNumber = Number(first)
    const secondNumber = Number(second)
    const day = firstNumber > 12 ? firstNumber : firstNumber
    const month = firstNumber > 12 ? secondNumber : secondNumber

    return toDateInput(new Date(normalizeYear(year), month - 1, day))
  }

  return ''
}

function extractDateText(value) {
  const match = value.match(new RegExp(DATE_PATTERN, 'i'))
  return match?.[0] || value
}

function getLines(text) {
  return normalizeEmail(text)
    .split('\n')
    .map(cleanLine)
}

function findLabeledBlock(lines, aliases, maxContinuationLines = 3) {
  const aliasPattern = aliases.map(escapeRegex).join('|')
  const matcher = new RegExp(
    `^(?:${aliasPattern})(?:\\s+(?:offered|details|date))?\\s*(?:[:=\\-]|-)?\\s*(.*)$`,
    'i',
  )

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const match = line.match(matcher)

    if (!match) {
      continue
    }

    const values = []
    if (match[1]?.trim()) {
      values.push(match[1].trim())
    }

    for (
      let nextIndex = index + 1;
      nextIndex < lines.length &&
      values.length < maxContinuationLines + (match[1]?.trim() ? 1 : 0);
      nextIndex += 1
    ) {
      const nextLine = lines[nextIndex]

      if (!nextLine || isLikelyLabel(nextLine)) {
        break
      }

      values.push(nextLine)
    }

    return compactValue(values.join(' '))
  }

  return ''
}

function findContextValue(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) {
      return compactValue(match[1])
    }
  }

  return ''
}

function findCompany(lines, text) {
  const labeled = findLabeledBlock(lines, [
    'company name',
    'company',
    'organization',
    'employer',
  ], 0)

  if (labeled) {
    return { value: labeled, confidence: 'High' }
  }

  const subject = lines.find((line) => /^subject\s*:/i.test(line))
  if (subject) {
    const subjectValue = subject.replace(/^subject\s*:\s*/i, '')
    const parts = subjectValue
      .split(/\s[-|]\s/)
      .map((part) => part.trim())
      .filter(Boolean)
    const candidate = parts.find(
      (part) => !/placement|opportunity|drive|hiring|recruitment/i.test(part),
    )

    if (candidate) {
      return { value: candidate, confidence: 'Medium' }
    }
  }

  const inferred = findContextValue(text, [
    /(?:pleased to announce that|announce|update[:\s]+)\s+([A-Z][A-Za-z0-9&.,' ]{2,60}?)\s+(?:is|will be|has)/,
    /([A-Z][A-Za-z0-9&.,' ]{2,60}?)\s+(?:is visiting|will be visiting|is conducting|will conduct|is hiring|will hire)/,
  ])

  return inferred
    ? { value: cleanShortValue(inferred), confidence: 'Medium' }
    : { value: '', confidence: 'Low' }
}

function findRole(lines, text) {
  const labeled = findLabeledBlock(lines, [
    'role',
    'position',
    'designation',
    'profile',
    'job title',
    'job role',
  ], 0)

  if (labeled) {
    return { value: labeled, confidence: 'High' }
  }

  const inferred = findContextValue(text, [
    /(?:role|position|profile|designation)\s+of\s+([A-Za-z0-9&/.,'() -]{3,70})/i,
    /(?:hiring|recruiting|drive)\s+(?:for|as)\s+([A-Za-z0-9&/.,'() -]{3,70})/i,
    /for\s+the\s+role\s+of\s+([A-Za-z0-9&/.,'() -]{3,70})/i,
  ])

  return inferred
    ? { value: cleanShortValue(inferred), confidence: 'Medium' }
    : { value: '', confidence: 'Low' }
}

function findDateField(lines, text, aliases, contextPatterns) {
  const labeled = findLabeledBlock(lines, aliases, 0)
  if (labeled) {
    const value = parseDateValue(extractDateText(labeled))
    return { value, confidence: value ? 'High' : 'Low' }
  }

  for (const pattern of contextPatterns) {
    const match = text.match(pattern)
    if (match?.[1]) {
      const value = parseDateValue(extractDateText(match[1]))
      if (value) {
        return { value, confidence: 'Medium' }
      }
    }
  }

  return { value: '', confidence: 'Low' }
}

function findEligibility(lines) {
  const labeled = [
    findLabeledBlock(lines, ['eligibility criteria', 'eligibility']),
    findLabeledBlock(lines, ['eligible branches'], 1),
    findLabeledBlock(lines, ['criteria'], 2),
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(' ')

  if (labeled) {
    return { value: labeled, confidence: 'High' }
  }

  const keywordLines = lines.filter((line) =>
    /\b(cgpa|gpa|backlog|branches|b\.?tech|b\.?e\.?|mca|eligible|eligibility|percentage|10th|12th)\b/i.test(
      line,
    ),
  )

  if (keywordLines.length > 0) {
    return {
      value: compactValue(keywordLines.slice(0, 3).join(' ')),
      confidence: 'Medium',
    }
  }

  return { value: '', confidence: 'Low' }
}

function findPackage(lines, text) {
  const labeled = findLabeledBlock(lines, [
    'package/ctc',
    'package',
    'ctc',
    'compensation',
    'salary',
    'stipend',
  ], 1)

  if (labeled) {
    return { value: labeled, confidence: 'High' }
  }

  const inferred = findContextValue(text, [
    /(?:ctc|package|compensation|salary|stipend)\s*(?:offered|is|of|:|-)?\s*((?:inr|rs\.?|₹)?\s*[\d.]+\s*(?:lpa|lacs?|lakhs?|pa|per annum|k|thousand)(?:\s*[+/-]\s*[\w\s.,]+)?)/i,
    /((?:inr|rs\.?|₹)?\s*[\d.]+\s*(?:lpa|lacs?|lakhs?))(?:\s+ctc|\s+package)?/i,
  ])

  return inferred
    ? { value: inferred, confidence: 'Medium' }
    : { value: '', confidence: 'Low' }
}

function findNotes(lines) {
  const notes = findLabeledBlock(lines, ['notes', 'important notes', 'important'], 3)
  const process = findLabeledBlock(lines, ['selection process', 'process', 'rounds'], 3)

  const joinedNotes = [process && `Selection Process: ${process}`, notes]
    .filter(Boolean)
    .join('\n')

  if (joinedNotes) {
    return { value: joinedNotes, confidence: 'High' }
  }

  const usefulLines = lines.filter((line) =>
    /\b(resume|form link|portal|document|college id|rounds?|technical|hr|aptitude|coding)\b/i.test(
      line,
    ),
  )

  if (usefulLines.length > 0) {
    return {
      value: usefulLines.slice(0, 3).join('\n'),
      confidence: 'Medium',
    }
  }

  return { value: '', confidence: 'Low' }
}

function makeField(value, confidence) {
  return {
    value,
    confidence: value ? confidence : 'Low',
  }
}

export function extractPlacementEmail(emailContent) {
  const normalized = normalizeEmail(emailContent)
  const lines = getLines(normalized).filter(Boolean)
  const company = findCompany(lines, normalized)
  const role = findRole(lines, normalized)
  const registrationDeadline = findDateField(
    lines,
    normalized,
    [
      'registration deadline',
      'application deadline',
      'last date to register',
      'last date for registration',
      'last date to apply',
      'register by',
      'apply by',
      'deadline',
    ],
    [
      new RegExp(
        `(?:registration closes|registration deadline|application deadline|last date to register|last date for registration|last date to apply|register by|apply by|deadline)\\s*(?:is|on|:|-)?\\s*(${DATE_PATTERN})`,
        'i',
      ),
    ],
  )
  const testDate = findDateField(
    lines,
    normalized,
    ['test date', 'assessment date', 'online assessment date', 'online assessment', 'oa date', 'coding test', 'test'],
    [
      new RegExp(
        `(?:online assessment|assessment|coding test|test|oa)\\s*(?:date|is|on|:|-)?\\s*(${DATE_PATTERN})`,
        'i',
      ),
    ],
  )
  const interviewDate = findDateField(
    lines,
    normalized,
    ['interview date', 'interview', 'interviews'],
    [
      new RegExp(
        `(?:interview|interviews)\\s*(?:date|is|on|:|-)?\\s*(${DATE_PATTERN})`,
        'i',
      ),
    ],
  )
  const eligibilityCriteria = findEligibility(lines)
  const packageCtc = findPackage(lines, normalized)
  const notes = findNotes(lines)

  return {
    companyName: makeField(company.value, company.confidence),
    role: makeField(role.value, role.confidence),
    registrationDeadline: makeField(
      registrationDeadline.value,
      registrationDeadline.confidence,
    ),
    testDate: makeField(testDate.value, testDate.confidence),
    interviewDate: makeField(interviewDate.value, interviewDate.confidence),
    eligibilityCriteria: makeField(
      eligibilityCriteria.value,
      eligibilityCriteria.confidence,
    ),
    packageCtc: makeField(packageCtc.value, packageCtc.confidence),
    notes: makeField(notes.value, notes.confidence),
  }
}

export { SAMPLE_PLACEMENT_EMAILS }
