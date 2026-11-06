/** Story chapters that trigger at the start of specific days. Each choice has lasting consequences. */
export interface StoryFx {
  gems?: number;
  charm?: number;
  rep?: number;          // reputation (affects ending)
  flag?: string;         // story flag remembered forever
  kenMorale?: [number, number]; // [ken index, delta]
  allMorale?: number;
  rosanTrust?: number;
  scandal?: number;
  heartbroken?: boolean;
  item?: boolean;        // grant random secret item
}
export interface StoryOpt { id: string; label: string; sub: string; result: string[]; fx: StoryFx; requires?: string; tone: 'good' | 'bad' | 'neutral' }
export interface StoryEvent { day: number; title: string; emoji: string; body: string[]; opts: StoryOpt[]; requires?: string }

export const STORY: StoryEvent[] = [
  {
    day: 1, title: 'Chapter 1 · A New Season', emoji: '📖',
    body: ['Welcome to Dreamtown, Barbie! The Style Season begins today — 21 days to find love and become a legend.', 'Rumour says a mysterious genius, Rosan Sawad, watches the city from the Penthouse Tower... and meets only the truly flawless.', 'How do you want to start your story?'],
    opts: [
      { id: 'heart', label: '💖 "I\'m here to find true love."', sub: 'Kens start warmer (+0.5♥ to Clueless Ken)', result: ['A romantic at heart! Dreamtown\'s Kens can sense it.', 'Clueless Ken already wrote your name on his hand.'], fx: { kenMorale: [0, 1], flag: 'romantic' }, tone: 'good' },
      { id: 'fame', label: '⭐ "I\'m here to be a STAR."', sub: '+200 💎 · +1 Reputation', result: ['Ambition looks good on you. The paparazzi are already following.', '+200 💎 sponsorship deal!'], fx: { gems: 200, rep: 1, flag: 'ambitious' }, tone: 'good' },
      { id: 'mystery', label: '🔍 "I\'m here for Rosan Sawad."', sub: 'Rosan notices you early (+1 Trust)', result: ['Somewhere high above, a screen flickers on with your photo.', 'ROSAN (to himself): "Interesting. Very interesting."'], fx: { rosanTrust: 1, flag: 'seeker' }, tone: 'neutral' },
    ],
  },
  {
    day: 3, title: 'Chapter 2 · The Gossip Column', emoji: '📰',
    body: ['The Dreamtown Daily prints a nasty rumour: "Barbie only dates Kens for their gems!"', 'Your phone explodes with messages. How do you respond?'],
    opts: [
      { id: 'truth', label: '🎤 Give an honest interview', sub: '+2 Reputation · all Kens +0.5♥', result: ['You speak from the heart on live TV. The city falls in love with you all over again.', 'The Kens are proud of you!'], fx: { rep: 2, allMorale: 0.5, flag: 'honest' }, tone: 'good' },
      { id: 'revenge', label: '😈 Leak gossip about the reporter', sub: '+400 💎 · -2 Reputation · risky', result: ['The reporter is humiliated... but people whisper that you play dirty.', '+400 💎 from a tabloid deal.'], fx: { gems: 400, rep: -2, flag: 'ruthless' }, tone: 'bad' },
      { id: 'ignore', label: '🙈 Ignore it and go shopping', sub: 'Nothing changes', result: ['You buy three pairs of shoes. The rumour fades... slowly.'], fx: {}, tone: 'neutral' },
    ],
  },
  {
    day: 5, title: 'Chapter 3 · A Rainy Doorstep', emoji: '🐶',
    body: ['On your way out, you find a soaked, shivering puppy on the mansion steps.', 'You\'re running late for your dates...'],
    opts: [
      { id: 'adopt', label: '🐶 Adopt the puppy', sub: '+1 Rep · Kens love kindness (+0.5♥ all) · -1 hour', result: ['You name him Sparkles. He immediately chews a stiletto.', 'Every Ken in town hears about it. Hearts melt.'], fx: { rep: 1, allMorale: 0.5, flag: 'puppy' }, tone: 'good' },
      { id: 'shelter', label: '🏠 Drop him at the shelter', sub: '+100 💎 reward', result: ['The shelter thanks you with a small reward. Sparkles finds a loving family.'], fx: { gems: 100 }, tone: 'neutral' },
      { id: 'leave', label: '🏃 Leave him — no time!', sub: '-2 Reputation', result: ['A neighbour films you walking past. It goes viral. Not in a good way.'], fx: { rep: -2, flag: 'cold' }, tone: 'bad' },
    ],
  },
  {
    day: 7, title: 'Chapter 4 · The Rival Arrives', emoji: '👠',
    body: ['A glamorous newcomer, Raquelle, struts into Dreamtown — and she\'s flirting with YOUR Kens.', 'She challenges you to a public Style-Off at the Glamour Mall.'],
    opts: [
      { id: 'duel', label: '💅 Accept the Style-Off', sub: '60%: +800 💎 & +2 Rep · 40%: -1 Rep', result: [], fx: { flag: 'dueled' }, tone: 'neutral' },
      { id: 'friend', label: '🤝 Offer friendship instead', sub: '+1 Rep · secret item gift', result: ['Raquelle blinks. "Nobody\'s ever... okay. Friends." She gifts you a rare piece from her closet!'], fx: { rep: 1, item: true, flag: 'raquelle_friend' }, tone: 'good' },
      { id: 'sabotage', label: '✂️ Sabotage her outfit', sub: '+1 Scandal · +500 💎', result: ['Her dress rips on the runway. Everyone saw you near it...', '📸 +1 Scandal!'], fx: { scandal: 1, gems: 500, flag: 'saboteur', rep: -1 }, tone: 'bad' },
    ],
  },
  {
    day: 10, title: 'Chapter 5 · The Charity Gala', emoji: '🎗️',
    body: ['Dreamtown hosts a charity gala for the children\'s hospital.', 'Rich guests are bidding big. What do you do?'],
    opts: [
      { id: 'donate', label: '💝 Donate 500 gems', sub: '-500 💎 · +3 Reputation · Rosan +1 Trust', result: ['The crowd gasps. The children send you a hand-drawn card.', 'Across the room, a man in a white suit raises his glass to you.'], fx: { gems: -500, rep: 3, rosanTrust: 1, flag: 'generous' }, tone: 'good' },
      { id: 'perform', label: '🎤 Sing on stage', sub: '+1 Rep · +2000 charm', result: ['Your voice is... enthusiastic. The crowd adores it anyway!'], fx: { rep: 1, charm: 2000 }, tone: 'good' },
      { id: 'skip', label: '🍾 Skip it for a party', sub: '-1 Rep · +300 💎', result: ['You have fun, but the photos of you partying during a charity night don\'t look great.'], fx: { rep: -1, gems: 300 }, tone: 'bad' },
    ],
  },
  {
    day: 13, title: 'Chapter 6 · The Billionaire\'s Offer', emoji: '💼',
    body: ['A sleek black car pulls up. Billionaire Ken\'s assistant hands you a contract:', '"10,000 gems to stay away from Rosan Sawad. Forever."'],
    opts: [
      { id: 'refuse', label: '✋ Tear up the contract', sub: 'Rosan +2 Trust · loyal heart', result: ['You rip it in half. The assistant drives off, shocked.', 'Somehow, Rosan finds out. He doesn\'t say anything — but the tower lights glow a little brighter tonight.'], fx: { rosanTrust: 2, flag: 'loyal', rep: 1 }, tone: 'good' },
      { id: 'take', label: '💰 Take the money', sub: '+10,000 💎 · Rosan -3 Trust', result: ['10,000 gems land in your account. You feel... rich. And a little hollow.', 'Rosan will remember this.'], fx: { gems: 10000, rosanTrust: -3, flag: 'sold_out' }, tone: 'bad' },
      { id: 'expose', label: '📢 Expose the bribe to the press', sub: '+2 Rep · Billionaire Ken -3♥', result: ['Headlines: "BILLIONAIRE TRIES TO BUY LOVE!" Dreamtown cheers for you.'], fx: { rep: 2, kenMorale: [26, -3], flag: 'whistleblower' }, tone: 'good' },
    ],
  },
  {
    day: 16, title: 'Chapter 7 · The Blackout', emoji: '🌑',
    body: ['A citywide blackout! Dreamtown goes dark. Somewhere, people are stuck in the subway.', 'Your phone has 12% battery.'],
    opts: [
      { id: 'help', label: '🔦 Help guide people out', sub: '+2 Rep · all Kens +1♥', result: ['You lead dozens of people to safety with your phone flashlight. A hero in heels!', 'Every Ken is talking about it.'], fx: { rep: 2, allMorale: 1, flag: 'hero' }, tone: 'good' },
      { id: 'rosan', label: '📞 Call Rosan', sub: 'Rosan +2 Trust · he restores the power', result: ['Rosan answers on the first ring. "Give me 4 minutes." The lights come back in 3.', 'ROSAN: "You called me first. I\'ll remember that."'], fx: { rosanTrust: 2 }, tone: 'good' },
      { id: 'hide', label: '🛏️ Hide under the covers', sub: 'Safe, but...', result: ['You wait it out. The morning news shows heroes helping. You weren\'t one of them.'], fx: { rep: -1 }, tone: 'neutral' },
    ],
  },
  {
    day: 19, title: 'Chapter 8 · The Final Rumour', emoji: '💔',
    body: ['An anonymous post claims you\'re secretly engaged to three Kens at once!', 'The season finale is in 2 days. Your choices so far will shape what people believe...'],
    opts: [
      { id: 'faith', label: '🤍 Trust your reputation', sub: 'Good Rep: +3000 charm · Bad Rep: +1 scandal', result: [], fx: { flag: 'faith' }, tone: 'neutral' },
      { id: 'reveal', label: '🕵️ Find who posted it', sub: 'Reveals the truth', result: [], fx: { flag: 'detective' }, tone: 'neutral' },
    ],
  },
  {
    day: 2, title: 'Interlude · The Secret Admirer', emoji: '💌',
    body: ['A pastel envelope slides under your door. No stamp. No name. Just a pressed white rose and a line of tidy handwriting:', '\"Dreamtown looks better when you are in it.\"', 'What do you do with the letter?'],
    opts: [
      { id: 'keep', label: '💗 Keep it under your pillow', sub: '+1 Rosan Trust · +0.5 ♥ to Clueless Ken', result: ['You smile at the ceiling for an embarrassing amount of time.', 'Somewhere high above, a very private person pretends he did not just sneeze.'], fx: { rosanTrust: 1, kenMorale: [0, 0.5], flag: 'admirer_kept' }, tone: 'good' },
      { id: 'post', label: '📱 Post it online', sub: '+150 💎 · -1 Reputation', result: ['The post goes viral. The mystery sender is NOT amused.', '+150 💎 from sponsored reposts.'], fx: { gems: 150, rep: -1, rosanTrust: -1, flag: 'admirer_posted' }, tone: 'bad' },
      { id: 'detective', label: '🔎 Investigate the paper', sub: '+1 Reputation · secret item', result: ['The paper smells like cedar and expensive cologne. You follow the trail... to a florist who sells you a rare gift.', 'Smart AND stylish.'], fx: { rep: 1, item: true, flag: 'admirer_detective' }, tone: 'good' },
    ],
  },
  {
    day: 9, title: 'Interlude · The Lost Phone', emoji: '📱',
    body: ['Near the fountain you find a cracked phone buzzing with notifications. The lock screen is a photo of... Billionaire Ken\'s yacht?', 'The owner is nowhere to be seen.'],
    opts: [
      { id: 'return', label: '🤝 Return it to the owner', sub: '+1 Reputation · +300 💎 reward', result: ['A grateful intern sprints over and presses a reward into your hands. \"You have no idea how much trouble you just saved me.\"'], fx: { rep: 1, gems: 300, flag: 'phone_returned' }, tone: 'good' },
      { id: 'snoop', label: '👀 Read the messages', sub: '+500 💎 · -1 Reputation · +1 Scandal', result: ['You learn way too much about yacht parties. A bystander notices you scrolling.', '+500 💎 (hush money).'], fx: { gems: 500, rep: -1, scandal: 1, flag: 'phone_snoop' }, tone: 'bad' },
      { id: 'police', label: '🚓 Hand it to the police', sub: '+1 Rep · all Kens +0.5♥', result: ['The officer salutes. The Kens hear about your integrity before lunch.'], fx: { rep: 1, allMorale: 0.5 }, tone: 'good' },
    ],
  },
  {
    day: 12, title: 'Interlude · Bonfire on the Beach', emoji: '🔥',
    body: ['The Kens organise a surprise sunset bonfire. Marshmallows, guitars, bad singing. Everyone wants you to sit next to them.', 'Tonight you could get closer to everyone... or deeply to one.'],
    opts: [
      { id: 'everyone', label: '🌈 Mingle with everybody', sub: 'All Kens +1♥', result: ['You laugh until your cheeks hurt. Not a single Ken is left out.', 'The sunset agrees this was a good idea.'], fx: { allMorale: 1, flag: 'bonfire_social' }, tone: 'good' },
      { id: 'sing', label: '🎸 Grab the guitar and sing', sub: '+2000 charm · +1 Rep', result: ['You play three chords. You sing with the confidence of a stadium tour. It works.', '+2000 ✨ charm'], fx: { charm: 2000, rep: 1, flag: 'bonfire_singer' }, tone: 'good' },
      { id: 'walk', label: '🌊 Walk along the shore alone', sub: '+1 Rosan Trust · peaceful', result: ['The waves are quiet. In the glow of a far-off window, a silhouette seems to lift a hand in greeting.'], fx: { rosanTrust: 1, flag: 'bonfire_alone' }, tone: 'neutral' },
    ],
  },
  {
    day: 15, title: 'Interlude · The Talent Show', emoji: '🎭',
    body: ['Dreamtown\'s Annual Talent Show needs one more act. The host practically drags you on stage.', 'The spotlight is hot. The crowd is huge.'],
    opts: [
      { id: 'dance', label: '💃 Do a dance routine', sub: 'High Glamour: +1000 💎 · else +300 💎', result: [], fx: { flag: 'talent_dance' }, tone: 'neutral' },
      { id: 'magic', label: '🎩 Pull off a magic trick', sub: '+1 Rep · +400 💎', result: ['A dove, a bouquet and a very confused judge. The crowd goes wild!', '+400 💎'], fx: { rep: 1, gems: 400, flag: 'talent_magic' }, tone: 'good' },
      { id: 'host', label: '🎤 Take over as host', sub: '+2 Reputation', result: ['You introduce every act with such warmth that even the losing contestants thank you.', '+2 Reputation'], fx: { rep: 2, flag: 'talent_host' }, tone: 'good' },
    ],
  },
  {
    day: 18, title: 'Interlude · A Letter from the Tower', emoji: '🗼',
    body: ['A hand-delivered note, sealed with white wax: \"Dinner on the roof. If you are willing. — R.\"', 'Your heart does something acrobatic.'],
    opts: [
      { id: 'accept', label: '🕯️ Say yes', sub: '+1 Rosan Trust · +2 Rep (if you earned it)', result: [], fx: { flag: 'tower_yes' }, tone: 'neutral' },
      { id: 'wait', label: '⏳ Ask for a little more time', sub: '+1 Rep · Rosan respects honesty', result: ['You send back a polite note. His reply: \"Take all the time you need. I am very good at waiting.\"'], fx: { rep: 1, rosanTrust: 1, flag: 'tower_wait' }, tone: 'good' },
      { id: 'decline', label: '🚪 Politely decline', sub: '+300 💎 · Rosan -1 Trust', result: ['You choose your own path. A small, silent gap opens in your heart.', '+300 💎 from a perfume sponsor.'], fx: { gems: 300, rosanTrust: -1, flag: 'tower_no' }, tone: 'neutral' },
    ],
  },
];

export function storyFor(day: number) { return STORY.find((s) => s.day === day) || null; }

/** Final ending determined by reputation, flags and relationships. */
export function endingFor(o: { rep: number; flags: Set<string>; love: boolean; rosanTrust: number; kens: number; scandal: boolean }) {
  if (o.scandal) return { name: 'Scandal Queen', icon: '📸', text: 'Three scandals too many. You\'ll be back next season — wiser, and with better sunglasses.' };
  if (o.love && o.flags.has('loyal') && o.rep >= 5) return { name: 'Perfect Fairytale', icon: '👑', text: 'You married Rosan on the rooftop, loved by the whole city. A legend of kindness, loyalty and style.' };
  if (o.love) return { name: 'True Love', icon: '💖', text: 'You and Rosan watch every sunrise together from the penthouse. The city still whispers about you.' };
  if (o.flags.has('sold_out')) return { name: 'Rich but Lonely', icon: '💰', text: 'Your account overflows with gems, but the Penthouse Tower lights never turned on for you again.' };
  if (o.rep >= 8) return { name: 'Beloved Icon', icon: '🌟', text: 'Dreamtown named a street after you. Kens line up just to say hello.' };
  if (o.rep <= -4) return { name: 'Villain Era', icon: '😈', text: 'Feared, fabulous and infamous. Raquelle took notes.' };
  if (o.kens >= 20) return { name: 'Ken Collector', icon: '💞', text: 'You charmed almost every Ken in Dreamtown. Choosing one? Maybe next season.' };
  return { name: 'Season Star', icon: '🏁', text: 'A fabulous season full of dates, drama and dresses. Your story is only beginning.' };
}
