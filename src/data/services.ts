import type { BankrateKey, PewKey } from './surveys';

export type Verdict = 'expected' | 'optional' | 'not' | 'included';
export type Category = 'Food & drink' | 'Delivery' | 'Travel' | 'Personal care' | 'Home' | 'Everyday';

/** [low, high, default] */
export type Range = [number, number, number];

export interface Service {
  id: string;
  name: string;
  aliases: string[];
  category: Category;
  verdict: Verdict;
  /** Percent of the bill. Present for every service that is not flat-rate. */
  pct?: Range;
  /** Flat dollar amount per unit. */
  flat?: Range;
  unit?: string;
  qtyLabel?: string;
  source: string;
  pew?: PewKey;
  bankrate?: BankrateKey;
  /** Show the Pew restaurant tip-amount distribution. */
  amountStats?: boolean;
  note: string;
}

export const CATEGORIES: ('All' | Category)[] = ['All', 'Food & drink', 'Delivery', 'Travel', 'Personal care', 'Home', 'Everyday'];

export const VERDICT_TEXT: Record<Verdict, { answer: string; short: string }> = {
  expected: { answer: 'Yes, tip', short: 'Expected' },
  optional: { answer: 'Your call', short: 'Optional' },
  not: { answer: 'Skip it', short: 'Not expected' },
  included: { answer: 'Already included', short: 'Included' },
};

const EPI = 'Emily Post Institute';
const COMMON = 'Common US guidance';
const AHLA = 'AHLA';

type Row = Omit<Service, 'category'>;
const cat = (category: Category, rows: Row[]): Service[] => rows.map((r) => ({ ...r, category }));

export const SERVICES: Service[] = [
  ...cat('Food & drink', [
    { id: 'restaurant', name: 'Sit-down restaurant', aliases: ['waiter', 'waitress', 'server', 'dinner', 'restaurant', 'diner'], verdict: 'expected', pct: [15, 20, 18], source: EPI, pew: 'restaurant', bankrate: 'restaurant', amountStats: true, note: 'Tip on the pre-tax amount. Check the bill for an automatic gratuity or service charge first, especially with large parties.' },
    { id: 'bar', name: 'Bartender', aliases: ['bar', 'drinks', 'beer', 'cocktail', 'pub'], verdict: 'expected', flat: [1, 2, 1], unit: 'per drink', qtyLabel: 'Drinks', source: EPI, pew: 'bar', note: '$1 to $2 per drink, or 15% to 20% if you run a tab.' },
    { id: 'coffee', name: 'Coffee shop / barista', aliases: ['barista', 'starbucks', 'latte', 'cafe', 'coffee'], verdict: 'optional', flat: [0, 1, 1], unit: 'per drink', qtyLabel: 'Drinks', source: EPI, pew: 'coffee', bankrate: 'coffee', note: 'A tip screen does not make it required. Drop change or $1 if they made something complicated.' },
    { id: 'fastcasual', name: 'Fast casual / order at counter', aliases: ['chipotle', 'counter', 'fast casual', 'panera', 'sandwich shop'], verdict: 'optional', pct: [0, 10, 0], source: COMMON, pew: 'fastcasual', note: 'No server, so no tip is expected. Some people tip 10% when staff bring food to the table or handle a big order.' },
    { id: 'fastfood', name: 'Fast food drive-thru', aliases: ['mcdonalds', 'drive thru', 'drive-thru', 'burger'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected.' },
    { id: 'takeout', name: 'Takeout pickup', aliases: ['to go', 'to-go', 'carryout', 'pickup', 'take out'], verdict: 'optional', pct: [0, 10, 0], source: COMMON, bankrate: 'takeout', note: 'Optional. 10% is generous for large or complicated orders.' },
    { id: 'buffet', name: 'Buffet', aliases: ['all you can eat'], verdict: 'expected', pct: [10, 10, 10], source: COMMON, note: 'Someone still clears plates and refills drinks. 10% is the usual figure.' },
    { id: 'foodtruck', name: 'Food truck', aliases: ['truck', 'street food'], verdict: 'optional', pct: [0, 10, 0], source: COMMON, note: 'Optional, like other counter service.' },
    { id: 'icecream', name: 'Ice cream shop', aliases: ['frozen yogurt', 'gelato', 'froyo'], verdict: 'optional', flat: [0, 1, 1], unit: 'per order', qtyLabel: 'Orders', source: COMMON, note: 'Tip jar change is fine. Not expected.' },
    { id: 'catering', name: 'Catering staff', aliases: ['caterer', 'event staff', 'banquet'], verdict: 'expected', pct: [15, 20, 18], source: COMMON, note: 'Read the contract first. Many caterers already add a service charge, which is not always passed to staff.' },
    { id: 'autograt', name: 'Large party with auto-gratuity', aliases: ['auto gratuity', 'service charge', 'gratuity included', 'party of 6'], verdict: 'included', pct: [0, 0, 0], source: COMMON, note: 'The tip is already on the bill. Add more only if service stood out.' },
    { id: 'sommelier', name: 'Sommelier', aliases: ['wine', 'wine steward'], verdict: 'optional', pct: [10, 15, 10], source: COMMON, note: 'Applies to the wine portion. Only when a sommelier actively helped choose.' },
  ]),
  ...cat('Delivery', [
    { id: 'delivery', name: 'Food delivery app', aliases: ['doordash', 'uber eats', 'grubhub', 'delivery driver', 'delivery'], verdict: 'expected', pct: [10, 20, 15], source: EPI, pew: 'delivery', bankrate: 'delivery', note: 'Emily Post lists 10% to 15%. Add more for bad weather, long distances, or big orders. Many people use $3 to $5 as a floor on small orders.' },
    { id: 'pizza', name: 'Pizza delivery', aliases: ['dominos', 'papa johns', 'pizza'], verdict: 'expected', pct: [10, 20, 15], source: COMMON, note: 'A "delivery fee" usually goes to the store, not the driver.' },
    { id: 'grocery', name: 'Grocery delivery', aliases: ['instacart', 'shipt', 'walmart delivery', 'groceries'], verdict: 'expected', pct: [10, 15, 10], source: COMMON, note: 'Shoppers pick and carry everything, so tip like food delivery.' },
    { id: 'mail', name: 'Mail carrier (USPS)', aliases: ['mailman', 'postal', 'usps', 'postman'], verdict: 'not', pct: [0, 0, 0], source: 'USPS rule', note: 'Carriers cannot accept cash. A holiday gift worth $20 or less is allowed.' },
    { id: 'package', name: 'UPS / FedEx / Amazon driver', aliases: ['ups', 'fedex', 'amazon', 'package', 'parcel'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected. Some companies limit what drivers can accept. A cold drink or small holiday gift is a common thank you.' },
    { id: 'furniture', name: 'Furniture / appliance delivery', aliases: ['appliance', 'couch delivery', 'mattress'], verdict: 'optional', flat: [10, 20, 10], unit: 'per person', qtyLabel: 'Crew members', source: COMMON, note: 'Customary when they carry heavy items up stairs or install something.' },
    { id: 'movers', name: 'Movers', aliases: ['moving company', 'moving crew', 'two men and a truck'], verdict: 'expected', flat: [4, 8, 5], unit: 'per mover, per hour', qtyLabel: 'Mover-hours', source: COMMON, note: 'Hand it to each mover directly, or to the crew lead if they will split it. Cold water and snacks are appreciated too.' },
  ]),
  ...cat('Travel', [
    { id: 'housekeeping', name: 'Hotel housekeeping', aliases: ['maid', 'hotel maid', 'room cleaning', 'hotel'], verdict: 'expected', flat: [2, 5, 5], unit: 'per night', qtyLabel: 'Nights', source: EPI, bankrate: 'housekeeping', note: 'Leave it daily with a note marked for housekeeping, since staff can change during your stay. No tip for days you skip service.' },
    { id: 'bellhop', name: 'Bellhop / doorman', aliases: ['bellman', 'porter', 'luggage', 'bags', 'doorman'], verdict: 'expected', flat: [1, 4, 2], unit: 'per bag', qtyLabel: 'Bags', source: EPI, note: 'Emily Post lists $1 to $4. AHLA has suggested up to $5 per bag for heavy luggage.' },
    { id: 'valet', name: 'Valet parking', aliases: ['valet', 'parking attendant'], verdict: 'expected', flat: [2, 5, 3], unit: 'per retrieval', qtyLabel: 'Retrievals', source: EPI, note: 'Tip when the car comes back to you.' },
    { id: 'concierge', name: 'Hotel concierge', aliases: ['concierge', 'reservations'], verdict: 'optional', flat: [5, 10, 5], unit: 'per request', qtyLabel: 'Requests', source: EPI, note: 'No tip for directions or questions. Tip when they book a table or land tickets.' },
    { id: 'roomservice', name: 'Room service', aliases: ['in room dining'], verdict: 'expected', pct: [15, 20, 15], source: AHLA, note: 'Check the slip first. Many hotels already add a gratuity.' },
    { id: 'taxi', name: 'Taxi', aliases: ['cab', 'cabbie', 'taxi driver'], verdict: 'expected', pct: [15, 20, 15], source: EPI, pew: 'rideshare', note: 'Emily Post adds $2 for the first bag and $1 for each additional bag the driver handles.' },
    { id: 'rideshare', name: 'Uber / Lyft driver', aliases: ['uber', 'lyft', 'rideshare', 'ride share'], verdict: 'expected', pct: [15, 20, 15], source: EPI, pew: 'rideshare', note: 'You can tip in the app after the ride.' },
    { id: 'skycap', name: 'Airport skycap', aliases: ['curbside check in', 'airport porter'], verdict: 'expected', flat: [1, 2, 2], unit: 'per bag', qtyLabel: 'Bags', source: COMMON, note: 'Separate from any bag fee the airline charges.' },
    { id: 'shuttle', name: 'Hotel / airport shuttle driver', aliases: ['shuttle'], verdict: 'optional', flat: [1, 2, 2], unit: 'per bag', qtyLabel: 'Bags', source: COMMON, note: 'When they load and unload your luggage.' },
    { id: 'tourguide', name: 'Tour guide', aliases: ['walking tour', 'guide', 'excursion'], verdict: 'expected', pct: [10, 20, 15], source: COMMON, note: 'For free walking tours the tip is the price. $10 to $20 per person is common.' },
    { id: 'cruise', name: 'Cruise staff', aliases: ['cruise', 'cruise ship'], verdict: 'included', pct: [0, 0, 0], source: COMMON, note: 'Most lines add a daily gratuity to your account. Extra cash for standout service is optional.' },
    { id: 'frontdesk', name: 'Hotel front desk', aliases: ['reception', 'check in'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected.' },
    { id: 'airbnb', name: 'Airbnb / vacation rental host', aliases: ['vrbo', 'airbnb host', 'rental host'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected. Cleaning is already a line item.' },
    { id: 'flight', name: 'Flight attendant', aliases: ['airline', 'plane'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected, and some airlines do not allow it.' },
    { id: 'gas', name: 'Full-service gas attendant', aliases: ['gas station', 'pump'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected for pumping gas. A few dollars if they clean windows or check fluids.' },
    { id: 'carwash', name: 'Car wash (attended)', aliases: ['detailing', 'auto detail', 'hand wash'], verdict: 'expected', flat: [3, 5, 3], unit: 'per car', qtyLabel: 'Cars', source: COMMON, note: 'For full-service washes where people dry and wipe down the car. 10% to 20% for detailing.' },
    { id: 'tow', name: 'Tow truck driver', aliases: ['roadside assistance', 'towing'], verdict: 'optional', flat: [5, 20, 10], unit: 'per tow', qtyLabel: 'Tows', source: COMMON, note: 'Optional. More in bad weather or a tricky recovery.' },
  ]),
  ...cat('Personal care', [
    { id: 'haircut', name: 'Barber / haircut', aliases: ['barber', 'haircut', 'fade', 'trim'], verdict: 'expected', pct: [15, 20, 20], source: COMMON, pew: 'haircut', bankrate: 'haircut', note: 'Tip even if the barber owns the shop. That old rule has mostly faded.' },
    { id: 'stylist', name: 'Hair stylist / color', aliases: ['salon', 'hairdresser', 'highlights', 'blowout', 'color'], verdict: 'expected', pct: [15, 20, 20], source: COMMON, bankrate: 'haircut', note: 'Tip the assistant who shampoos you $3 to $5 separately.' },
    { id: 'nails', name: 'Nail salon', aliases: ['manicure', 'pedicure', 'nails', 'gel'], verdict: 'expected', pct: [15, 20, 20], source: COMMON, note: 'Leave cash if you can, so it goes straight to your tech.' },
    { id: 'massage', name: 'Massage therapist', aliases: ['massage', 'spa massage'], verdict: 'expected', pct: [15, 20, 20], source: EPI, note: 'Check whether the spa added a service charge. Medical or physical therapy massage is not tipped.' },
    { id: 'spa', name: 'Spa treatment', aliases: ['facial', 'spa', 'body wrap'], verdict: 'expected', pct: [15, 20, 18], source: COMMON, note: 'Resorts often add 18% to 20% automatically. Read the bill.' },
    { id: 'wax', name: 'Waxing / brows', aliases: ['eyebrow', 'threading', 'brow', 'lash'], verdict: 'expected', pct: [15, 20, 20], source: COMMON, note: 'Same as other salon services.' },
    { id: 'tattoo', name: 'Tattoo artist', aliases: ['tattoo', 'piercing'], verdict: 'expected', pct: [15, 25, 20], source: COMMON, note: 'Common for custom work. Piercers usually get $5 to $10 or 20%.' },
    { id: 'makeup', name: 'Makeup artist', aliases: ['mua', 'bridal makeup'], verdict: 'expected', pct: [15, 20, 20], source: COMMON, note: 'Check event contracts for an included gratuity.' },
    { id: 'groomer', name: 'Dog groomer', aliases: ['pet grooming', 'dog wash'], verdict: 'expected', pct: [15, 20, 15], source: COMMON, note: 'More for a difficult or matted pet.' },
    { id: 'trainer', name: 'Personal trainer', aliases: ['gym', 'fitness coach'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not per session. A holiday gift is common for regular clients.' },
  ]),
  ...cat('Home', [
    { id: 'repair', name: 'Plumber / electrician / repair', aliases: ['plumber', 'electrician', 'hvac', 'handyman', 'contractor', 'appliance repair'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected. Offering a drink or a good review is the usual thank you.' },
    { id: 'cleaner', name: 'House cleaner', aliases: ['maid service', 'cleaning lady', 'housekeeper'], verdict: 'optional', pct: [15, 20, 15], source: COMMON, note: "Tip for one-time or deep cleans. For a regular cleaner, a holiday tip of about one visit's pay is common." },
    { id: 'lawn', name: 'Lawn care crew', aliases: ['landscaper', 'yard', 'mowing', 'gardener'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not per visit. A holiday tip for a regular crew is a nice gesture.' },
    { id: 'assembly', name: 'Furniture assembly (TaskRabbit)', aliases: ['taskrabbit', 'ikea assembly', 'handy'], verdict: 'optional', pct: [10, 20, 15], source: COMMON, note: 'Optional. Tip in the app if the job ran long or got complicated.' },
    { id: 'babysitter', name: 'Babysitter', aliases: ['nanny', 'sitter', 'childcare'], verdict: 'optional', pct: [0, 0, 0], source: COMMON, note: 'Not expected on a normal night. Round up for late nights, extra kids, or holidays.' },
    { id: 'trash', name: 'Trash collectors', aliases: ['garbage', 'sanitation', 'recycling'], verdict: 'optional', flat: [10, 30, 20], unit: 'per person, yearly', qtyLabel: 'Collectors', source: COMMON, note: 'A once-a-year holiday thank you, if your town allows it.' },
    { id: 'installer', name: 'Cable / internet installer', aliases: ['comcast', 'xfinity', 'technician', 'install'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected, and many companies forbid it.' },
  ]),
  ...cat('Everyday', [
    { id: 'coat', name: 'Coat check', aliases: ['cloakroom'], verdict: 'expected', flat: [1, 2, 2], unit: 'per item', qtyLabel: 'Items', source: COMMON, note: 'Even when the check itself is free.' },
    { id: 'restroom', name: 'Restroom attendant', aliases: ['bathroom attendant'], verdict: 'optional', flat: [1, 2, 1], unit: 'per visit', qtyLabel: 'Visits', source: COMMON, note: 'Optional, more if they hand you a towel or supplies.' },
    { id: 'stadium', name: 'Stadium / concert vendor', aliases: ['concessions', 'beer vendor', 'arena'], verdict: 'optional', flat: [1, 2, 1], unit: 'per order', qtyLabel: 'Orders', source: COMMON, note: 'Optional for seat-side vendors.' },
    { id: 'retail', name: 'Retail checkout / self-checkout', aliases: ['store', 'cashier', 'self checkout', 'kiosk', 'shop'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected, even when the screen asks.' },
    { id: 'doctor', name: 'Doctor / nurse / medical', aliases: ['dentist', 'hospital', 'nurse', 'clinic'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'Not expected, and often not allowed.' },
    { id: 'teacher', name: 'Teacher', aliases: ['school', 'daycare teacher'], verdict: 'not', pct: [0, 0, 0], source: COMMON, note: 'No cash. Many schools set gift limits. A card or small gift at the holidays is typical.' },
    { id: 'musician', name: 'Street performer / busker', aliases: ['musician', 'busker', 'performer'], verdict: 'optional', flat: [1, 5, 2], unit: 'per stop', qtyLabel: 'Stops', source: COMMON, note: 'Optional. Tip if you stopped to enjoy it.' },
    { id: 'caddie', name: 'Golf caddie', aliases: ['golf', 'caddy'], verdict: 'expected', pct: [0, 0, 0], source: COMMON, note: "Usually a flat amount per bag. Ask the pro shop for the course's going rate." },
  ]),
];

export const byId = (id: string) => SERVICES.find((s) => s.id === id);
