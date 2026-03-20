// Famous quotes for the Quote Game puzzle type
// Each quote has: author, full text, and words to find in the grid
// Words are 3-8 letters, uppercase. The text uses {0}, {1}, etc. as placeholders
// for the blanked words (in order of the words array).

const QUOTES = [
  {
    author: "Winston Churchill",
    text: "You {0} enemies? {1}. That {2} you've {3} up for something, sometime in your {4}.",
    words: ["HAVE", "GOOD", "MEANS", "STOOD", "LIFE"]
  },
  {
    author: "Winston Churchill",
    text: "Success is not {0}. {1} is not {2}. It is the {3} to {4} that counts.",
    words: ["FINAL", "FAILURE", "FATAL", "COURAGE", "CONTINUE"]
  },
  {
    author: "Winston Churchill",
    text: "A {0} is {1} who can {2} you to {3} with a {4}.",
    words: ["DIPLOMAT", "SOMEONE", "TELL", "JUMP", "SMILE"]
  },
  {
    author: "Queen Elizabeth II",
    text: "It has {0} been {1} to me that in {2} of {3}, the {4} of {5} are the {6}.",
    words: ["ALWAYS", "CLEAR", "TIMES", "WORRY", "CALMEST", "PEOPLE", "BEST"]
  },
  {
    author: "Queen Elizabeth II",
    text: "I {0} to be {1} clearly and {2}.",
    words: ["HAVE", "SEEN", "HEARD"]
  },
  {
    author: "Queen Elizabeth II",
    text: "It is {0} for a {1} to {2} the {3} of the {4} upon her {5}.",
    words: ["EASY", "QUEEN", "READ", "MOOD", "NATION", "FACE"]
  },
  {
    author: "William Shakespeare",
    text: "All that {0} is not {1}.",
    words: ["GLITTERS", "GOLD"]
  },
  {
    author: "William Shakespeare",
    text: "The {0} is not in our {1}, but in {2}.",
    words: ["FAULT", "STARS", "SELVES"]
  },
  {
    author: "William Shakespeare",
    text: "The {0} of {1} {2} did never run {3}.",
    words: ["COURSE", "TRUE", "LOVE", "SMOOTH"]
  },
  {
    author: "William Shakespeare",
    text: "Love all, {0} few, do {1} to {2}.",
    words: ["TRUST", "WRONG", "NONE"]
  },
  {
    author: "Jane Austen",
    text: "It is a {0} universally {1}, that a {2} man in want of a good {3}, must be in need of a {4}.",
    words: ["TRUTH", "HELD", "SINGLE", "FORTUNE", "WIFE"]
  },
  {
    author: "Jane Austen",
    text: "There is no {0} so {1} as that of a {2} who has been {3} against.",
    words: ["CHARM", "GREAT", "PERSON", "SLIGHTED"]
  },
  {
    author: "Jane Austen",
    text: "I {0} those that can {1} at themselves, for they will {2} be {3}.",
    words: ["ADMIRE", "LAUGH", "NEVER", "BORED"]
  },
  {
    author: "Charles Dickens",
    text: "It was the {0} of {1}, it was the {2} of times.",
    words: ["BEST", "TIMES", "WORST"]
  },
  {
    author: "Charles Dickens",
    text: "Have a {0} that is not {1} only by the {2}. Have a {3} that is not {4} only at {5} time.",
    words: ["HEART", "WARMED", "FIRE", "SMILE", "BRIGHT", "MEAL"]
  },
  {
    author: "Charles Dickens",
    text: "No one is {0} who has {1} to help {2}.",
    words: ["USELESS", "FRIENDS", "OTHERS"]
  },
  {
    author: "Oscar Wilde",
    text: "Be {0}; {1} else is {2} {3}.",
    words: ["YOURSELF", "EVERYONE", "ALREADY", "TAKEN"]
  },
  {
    author: "Oscar Wilde",
    text: "To {0} is to have been {1}, and to {2} is to be {3}.",
    words: ["LIVE", "YOUNG", "LEARN", "WISE"]
  },
  {
    author: "Oscar Wilde",
    text: "I have the {0} {1}. I am {2} {3} by {4}.",
    words: ["SIMPLEST", "TASTES", "ALWAYS", "PLEASED", "BEST"]
  },
  {
    author: "Oscar Wilde",
    text: "With {0}, we can {1} {2}. Without it, we {3} {4}.",
    words: ["FREEDOM", "DREAM", "BOLDLY", "MERELY", "EXIST"]
  },
  {
    author: "Mahatma Gandhi",
    text: "Be the {0} you {1} to see in the {2}.",
    words: ["CHANGE", "WISH", "WORLD"]
  },
  {
    author: "Mahatma Gandhi",
    text: "The {0} of {1} is to find your {2} and then with all your {3} give it {4}.",
    words: ["PURPOSE", "LIFE", "GIFT", "HEART", "AWAY"]
  },
  {
    author: "Mahatma Gandhi",
    text: "In a {0} way, you can {1} the {2}.",
    words: ["GENTLE", "SHAKE", "WORLD"]
  },
  {
    author: "Nelson Mandela",
    text: "It {0} seems {1} until it is {2}.",
    words: ["ALWAYS", "HARD", "DONE"]
  },
  {
    author: "Nelson Mandela",
    text: "I {0} {1}, not because I did not {2}, but because I {3} myself {4} to {5}.",
    words: ["NEVER", "LOSE", "FAIL", "ALLOW", "TIME", "GROW"]
  },
  {
    author: "Mark Twain",
    text: "The {0} of {1} your life is to {2} all the {3} that are {4}.",
    words: ["SECRET", "GETTING", "ENJOY", "LITTLE", "GIVEN"]
  },
  {
    author: "Mark Twain",
    text: "{0} is {1} to those who {2} for it.",
    words: ["KINDNESS", "LANGUAGE", "HEAR"]
  },
  {
    author: "Mark Twain",
    text: "If you {0} the {1}, you will {2} know the {3}.",
    words: ["TELL", "TRUTH", "NEVER", "ANSWER"]
  },
  {
    author: "Albert Einstein",
    text: "Life is like {0} a {1}. To keep your {2}, you must keep {3}.",
    words: ["RIDING", "BICYCLE", "BALANCE", "MOVING"]
  },
  {
    author: "Albert Einstein",
    text: "In the {0} of {1}, {2} is more {3} than {4}.",
    words: ["MIDDLE", "EVERY", "THERE", "CHANCE", "FEAR"]
  },
  {
    author: "Albert Einstein",
    text: "A {0} who never made a {1} never {2} anything {3}.",
    words: ["PERSON", "MISTAKE", "TRIED", "NEW"]
  },
  {
    author: "Audrey Hepburn",
    text: "The {0} thing in this {1} is to {2} how to give {3} out, and to let it come in {4}.",
    words: ["BEST", "WORLD", "LEARN", "LOVE", "TOO"]
  },
  {
    author: "Audrey Hepburn",
    text: "{0} in {1} and {2} in {3}.",
    words: ["HAPPY", "GIRLS", "PRETTY", "PEARLS"]
  },
  {
    author: "Roald Dahl",
    text: "If you have {0} {1}, wonderful {2} will {3}.",
    words: ["GOOD", "THOUGHTS", "THINGS", "HAPPEN"]
  },
  {
    author: "Roald Dahl",
    text: "A {0} who has good {1} cannot ever be {2}.",
    words: ["PERSON", "THOUGHTS", "UGLY"]
  },
  {
    author: "Roald Dahl",
    text: "Those who don't {0} in {1} will never {2} it.",
    words: ["BELIEVE", "MAGIC", "FIND"]
  },
  {
    author: "Agatha Christie",
    text: "The {0} {1} you have is {2}. The more you {3}, the {4} it comes.",
    words: ["BEST", "TIME", "NOW", "WAIT", "WORSE"]
  },
  {
    author: "Agatha Christie",
    text: "I do not {0} at the {1}. I {2} about it {3}.",
    words: ["THINK", "FUTURE", "DREAM", "FONDLY"]
  },
  {
    author: "Benjamin Franklin",
    text: "An {0} in {1} is {2} an hour in {3}.",
    words: ["HOUR", "MORNING", "WORTH", "EVENING"]
  },
  {
    author: "Benjamin Franklin",
    text: "Tell me and I {0}. Teach me and I {1}. Involve me and I {2}.",
    words: ["FORGET", "RECALL", "LEARN"]
  },
  {
    author: "Mother Teresa",
    text: "If you {0} a hundred {1} you don't have {2} to {3} one.",
    words: ["JUDGE", "PEOPLE", "TIME", "LOVE"]
  },
  {
    author: "Mother Teresa",
    text: "Not all of us can do {0} {1}. But we can do {2} {3} with {4} {5}.",
    words: ["GREAT", "THINGS", "SMALL", "DEEDS", "BIG", "LOVE"]
  },
  {
    author: "C. S. Lewis",
    text: "You are {0} too {1} to be {2} who you {3}. You are {4} too {5} to be {6}.",
    words: ["NEVER", "OLD", "JUST", "ARE", "ALSO", "YOUNG", "WISE"]
  },
  {
    author: "C. S. Lewis",
    text: "You can't go {0} and {1} the {2}, but you can {3} now and {4} the {5}.",
    words: ["BACK", "CHANGE", "START", "BEGIN", "ALTER", "ENDING"]
  },
  {
    author: "Winnie the Pooh",
    text: "You are {0} than you {1}, {2} than you {3}, and {4} than you {5}.",
    words: ["BRAVER", "THINK", "SMARTER", "KNOW", "LOVED", "GUESS"]
  },
  {
    author: "Winnie the Pooh",
    text: "A {0} without a {1} is like a day without {2}.",
    words: ["DAY", "FRIEND", "SUNSHINE"]
  },
  {
    author: "Winnie the Pooh",
    text: "How {0} to have {1} that makes {2} goodbye so {3}.",
    words: ["LUCKY", "SOMEONE", "SAYING", "HARD"]
  },
  {
    author: "Mary Poppins",
    text: "In every {0} that must be {1}, there is an {2} of {3}.",
    words: ["JOB", "DONE", "ELEMENT", "FUN"]
  },
  {
    author: "Paddington Bear",
    text: "If we are {0} to {1}, they will be {2} to us.",
    words: ["KIND", "OTHERS", "GENTLE"]
  },
  {
    author: "Paddington Bear",
    text: "Please {0} after this {1}. {2} you.",
    words: ["LOOK", "BEAR", "THANK"]
  },
  {
    author: "Dolly Parton",
    text: "If you {0} a {1} path, go {2} your own {3}.",
    words: ["WANT", "HAPPY", "BLAZE", "TRAIL"]
  },
  {
    author: "Dolly Parton",
    text: "The way I see it, if you {0} the {1}, you had {2} {3} the {4}.",
    words: ["WANT", "RAINBOW", "BETTER", "ENJOY", "RAIN"]
  },
  {
    author: "David Attenborough",
    text: "No one will {0} what they do not {1} about, and no one will {2} about what they have {3} {4}.",
    words: ["PROTECT", "CARE", "WORRY", "NEVER", "SEEN"]
  },
  {
    author: "David Attenborough",
    text: "The {0} {1} is the most {2} thing on this {3}.",
    words: ["NATURAL", "WORLD", "PRECIOUS", "PLANET"]
  },
  {
    author: "Maya Angelou",
    text: "People will forget what you {0}. But they will {1} {2} how you made them {3}.",
    words: ["SAID", "NEVER", "FORGET", "FEEL"]
  },
  {
    author: "Maya Angelou",
    text: "If you are {0} {1}, be {2}. If you get it, be {3}.",
    words: ["GIVEN", "LIGHT", "KIND", "HUMBLE"]
  },
  {
    author: "Helen Keller",
    text: "The {0} and most {1} things in the {2} cannot be {3} or {4}.",
    words: ["BEST", "LOVELY", "WORLD", "SEEN", "TOUCHED"]
  },
  {
    author: "Helen Keller",
    text: "Keep your {0} to the {1} and you {2} never see a {3}.",
    words: ["FACE", "SUNSHINE", "WILL", "SHADOW"]
  },
  {
    author: "Terry Pratchett",
    text: "A {0} without {1} is like a {2} without a {3}.",
    words: ["WORLD", "BOOKS", "GARDEN", "SHED"]
  },
  {
    author: "Terry Pratchett",
    text: "The {0} starts {1} the moment you {2} a {3} story.",
    words: ["MAGIC", "WORKING", "OPEN", "GOOD"]
  },
  {
    author: "Beatrix Potter",
    text: "Thank {0} for the {1} {2} of {3}.",
    words: ["GOODNESS", "LITTLE", "THINGS", "LIFE"]
  },
  {
    author: "Alan Bennett",
    text: "The {0} thing about {1} is that it {2} you for {3}.",
    words: ["BEST", "READING", "PREPARES", "LIFE"]
  },
  {
    author: "J. R. R. Tolkien",
    text: "Not all those who {0} are {1}.",
    words: ["WANDER", "LOST"]
  },
  {
    author: "J. R. R. Tolkien",
    text: "All we have to {0} is what to do with the {1} that is {2} to us.",
    words: ["DECIDE", "TIME", "GIVEN"]
  },
  {
    author: "J. K. Rowling",
    text: "It does not do to {0} on {1} and {2} to {3}.",
    words: ["DWELL", "DREAMS", "FORGET", "LIVE"]
  },
  {
    author: "J. K. Rowling",
    text: "{0} is found even in the {1} of {2}, if one only {3} to turn on the {4}.",
    words: ["JOY", "DARKEST", "TIMES", "DARES", "LIGHT"]
  },
  {
    author: "Florence Nightingale",
    text: "I {0} my {1} in {2}, not in {3}.",
    words: ["MEASURE", "LIFE", "DEEDS", "YEARS"]
  },
  {
    author: "Florence Nightingale",
    text: "How very {0} a {1} can be {2} {3} of us.",
    words: ["LITTLE", "THING", "BEST", "EACH"]
  },
  {
    author: "Virginia Woolf",
    text: "You cannot {0} a good {1} if you have not been a keen {2}.",
    words: ["WRITE", "BOOK", "READER"]
  },
  {
    author: "Virginia Woolf",
    text: "One cannot {0} well, {1} well, {2} well, if one has not {3} well.",
    words: ["THINK", "LOVE", "SLEEP", "DINED"]
  },
  {
    author: "Michael Caine",
    text: "Be like a {0}. Calm on the {1} but {2} {3} below.",
    words: ["DUCK", "SURFACE", "PADDLING", "AWAY"]
  },
  {
    author: "Julie Andrews",
    text: "Some {0} in life are {1}, like a {2} {3} or a {4} of {5}.",
    words: ["THINGS", "SIMPLE", "WARM", "SCARF", "CUP", "TEA"]
  },
  {
    author: "Stephen Fry",
    text: "It is a {0} that {1} can {2} any {3}.",
    words: ["CLICHE", "LOVE", "SOLVE", "RIDDLE"]
  },
  {
    author: "Judi Dench",
    text: "I {0} there is a {1} to be {2} every {3} {4}.",
    words: ["THINK", "LOT", "SAID", "SINGLE", "DAY"]
  },
  {
    author: "P. G. Wodehouse",
    text: "There is {0} {1} with {2} on a {3} {4}.",
    words: ["NOTHING", "WRONG", "BEING", "SUNNY", "SIDE"]
  },
  {
    author: "Michael Palin",
    text: "The {0} thing about {1} is that it opens your {2} and {3} your {4}.",
    words: ["GREAT", "TRAVEL", "EYES", "FEEDS", "SOUL"]
  },
];
