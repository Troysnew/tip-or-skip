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
  /** Page the guidance comes from. Services without one still need an editorial source check. */
  sourceUrl?: string;
  pew?: PewKey;
  bankrate?: BankrateKey;
  /** Show the Pew restaurant tip-amount distribution. */
  amountStats?: boolean;
  /**
   * Extra to suggest in bad weather (rain, snow, extreme heat), in the service's own units:
   * percentage points for pct services, dollars per unit for flat ones. Our suggestion: guides
   * say to add more in bad weather but don't give a number.
   */
  weatherBump?: number;
  /** The source backs the verdict but gives no amounts; the amounts are common practice. */
  amountsCommon?: boolean;
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
const EPI_URL = 'https://emilypost.com/advice/general-tipping-guide';
const EPI_HOLIDAY_URL = 'https://emilypost.com/advice/holiday-tipping-guide';
const EPI_FINER_URL = 'https://emilypost.com/advice/finer-points-of-tipping';
const COMMON = 'Common US guidance';
const AHLA = 'AHLA';

type Row = Omit<Service, 'category'>;
const cat = (category: Category, rows: Row[]): Service[] => rows.map((r) => ({ ...r, category }));

export const SERVICES: Service[] = [
  ...cat('Food & drink', [
    { id: 'restaurant', name: 'Sit-down restaurant', aliases: ['waiter', 'waitress', 'server', 'dinner', 'restaurant', 'diner'], verdict: 'expected', pct: [15, 20, 18], source: EPI, pew: 'restaurant', bankrate: 'restaurant', amountStats: true, sourceUrl: EPI_URL, note: 'Tip on the pre-tax amount. Check the bill for an automatic gratuity or service charge first, especially with large parties.' },
    { id: 'bar', name: 'Bartender', aliases: ['bar', 'drinks', 'beer', 'cocktail', 'pub'], verdict: 'expected', flat: [1, 2, 1], unit: 'per drink', qtyLabel: 'Drinks', source: EPI, pew: 'bar', sourceUrl: EPI_URL, note: '$1 to $2 per drink, or 15% to 20% if you run a tab.' },
    { id: 'coffee', name: 'Coffee shop / barista', aliases: ['barista', 'starbucks', 'latte', 'cafe', 'coffee'], verdict: 'optional', flat: [0, 1, 0], unit: 'per drink', qtyLabel: 'Drinks', source: EPI, pew: 'coffee', bankrate: 'coffee', sourceUrl: EPI_URL, note: 'No obligation, and a tip screen does not make it required. Emily Post suggests tipping now and then if they go the extra mile or you are a regular.' },
    { id: 'fastcasual', name: 'Fast casual / order at counter', aliases: ['chipotle', 'counter', 'fast casual', 'panera', 'sandwich shop'], verdict: 'optional', pct: [0, 10, 0], source: EPI, pew: 'fastcasual', sourceUrl: EPI_URL, note: 'No server, so no tip is expected. Some people tip 10% when staff bring food to the table or handle a big order.' },
    { id: 'fastfood', name: 'Fast food drive-thru', aliases: ['mcdonalds', 'drive thru', 'drive-thru', 'burger'], verdict: 'not', pct: [0, 0, 0], source: 'U.S. News & World Report', sourceUrl: 'https://wtop.com/news/2026/08/when-its-ok-to-say-no-to-automatic-tip-requests/', note: 'A tip is not expected for a routine drive-thru order. Extra service or a large, complicated order can be acknowledged separately.' },
    { id: 'takeout', name: 'Takeout pickup', aliases: ['to go', 'to-go', 'carryout', 'pickup', 'take out'], verdict: 'optional', pct: [0, 10, 0], source: EPI, bankrate: 'takeout', sourceUrl: EPI_URL, note: 'No obligation. Emily Post suggests 10% for curbside service or a large, complicated order.' },
    { id: 'buffet', name: 'Buffet', aliases: ['all you can eat'], verdict: 'expected', pct: [10, 10, 10], source: EPI, sourceUrl: EPI_URL, note: 'Someone still clears plates and refills drinks. Emily Post says 10%, figured before tax.' },
    { id: 'foodtruck', name: 'Food truck', aliases: ['truck', 'street food'], verdict: 'optional', pct: [0, 10, 0], source: EPI, sourceUrl: EPI_URL, note: 'No obligation, like other tip-jar counter service. Tip now and then if they go the extra mile.' },
    { id: 'icecream', name: 'Ice cream shop', aliases: ['frozen yogurt', 'gelato', 'froyo'], verdict: 'optional', flat: [0, 1, 1], unit: 'per order', qtyLabel: 'Orders', source: EPI, sourceUrl: EPI_URL, note: 'No obligation. Tip-jar change now and then is a nice gesture.' },
    { id: 'catering', name: 'Catering staff', aliases: ['caterer', 'event staff', 'banquet'], verdict: 'expected', pct: [15, 20, 18], source: 'The Knot', sourceUrl: 'https://www.theknot.com/content/wedding-vendor-tipping-cheat-sheet', note: 'For staffed wedding catering, calculate the tip on food and drinks. Check your contract and ask whether any service charge covers staff gratuities.' },
    { id: 'autograt', name: 'Large party with auto-gratuity', aliases: ['auto gratuity', 'service charge', 'gratuity included', 'party of 6'], verdict: 'included', pct: [0, 0, 0], source: 'Toast', sourceUrl: 'https://pos.toasttab.com/blog/on-the-line/gratuity-vs-tip', note: 'An automatic gratuity is already on the bill. Any additional tip is your choice.' },
    { id: 'sommelier', name: 'Sommelier', aliases: ['wine', 'wine steward'], verdict: 'optional', pct: [10, 15, 10], source: 'Common practice', note: 'Applies to the wine portion. Only when a sommelier actively helped choose.' },
  ]),
  ...cat('Delivery', [
    { id: 'delivery', weatherBump: 5, name: 'Food delivery app', aliases: ['doordash', 'uber eats', 'grubhub', 'delivery driver', 'delivery'], verdict: 'expected', pct: [10, 15, 15], source: EPI, pew: 'delivery', bankrate: 'delivery', sourceUrl: EPI_URL, note: 'Emily Post says 10% to 15% of the bill. Add more for bad weather, long distances, or big orders.' },
    { id: 'pizza', weatherBump: 2, name: 'Pizza delivery', aliases: ['dominos', 'papa johns', 'pizza'], verdict: 'expected', flat: [2, 5, 3], unit: 'per delivery', qtyLabel: 'Deliveries', source: EPI, sourceUrl: EPI_URL, note: 'Emily Post says $2 to $5, depending on the size of the order and how hard the delivery is. A "delivery fee" usually goes to the store, not the driver.' },
    { id: 'grocery', weatherBump: 5, name: 'Grocery delivery', aliases: ['instacart', 'shipt', 'walmart delivery', 'groceries'], verdict: 'expected', pct: [10, 10, 10], source: 'Emily Post Institute', sourceUrl: 'https://emilypost.substack.com/p/etiquette-today-everyday-tipping', note: 'Around 10% of the order, or $5 or more per order.' },
    { id: 'mail', name: 'Mail carrier (USPS)', aliases: ['mailman', 'postal', 'usps', 'postman'], verdict: 'not', pct: [0, 0, 0], source: 'Emily Post Institute (USPS rules)', sourceUrl: EPI_HOLIDAY_URL, note: 'Carriers cannot accept cash, checks, or gift cards. A small holiday gift worth $20 or less, or snacks and drinks, is allowed.' },
    { id: 'package', name: 'UPS / FedEx / Amazon driver', aliases: ['ups', 'fedex', 'amazon', 'package', 'parcel'], verdict: 'not', pct: [0, 0, 0], source: EPI, sourceUrl: EPI_HOLIDAY_URL, note: 'Not expected per delivery. Emily Post suggests a holiday gift around $20, only if you get regular deliveries, and no cash.' },
    { id: 'furniture', weatherBump: 5, name: 'Furniture / appliance delivery', aliases: ['appliance', 'couch delivery', 'mattress'], verdict: 'optional', flat: [10, 20, 10], unit: 'per person', qtyLabel: 'Crew members', source: EPI, sourceUrl: EPI_FINER_URL, note: 'Customs vary by store. Emily Post suggests calling the store to ask whether tipping is customary. A tip is most common when they carry heavy items up stairs or install something.' },
    { id: 'movers', weatherBump: 2, name: 'Movers', aliases: ['moving company', 'moving crew', 'two men and a truck'], verdict: 'expected', flat: [5, 10, 5], unit: 'per mover, per hour', qtyLabel: 'Mover-hours', source: 'U-Haul Moving Help', sourceUrl: 'https://www.uhaul.com/Tips/Moving-Help/How-Much-Should-I-Tip-My-Mover-24671/', note: 'For an average move, $5 to $10 per mover per hour is a published guideline. Adjust for the difficulty and service provided.' },
  ]),
  ...cat('Travel', [
    { id: 'housekeeping', name: 'Hotel housekeeping', aliases: ['maid', 'hotel maid', 'room cleaning', 'hotel'], verdict: 'expected', flat: [2, 5, 5], unit: 'per night', qtyLabel: 'Nights', source: EPI, bankrate: 'housekeeping', sourceUrl: EPI_URL, note: 'Leave it daily with a note marked for housekeeping, since staff can change during your stay. No tip for days you skip service.' },
    { id: 'bellhop', name: 'Bellhop / doorman', aliases: ['bellman', 'porter', 'luggage', 'bags', 'doorman'], verdict: 'expected', flat: [1, 4, 2], unit: 'per bag', qtyLabel: 'Bags', source: EPI, sourceUrl: EPI_URL, note: 'Bellhop: $2 for the first bag and $1 for each one after. Doorman: $1 to $4 for carrying luggage.' },
    { id: 'valet', weatherBump: 2, name: 'Valet parking', aliases: ['valet', 'parking attendant'], verdict: 'expected', flat: [2, 5, 3], unit: 'per retrieval', qtyLabel: 'Retrievals', source: EPI, sourceUrl: EPI_URL, note: 'Tip when the car comes back to you.' },
    { id: 'concierge', name: 'Hotel concierge', aliases: ['concierge', 'reservations'], verdict: 'optional', flat: [5, 10, 5], unit: 'per request', qtyLabel: 'Requests', source: EPI, sourceUrl: EPI_URL, note: 'No tip for directions or questions. Tip when they book a table or land tickets.' },
    { id: 'roomservice', name: 'Room service', aliases: ['in room dining'], verdict: 'expected', pct: [15, 20, 15], source: 'Emily Post Institute', sourceUrl: 'https://emilypost.substack.com/p/etiquette-today-travel-tipping', note: 'Calculate the tip before room-service fees and taxes. Check whether a gratuity is already included.' },
    { id: 'taxi', name: 'Taxi', aliases: ['cab', 'cabbie', 'taxi driver'], verdict: 'expected', pct: [15, 20, 15], source: EPI, pew: 'rideshare', sourceUrl: EPI_URL, note: 'Emily Post sets a $1 minimum, plus $2 for the first bag and $1 for each additional bag the driver handles.' },
    { id: 'rideshare', name: 'Uber / Lyft driver', aliases: ['uber', 'lyft', 'rideshare', 'ride share'], verdict: 'expected', pct: [15, 20, 15], source: 'Emily Post Institute (taxi guidance)', pew: 'rideshare', sourceUrl: EPI_URL, note: 'Emily Post gives this range for taxis, and rideshare is usually tipped the same way. You can tip in the app after the ride.' },
    { id: 'skycap', weatherBump: 1, name: 'Airport skycap', aliases: ['curbside check in', 'airport porter'], verdict: 'expected', flat: [1, 2, 2], unit: 'per bag', qtyLabel: 'Bags', source: EPI, sourceUrl: EPI_URL, note: 'Emily Post says $2 for the first bag and $1 for each one after. Separate from any bag fee the airline charges.' },
    { id: 'shuttle', name: 'Hotel / airport shuttle driver', aliases: ['shuttle'], verdict: 'expected', flat: [1, 2, 2], unit: 'per bag', qtyLabel: 'Bags', source: 'Emily Post Institute', sourceUrl: 'https://emilypost.substack.com/p/etiquette-today-travel-tipping', note: 'Tip $1 to $2 per bag when the driver helps with your luggage. Without help with bags, it is your call.' },
    { id: 'tourguide', name: 'Tour guide', aliases: ['walking tour', 'guide', 'excursion'], verdict: 'expected', flat: [5, 50, 15], unit: 'per short tour', qtyLabel: 'Tours', source: 'Emily Post Institute', sourceUrl: 'https://emilypost.substack.com/p/etiquette-today-travel-tipping', note: 'For a short tour, $5 to $50, more for a group or a great guide. Multi-day tours run $50 to $500.' },
    { id: 'cruise', name: 'Cruise staff', aliases: ['cruise', 'cruise ship'], verdict: 'included', pct: [0, 0, 0], source: 'Royal Caribbean', sourceUrl: 'https://www.royalcaribbean.com/faq/questions/onboard-service-gratuity-expense', note: 'Many cruise lines add daily gratuities to your onboard account (Royal Caribbean does), and you can usually adjust them. Check your line\'s policy.' },
    { id: 'frontdesk', name: 'Hotel front desk', aliases: ['reception', 'check in'], verdict: 'not', pct: [0, 0, 0], source: 'Protocol School of Texas', sourceUrl: 'https://protocolschooloftexas.com/2017/06/22/travel-tipping-etiquette/', note: 'Routine check-in does not need a tip. Concierge-style assistance or exceptional help can be tipped separately.' },
    { id: 'airbnb', name: 'Airbnb / vacation rental host', aliases: ['vrbo', 'airbnb host', 'rental host'], verdict: 'not', pct: [0, 0, 0], source: 'The Washington Post', sourceUrl: 'https://www.washingtonpost.com/travel/tips/airbnb-tip-cleaning-fee/', note: 'A gratuity is not required at a vacation rental.' },
    { id: 'flight', name: 'Flight attendant', aliases: ['airline', 'plane'], verdict: 'not', pct: [0, 0, 0], source: 'Travel + Leisure', sourceUrl: 'https://www.travelandleisure.com/should-you-tip-your-flight-attendant-11948624', note: 'Tips are not expected. Check airline policy.' },
    { id: 'gas', name: 'Full-service gas attendant', aliases: ['gas station', 'pump'], verdict: 'not', pct: [0, 0, 0], source: 'The Boston Globe', sourceUrl: 'https://www.bostonglobe.com/magazine/2014/08/02/everyday-advice-you-tip-full-service-gas-stations/5HcsYk75Zgf13HrdbURLFN/story.html', note: 'Usually not expected; equally priced self-service and full-service options are an exception.' },
    { id: 'carwash', name: 'Car wash (attended)', aliases: ['detailing', 'auto detail', 'hand wash'], verdict: 'expected', flat: [3, 5, 3], unit: 'per car', qtyLabel: 'Cars', source: 'Common practice', note: 'For full-service washes where people dry and wipe down the car. 10% to 20% for detailing.' },
    { id: 'tow', weatherBump: 5, name: 'Tow truck driver', aliases: ['roadside assistance', 'towing'], verdict: 'optional', flat: [5, 20, 10], unit: 'per tow', qtyLabel: 'Tows', source: 'AAA Central Penn', sourceUrl: 'https://centralpenn.aaa.com/automotive/roadside-assistance/towing-service/', amountsCommon: true, note: 'Optional. A thank-you is kind when a driver comes out in bad weather, late at night, or handles a tricky recovery.' },
  ]),
  ...cat('Personal care', [
    { id: 'haircut', name: 'Barber / haircut', aliases: ['barber', 'haircut', 'fade', 'trim'], verdict: 'expected', pct: [15, 20, 20], source: EPI, pew: 'haircut', bankrate: 'haircut', sourceUrl: EPI_URL, note: 'Tip even if the barber owns the shop. That old rule has mostly faded.' },
    { id: 'stylist', name: 'Hair stylist / color', aliases: ['salon', 'hairdresser', 'highlights', 'blowout', 'color'], verdict: 'expected', pct: [15, 20, 20], source: EPI, bankrate: 'haircut', sourceUrl: EPI_URL, note: 'Tip the assistant who shampoos you $3 to $5 separately.' },
    { id: 'nails', name: 'Nail salon', aliases: ['manicure', 'pedicure', 'nails', 'gel'], verdict: 'expected', pct: [15, 20, 20], source: EPI, sourceUrl: EPI_URL, note: 'Leave cash if you can, so it goes straight to your tech.' },
    { id: 'massage', name: 'Massage therapist', aliases: ['massage', 'spa massage'], verdict: 'expected', pct: [15, 20, 20], source: EPI, sourceUrl: EPI_URL, note: 'Check whether the spa added a service charge. Medical or physical therapy massage is not tipped.' },
    { id: 'spa', name: 'Spa treatment', aliases: ['facial', 'spa', 'body wrap'], verdict: 'expected', pct: [15, 20, 18], source: EPI, sourceUrl: EPI_URL, note: 'Resorts often add 18% to 20% automatically. Read the bill.' },
    { id: 'wax', name: 'Waxing / brows', aliases: ['eyebrow', 'threading', 'brow', 'lash'], verdict: 'expected', pct: [15, 20, 20], source: EPI, sourceUrl: EPI_URL, note: 'Same as other salon services.' },
    { id: 'tattoo', name: 'Tattoo artist', aliases: ['tattoo', 'piercing'], verdict: 'expected', pct: [15, 25, 20], source: 'InStyle', sourceUrl: 'https://www.instyle.com/tattoo-artist-tipping-guide-7507041', note: 'For a tattoo you are happy with, 15% to 25% is a published range. The amount can reflect your experience and satisfaction.' },
    { id: 'makeup', name: 'Makeup artist', aliases: ['mua', 'bridal makeup'], verdict: 'expected', pct: [15, 20, 20], source: 'Brides', sourceUrl: 'https://www.brides.com/how-much-to-tip-hair-stylist-makeup-artist-5191246', note: 'For wedding makeup, tip on the artist\'s service fee, excluding products and travel costs. Check the contract for gratuity already included.' },
    { id: 'groomer', name: 'Dog groomer', aliases: ['pet grooming', 'dog wash'], verdict: 'expected', pct: [15, 20, 15], source: 'Scenthound', sourceUrl: 'https://www.scenthound.com/dogblog/how-much-do-you-tip-a-dog-groomer', note: '15% is a good tip for a job well done, and 20% for excellent service.' },
    { id: 'trainer', name: 'Personal trainer', aliases: ['gym', 'fitness coach'], verdict: 'expected', pct: [15, 20, 15], source: 'Emily Post Institute', sourceUrl: 'https://emilypost.substack.com/p/etiquette-today-everyday-tipping', note: 'Tip 15% to 20% when you pay for a session. With a regular trainer on a set rate, many people give a year-end gift instead.' },
  ]),
  ...cat('Home', [
    { id: 'repair', name: 'Plumber / electrician / repair', aliases: ['plumber', 'electrician', 'hvac', 'handyman', 'contractor', 'appliance repair'], verdict: 'not', pct: [0, 0, 0], source: 'TheStreet', sourceUrl: 'https://www.thestreet.com/personal-finance/how-much-should-i-tip-an-essential-guide-to-giving-out-gratuities-13067533', note: 'A tip is generally not expected for routine skilled home repairs.' },
    { id: 'cleaner', name: 'House cleaner', aliases: ['maid service', 'cleaning lady', 'housekeeper'], verdict: 'optional', pct: [15, 20, 15], source: 'Southern Living', sourceUrl: 'https://www.southernliving.com/should-you-tip-your-house-cleaner-7852315', note: 'Tipping is optional; 15% to 20% is a published range. For recurring cleaners, a periodic or holiday bonus can replace a tip at every visit.' },
    { id: 'lawn', name: 'Lawn care crew', aliases: ['landscaper', 'yard', 'mowing', 'gardener'], verdict: 'not', pct: [0, 0, 0], source: 'Emily Post Institute', sourceUrl: 'https://emilypost.substack.com/p/etiquette-today-everyday-tipping', note: 'A tip is generally not expected with every scheduled visit. A holiday thank-you for a regular crew is optional.' },
    { id: 'assembly', name: 'Furniture assembly (TaskRabbit)', aliases: ['taskrabbit', 'ikea assembly', 'handy'], verdict: 'optional', pct: [10, 20, 15], source: 'Taskrabbit', sourceUrl: 'https://www.taskrabbit.com/cost-guides/assemble-furniture', note: 'Tipping is optional. Taskrabbit identifies 10% to 20% as customary for furniture assembly.' },
    { id: 'babysitter', name: 'Babysitter', aliases: ['nanny', 'sitter', 'childcare'], verdict: 'optional', pct: [0, 0, 0], source: 'Care.com', sourceUrl: 'https://www.care.com/c/should-you-tip-a-babysitter/', note: 'A tip is optional for routine babysitting. You can add extra for unusual circumstances or exceptional help.' },
    { id: 'trash', name: 'Trash collectors', aliases: ['garbage', 'sanitation', 'recycling'], verdict: 'optional', flat: [10, 30, 20], unit: 'per collector, yearly', qtyLabel: 'Collectors', source: 'Emily Post Institute', sourceUrl: 'https://emilypost.com/advice/holiday-tipping-guide', note: 'A holiday tip is optional. Check company policy and local rules before giving cash.' },
    { id: 'installer', name: 'Cable / internet installer', aliases: ['comcast', 'xfinity', 'technician', 'install'], verdict: 'not', pct: [0, 0, 0], source: 'TheStreet', sourceUrl: 'https://www.thestreet.com/personal-finance/how-much-should-i-tip-an-essential-guide-to-giving-out-gratuities-13067533', note: 'A tip is not necessary for routine cable installation. Check the provider\'s policy if you want to offer one.' },
  ]),
  ...cat('Everyday', [
    { id: 'coat', name: 'Coat check', aliases: ['cloakroom'], verdict: 'expected', flat: [1, 2, 2], unit: 'per coat', qtyLabel: 'Items', source: 'Better Homes & Gardens', sourceUrl: 'https://www.bhg.com/who-to-tip-etiquette-8724668', note: 'Tip when your coat is returned.' },
    { id: 'restroom', name: 'Restroom attendant', aliases: ['bathroom attendant'], verdict: 'optional', flat: [1, 3, 1], unit: 'per visit', qtyLabel: 'Visits', source: EPI, sourceUrl: EPI_URL, note: 'Emily Post says 50 cents to $3, depending on the level of service.' },
    { id: 'stadium', name: 'Stadium / concert vendor', aliases: ['concessions', 'beer vendor', 'arena'], verdict: 'optional', flat: [1, 2, 1], unit: 'per order', qtyLabel: 'Orders', source: 'Common practice', note: 'Optional for seat-side vendors.' },
    { id: 'retail', name: 'Retail checkout / self-checkout', aliases: ['store', 'cashier', 'self checkout', 'kiosk', 'shop'], verdict: 'not', pct: [0, 0, 0], source: 'U.S. News & World Report', sourceUrl: 'https://wtop.com/news/2026/08/when-its-ok-to-say-no-to-automatic-tip-requests/', note: 'A routine retail purchase or self-checkout does not require a tip, even if a screen asks.' },
    { id: 'doctor', name: 'Doctor / nurse / medical', aliases: ['dentist', 'hospital', 'nurse', 'clinic'], verdict: 'not', pct: [0, 0, 0], source: 'Emily Post Institute', sourceUrl: 'https://emilypost.com/advice/holiday-tips-vs.-holiday-gifts', note: 'Do not offer a cash tip. Check the institution\'s policy before giving a gift.' },
    { id: 'teacher', name: 'Teacher', aliases: ['school', 'daycare teacher'], verdict: 'not', pct: [0, 0, 0], source: 'Emily Post Institute', sourceUrl: 'https://emilypost.com/advice/holiday-tips-vs.-holiday-gifts', note: 'Skip cash tips. Check school rules before giving a small gift or gift card.' },
    { id: 'musician', name: 'Street performer / busker', aliases: ['musician', 'busker', 'performer'], verdict: 'optional', flat: [1, 5, 2], unit: 'per stop', qtyLabel: 'Stops', source: 'Better Homes & Gardens', sourceUrl: 'https://www.bhg.com/who-to-tip-etiquette-8724668', note: 'A tip is welcome if you stop to enjoy a performance.' },
    { id: 'caddie', name: 'Golf caddie', aliases: ['golf', 'caddy'], verdict: 'expected', pct: [20, 20, 20], source: 'GOLF.com', sourceUrl: 'https://golf.com/instruction/proper-amount-to-tip-caddie/', note: 'About 20% of the caddie fee for a job well done, more for exceptional service. Check the club\'s own recommendation first.' },
  ]),
];

export const byId = (id: string) => SERVICES.find((s) => s.id === id);
