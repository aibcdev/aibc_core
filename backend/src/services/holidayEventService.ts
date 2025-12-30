/**
 * Holiday and Event Awareness Service
 * Detects current/upcoming holidays and suggests relevant content topics
 */

export interface HolidayEvent {
  name: string;
  date: Date;
  type: 'holiday' | 'season' | 'event' | 'observance';
  relevance: 'high' | 'medium' | 'low'; // How relevant for content marketing
  suggestedKeywords: string[];
  contentIdeas: string[];
}

/**
 * Major holidays and events throughout the year
 */
const HOLIDAYS_EVENTS: Array<{
  name: string;
  month: number; // 1-12
  day?: number; // Specific day, or undefined for month-long
  type: HolidayEvent['type'];
  relevance: HolidayEvent['relevance'];
  suggestedKeywords: string[];
  contentIdeas: string[];
}> = [
  // January
  {
    name: 'New Year',
    month: 1,
    day: 1,
    type: 'holiday',
    relevance: 'high',
    suggestedKeywords: [
      'new year marketing strategies',
      'new year resolution content ideas',
      'new year social media campaigns',
      'january content calendar',
      'new year engagement posts'
    ],
    contentIdeas: [
      'New Year Resolution Posts That Boost Engagement',
      'How to Create New Year Marketing Campaigns',
      'Best New Year Content Ideas for Brands',
      'New Year Social Media Strategy Guide'
    ]
  },
  {
    name: 'Valentine\'s Day',
    month: 2,
    day: 14,
    type: 'holiday',
    relevance: 'high',
    suggestedKeywords: [
      'valentine\'s day marketing',
      'valentine\'s day content ideas',
      'valentine\'s day social media posts',
      'february marketing campaigns'
    ],
    contentIdeas: [
      'Valentine\'s Day Marketing Campaign Ideas',
      'How to Create Engaging Valentine\'s Day Content',
      'Valentine\'s Day Social Media Strategy'
    ]
  },
  // March
  {
    name: 'International Women\'s Day',
    month: 3,
    day: 8,
    type: 'observance',
    relevance: 'high',
    suggestedKeywords: [
      'women\'s day marketing',
      'diversity content marketing',
      'inclusive marketing campaigns'
    ],
    contentIdeas: [
      'How to Create Authentic Women\'s Day Content',
      'Inclusive Marketing Campaign Ideas'
    ]
  },
  // April
  {
    name: 'Easter',
    month: 4,
    type: 'holiday',
    relevance: 'medium',
    suggestedKeywords: [
      'easter marketing ideas',
      'spring content marketing',
      'april marketing campaigns'
    ],
    contentIdeas: [
      'Easter Marketing Campaign Ideas',
      'Spring Content Marketing Strategies'
    ]
  },
  // May
  {
    name: 'Mother\'s Day',
    month: 5,
    type: 'holiday',
    relevance: 'high',
    suggestedKeywords: [
      'mother\'s day marketing',
      'mother\'s day content ideas',
      'may marketing campaigns'
    ],
    contentIdeas: [
      'Mother\'s Day Marketing Campaign Ideas',
      'How to Create Emotional Mother\'s Day Content'
    ]
  },
  // June
  {
    name: 'Father\'s Day',
    month: 6,
    type: 'holiday',
    relevance: 'high',
    suggestedKeywords: [
      'father\'s day marketing',
      'father\'s day content ideas',
      'june marketing campaigns'
    ],
    contentIdeas: [
      'Father\'s Day Marketing Campaign Ideas',
      'Summer Content Marketing Strategies'
    ]
  },
  // July
  {
    name: 'Independence Day (US)',
    month: 7,
    day: 4,
    type: 'holiday',
    relevance: 'medium',
    suggestedKeywords: [
      'independence day marketing',
      'summer marketing campaigns',
      'july content ideas'
    ],
    contentIdeas: [
      'Summer Marketing Campaign Ideas',
      'July Content Calendar Ideas'
    ]
  },
  // August
  {
    name: 'Back to School',
    month: 8,
    type: 'season',
    relevance: 'high',
    suggestedKeywords: [
      'back to school marketing',
      'back to school content ideas',
      'august marketing campaigns',
      'education marketing'
    ],
    contentIdeas: [
      'Back to School Marketing Campaign Ideas',
      'How to Target Students and Parents in August'
    ]
  },
  // September
  {
    name: 'Labor Day',
    month: 9,
    type: 'holiday',
    relevance: 'medium',
    suggestedKeywords: [
      'labor day marketing',
      'september content marketing',
      'fall marketing campaigns'
    ],
    contentIdeas: [
      'Fall Marketing Campaign Ideas',
      'September Content Calendar'
    ]
  },
  // October
  {
    name: 'Halloween',
    month: 10,
    day: 31,
    type: 'holiday',
    relevance: 'high',
    suggestedKeywords: [
      'halloween marketing ideas',
      'halloween content marketing',
      'october marketing campaigns',
      'spooky content ideas'
    ],
    contentIdeas: [
      'Halloween Marketing Campaign Ideas',
      'How to Create Spooky Content That Converts',
      'October Content Marketing Strategies'
    ]
  },
  // November
  {
    name: 'Thanksgiving',
    month: 11,
    type: 'holiday',
    relevance: 'high',
    suggestedKeywords: [
      'thanksgiving marketing',
      'thanksgiving content ideas',
      'november marketing campaigns',
      'gratitude marketing'
    ],
    contentIdeas: [
      'Thanksgiving Marketing Campaign Ideas',
      'How to Show Gratitude in Your Marketing',
      'November Content Calendar Ideas'
    ]
  },
  // December
  {
    name: 'Christmas',
    month: 12,
    day: 25,
    type: 'holiday',
    relevance: 'high',
    suggestedKeywords: [
      'christmas marketing strategies',
      'holiday advertising campaigns',
      'christmas content marketing',
      'december marketing ideas',
      'holiday season advertising',
      'christmas social media campaigns'
    ],
    contentIdeas: [
      'How to Advertise in the Christmas Holiday Season',
      'Christmas Marketing Campaign Ideas',
      'Holiday Content Marketing Strategies',
      'December Content Calendar for Brands',
      'Holiday Season Social Media Strategy'
    ]
  },
  {
    name: 'New Year\'s Eve',
    month: 12,
    day: 31,
    type: 'holiday',
    relevance: 'high',
    suggestedKeywords: [
      'new year\'s eve marketing',
      'year-end content marketing',
      'december marketing campaigns'
    ],
    contentIdeas: [
      'Year-End Marketing Campaign Ideas',
      'New Year\'s Eve Content Strategies'
    ]
  },
  // Month-long seasons
  {
    name: 'Black Friday / Cyber Monday',
    month: 11,
    type: 'event',
    relevance: 'high',
    suggestedKeywords: [
      'black friday marketing',
      'cyber monday campaigns',
      'holiday shopping marketing',
      'november sales campaigns'
    ],
    contentIdeas: [
      'Black Friday Marketing Campaign Ideas',
      'Cyber Monday Content Strategies',
      'How to Create Effective Holiday Sales Content'
    ]
  },
  {
    name: 'Summer Season',
    month: 6,
    type: 'season',
    relevance: 'medium',
    suggestedKeywords: [
      'summer marketing campaigns',
      'summer content ideas',
      'seasonal marketing strategies'
    ],
    contentIdeas: [
      'Summer Marketing Campaign Ideas',
      'Seasonal Content Marketing Strategies'
    ]
  },
  {
    name: 'Holiday Shopping Season',
    month: 11,
    type: 'season',
    relevance: 'high',
    suggestedKeywords: [
      'holiday shopping marketing',
      'holiday advertising strategies',
      'november december marketing',
      'holiday season content'
    ],
    contentIdeas: [
      'Complete Guide to Holiday Season Advertising',
      'Holiday Shopping Marketing Campaign Ideas',
      'How to Maximize Holiday Season Engagement'
    ]
  }
];

/**
 * Get current/upcoming holidays and events
 * Returns events within the next 30 days or currently happening
 */
export function getRelevantHolidaysEvents(daysAhead: number = 30): HolidayEvent[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + daysAhead);

  const relevant: HolidayEvent[] = [];

  for (const event of HOLIDAYS_EVENTS) {
    const eventDate = new Date(now.getFullYear(), event.month - 1, event.day || 1);
    
    // Handle month-long events
    if (!event.day) {
      // Check if we're in the month
      if (event.month === now.getMonth() + 1) {
        relevant.push({
          name: event.name,
          date: eventDate,
          type: event.type,
          relevance: event.relevance,
          suggestedKeywords: event.suggestedKeywords,
          contentIdeas: event.contentIdeas
        });
      }
    } else {
      // Check if event is within range (including past events up to 7 days ago for catch-up)
      const daysDiff = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= -7 && daysDiff <= daysAhead) {
        relevant.push({
          name: event.name,
          date: eventDate,
          type: event.type,
          relevance: event.relevance,
          suggestedKeywords: event.suggestedKeywords,
          contentIdeas: event.contentIdeas
        });
      }
    }
  }

  // Sort by relevance (high first) and date proximity
  return relevant.sort((a, b) => {
    const relevanceOrder = { high: 3, medium: 2, low: 1 };
    if (relevanceOrder[a.relevance] !== relevanceOrder[b.relevance]) {
      return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
    }
    return Math.abs(a.date.getTime() - now.getTime()) - Math.abs(b.date.getTime() - now.getTime());
  });
}

/**
 * Get the most relevant holiday/event for content generation right now
 */
export function getTopHolidayEvent(): HolidayEvent | null {
  const relevant = getRelevantHolidaysEvents(14); // Next 2 weeks
  return relevant.length > 0 ? relevant[0] : null;
}

/**
 * Get suggested keyword based on current holidays/events
 * Returns a holiday-specific keyword if available, otherwise null
 */
export function getHolidayKeyword(): string | null {
  const topEvent = getTopHolidayEvent();
  if (!topEvent || topEvent.relevance === 'low') {
    return null;
  }

  // Return a random keyword from the event's suggestions
  const keywords = topEvent.suggestedKeywords;
  return keywords[Math.floor(Math.random() * keywords.length)];
}

/**
 * Get content idea based on current holidays/events
 */
export function getHolidayContentIdea(): string | null {
  const topEvent = getTopHolidayEvent();
  if (!topEvent || topEvent.relevance === 'low') {
    return null;
  }

  const ideas = topEvent.contentIdeas;
  return ideas[Math.floor(Math.random() * ideas.length)];
}

/**
 * Get holiday context for content generation prompt
 */
export function getHolidayContext(): string {
  const topEvent = getTopHolidayEvent();
  if (!topEvent) {
    return '';
  }

  const daysUntil = Math.ceil((topEvent.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const timing = daysUntil < 0 
    ? `just passed (${Math.abs(daysUntil)} days ago)`
    : daysUntil === 0 
    ? 'today'
    : daysUntil === 1
    ? 'tomorrow'
    : `in ${daysUntil} days`;

  return `\n\nIMPORTANT HOLIDAY/EVENT CONTEXT:
- Current/Upcoming Event: ${topEvent.name} (${topEvent.type}, ${timing})
- Relevance: ${topEvent.relevance}
- Suggested Focus: Create content that is timely and relevant to ${topEvent.name}
- Content Ideas: ${topEvent.contentIdeas.join(', ')}
- Make the content feel current and aligned with this ${topEvent.type === 'holiday' ? 'holiday' : 'event'}
- Include references to ${topEvent.name} naturally in the content where appropriate
- This is a ${topEvent.relevance}-relevance event, so ${topEvent.relevance === 'high' ? 'prioritize' : 'consider'} making it a central theme`;
}




