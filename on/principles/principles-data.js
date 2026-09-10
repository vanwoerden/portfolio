// Canonical client principles data. Keep in sync with on/principles/principles.json
// and netlify/edge-functions/lib/principles.ts (slug / title / published).
// titleHtml drives the principles list page and mirrors each principle page H1.
window.PRINCIPLES = [
  {
    slug: "design",
    title: "Design brings ideas to life",
    titleHtml: '<span class="attention">Design</span> <span class="nermal">brings ideas to life.</span>',
    published: true
  },
  {
    slug: "focus",
    title: "A great team requires focus",
    titleHtml: '<span class="nermal">A great team requires </span><span class="attention">focus.</span>',
    published: true
  },
  {
    slug: "slack-variety-cadence",
    title: "A great team craves slack, variety, and cadence",
    titleHtml: '<span class="nermal">A great team craves </span><span class="attention">slack, variety,</span> <span class="nermal"> and </span><span class="attention">cadence.</span>',
    published: false
  },
  {
    slug: "seeing-it-through-together",
    title: "Teamwork means seeing it through together",
    titleHtml: '<span class="nermal">Teamwork means </span><span class="attention">seeing it through together.</span>',
    published: false
  },
  {
    slug: "starting-out-informed",
    title: "It means starting out informed",
    titleHtml: '<span class="nermal">It means </span><span class="attention">starting out informed.</span>',
    published: true
  },
  {
    slug: "time-vs-scope",
    title: "Being flexible about time and scope",
    titleHtml: '<span class="nermal">Being </span><span class="attention">flexible about time and scope.</span>',
    published: true
  },
  {
    slug: "quality",
    title: "Keeping quality constant",
    titleHtml: '<span class="nermal">Keeping </span><span class="attention">quality</span><span class="nermal"> constant.</span>',
    published: true
  },
  {
    slug: "before-and-after",
    title: "And thinking about the before and after",
    titleHtml: '<span class="nermal">And thinking about the </span><span class="attention">before and</span> <span class="nermal"> the </span><span class="attention">after.</span>',
    published: false
  },
  {
    slug: "designers-should-code",
    title: "Designers should code",
    titleHtml: '<span class="attention">Designers should code.</span>',
    published: true
  }
];
