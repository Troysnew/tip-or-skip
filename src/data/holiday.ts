// Holiday tipping suggestions. Amounts are typical US guidance and need a source check before launch,
// except the USPS entry, which follows the Postal Service's gift rule.

export interface HolidayTemplate {
  id: string;
  who: string;
  guide: string;
  source: string;
}

const COMMON = 'Common US guidance';

export const HOLIDAY_TEMPLATES: HolidayTemplate[] = [
  { id: 'mail', who: 'Mail carrier (USPS)', guide: 'No cash. A gift worth $20 or less is allowed.', source: 'USPS rule' },
  { id: 'package', who: 'Package delivery driver', guide: 'A small gift or treat. Many carriers restrict cash gifts.', source: COMMON },
  { id: 'trash', who: 'Trash and recycling crew', guide: '$10 to $30 per person, if your town allows it.', source: COMMON },
  { id: 'cleaner', who: 'House cleaner', guide: "About one visit's pay.", source: COMMON },
  { id: 'sitter', who: 'Babysitter (regular)', guide: "About one evening's pay.", source: COMMON },
  { id: 'nanny', who: 'Nanny', guide: "About one week's pay, plus a small gift from the kids.", source: COMMON },
  { id: 'daycare', who: 'Daycare staff', guide: 'A small gift for each regular caregiver. Check the center policy.', source: COMMON },
  { id: 'teacher', who: 'Teacher', guide: 'A card or small gift. Check school gift limits.', source: COMMON },
  { id: 'dogwalker', who: 'Dog walker', guide: "About one week's pay.", source: COMMON },
  { id: 'groomer', who: 'Pet groomer', guide: 'About the cost of one visit.', source: COMMON },
  { id: 'stylist', who: 'Hair stylist or barber', guide: 'About the cost of one visit.', source: COMMON },
  { id: 'trainer', who: 'Personal trainer', guide: "About one session's cost.", source: COMMON },
  { id: 'lawn', who: 'Lawn care crew', guide: "About one visit's cost, split among the crew.", source: COMMON },
  { id: 'doorman', who: 'Doorman', guide: 'Varies widely by building. Ask neighbors what is customary.', source: COMMON },
  { id: 'super', who: 'Building superintendent', guide: 'Varies by building. Often more than the doorman.', source: COMMON },
  { id: 'newspaper', who: 'Newspaper delivery', guide: '$10 to $30.', source: COMMON },
];
