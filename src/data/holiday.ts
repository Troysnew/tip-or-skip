// Holiday tipping suggestions. Amounts follow the Emily Post Institute's Holiday Tipping Guide
// (https://emilypost.com/advice/holiday-tipping-guide), except Teacher, which still needs a source.

export interface HolidayTemplate {
  id: string;
  who: string;
  guide: string;
  source: string;
}

const EPI = 'Emily Post Institute';
const COMMON = 'Common US guidance';
export const HOLIDAY_SOURCE_URL = 'https://emilypost.com/advice/holiday-tipping-guide';

export const HOLIDAY_TEMPLATES: HolidayTemplate[] = [
  { id: 'mail', who: 'Mail carrier (USPS)', guide: 'A small gift worth $20 or less. No cash, checks, or gift cards.', source: EPI },
  { id: 'package', who: 'Package delivery driver', guide: 'A small gift around $20, only if you get regular deliveries. No cash.', source: EPI },
  { id: 'trash', who: 'Trash and recycling crew', guide: '$10 to $30 each for a private service. Check city rules for municipal crews.', source: EPI },
  { id: 'cleaner', who: 'House cleaner', guide: "Up to one week's pay, and/or a small gift.", source: EPI },
  { id: 'sitter', who: 'Babysitter (regular)', guide: "Up to one evening's pay, plus a small gift from your kids.", source: EPI },
  { id: 'nanny', who: 'Nanny or au pair', guide: "Up to one week's pay, plus a gift from your kids.", source: EPI },
  { id: 'daycare', who: 'Daycare staff', guide: '$25 to $70 for each staff member who works with your child, plus a small gift from your child.', source: EPI },
  { id: 'teacher', who: 'Teacher', guide: 'A card or small gift. Check school gift limits.', source: COMMON },
  { id: 'dogwalker', who: 'Dog walker', guide: "Up to one week's pay, or a gift.", source: EPI },
  { id: 'groomer', who: 'Pet groomer', guide: 'Up to the cost of one session, or a gift.', source: EPI },
  { id: 'barber', who: 'Barber', guide: 'Up to the cost of one haircut, or a gift.', source: EPI },
  { id: 'stylist', who: 'Salon staff', guide: 'Up to the cost of one visit, split among the staff, or small gifts.', source: EPI },
  { id: 'trainer', who: 'Personal trainer', guide: 'Up to the cost of one session, or a gift.', source: EPI },
  { id: 'massage', who: 'Massage therapist', guide: 'Up to the cost of one session, or a gift.', source: EPI },
  { id: 'lawn', who: 'Yard or garden worker', guide: '$20 to $50 each.', source: EPI },
  { id: 'pool', who: 'Pool cleaner', guide: 'Up to the cost of one cleaning, split among the crew.', source: EPI },
  { id: 'handyman', who: 'Handyman', guide: '$15 to $40.', source: EPI },
  { id: 'doorman', who: 'Doorman', guide: '$15 to $80, or $15 or more each if there are several.', source: EPI },
  { id: 'super', who: 'Building superintendent', guide: '$20 to $80, or a gift.', source: EPI },
  { id: 'garage', who: 'Garage attendant', guide: '$10 to $30, or a small gift.', source: EPI },
  { id: 'newspaper', who: 'Newspaper delivery', guide: '$10 to $30, or a small gift.', source: EPI },
];
