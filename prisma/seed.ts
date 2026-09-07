import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Officers (2026-27 leadership) ---
  await prisma.officer.deleteMany();
  await prisma.officer.createMany({
    data: [
      { name: "Jayden Lee",      role: "President",        email: "gttta.president@gmail.com",  order: 1 },
      { name: "Petr Molodyk",    role: "Vice President",   email: "gttta.vicepresident@gmail.com", order: 2 },
      { name: "Tobi Wang",       role: "Secretary",        email: "gttta@lists.gatech.edu",     order: 3 },
      { name: "Jaiden Jacob",    role: "Finance",          email: "gttta.finance@gmail.com",    order: 4 },
      { name: "Anvit Divekar",   role: "Webmaster",        email: "gttta.webmaster@gmail.com",  order: 5 },
      { name: "Noah Padtha",     role: "Outreach Officer", email: "gttta.outreach@gmail.com",   order: 6 },
      { name: "Johnathan Shih",  role: "Safety Officer",   email: "gttta@lists.gatech.edu",     order: 7 },
      { name: "Grace Wang",      role: "Safety Officer",   email: "gttta@lists.gatech.edu",     order: 8 },
      { name: "Jonathan Lian",   role: "Alumni Advisor",   email: "",                           order: 9 },
      { name: "Jingfeng Wang",   role: "Faculty Advisor",  email: "",                           order: 10 },
    ],
  });
  console.log("✓ Officers seeded");

  // --- Schedule (Fall 2026) ---
  await prisma.scheduleEntry.deleteMany();
  await prisma.scheduleEntry.createMany({
    data: [
      { dayOfWeek: 2, startTime: "18:00", endTime: "20:00", location: "CRC Court 6", type: "training", active: true },
      { dayOfWeek: 4, startTime: "18:00", endTime: "20:00", location: "CRC Court 6", type: "training", active: true },
      { dayOfWeek: 5, startTime: "16:00", endTime: "18:00", location: "CRC Court 5", type: "league",   active: true, notes: "League / round-robin" },
    ],
  });
  console.log("✓ Schedule seeded");

  // --- News posts ---
  const adminEmail = process.env.ADMIN_EMAIL ?? "gttta.webmaster@gmail.com";
  const posts = [
    {
      title: "Fall 2026 Season — Welcome Back!",
      body: `<p>Welcome back everyone! Here are key details for Fall 2026:</p>
<ul>
  <li><strong>First practice:</strong> September 1st (open play, no dues required for first 5 sessions)</li>
  <li><strong>Practices:</strong> Tuesday &amp; Thursday 6–8 PM (Court 6), Friday 4–6 PM (Court 5, league days)</li>
  <li><strong>Dues:</strong> $30/semester — required to play in league and tryout</li>
  <li><strong>Physicals:</strong> Now required by CRC before first practice — submit via Ideal-Logic</li>
  <li><strong>Club registration:</strong> Complete the Google Form and pay dues to receive Member status on Discord</li>
  <li><strong>Varsity Tryouts:</strong> Starting Friday 9/11 — round-robin group stage, top 2 advance</li>
</ul>
<p>Questions? Ping leadership on Discord in <strong>#onboarding</strong>.</p>`,
      publishedAt: new Date("2026-08-24"),
    },
    {
      title: "Summer 2026 Practice Schedule",
      body: `<p>Summer practices are approved and begin this week!</p>
<p><strong>Wednesday 5–7 PM, Court 4</strong> — weekly until August 5th (no practice June 24th).</p>
<p>Stop by and pong if you're around over the summer!</p>`,
      publishedAt: new Date("2026-05-18"),
    },
    {
      title: "2026–27 Leadership Announced",
      body: `<p>Voting results are in! Congratulations to GTTTA's 2026–27 leadership team:</p>
<ul>
  <li><strong>President:</strong> Jayden Lee</li>
  <li><strong>Vice President:</strong> Petr Molodyk</li>
  <li><strong>Secretary:</strong> Tobi Wang</li>
  <li><strong>Finance:</strong> Jaiden Jacob</li>
  <li><strong>Webmaster:</strong> Anvit Divekar</li>
  <li><strong>Outreach Officer:</strong> Noah Padtha</li>
  <li><strong>Safety Officers:</strong> Johnathan Shih &amp; Grace Wang</li>
</ul>
<p>Leadership will be in touch with each of you regarding Ideal-Logic onboarding and position requirements. Thanks to everyone who applied!</p>`,
      publishedAt: new Date("2026-03-16"),
    },
  ];

  for (const post of posts) {
    const exists = await prisma.newsPost.findFirst({ where: { title: post.title } });
    if (!exists) {
      await prisma.newsPost.create({ data: { ...post, published: true, authorEmail: adminEmail } });
    }
  }
  console.log("✓ News posts seeded");

  // --- Tournaments ---
  await prisma.tournament.deleteMany();
  await prisma.tournament.createMany({
    data: [
      {
        name: "Georgia Fall Team Divisional Tournament",
        date: new Date("2023-10-14"),
        location: "Lucky Shoals Park, Norcross, GA",
        type: "nctta",
      },
      {
        name: "2023 USATT Georgia State Championships",
        date: new Date("2023-08-19"),
        location: "Lucky Shoals Park, Norcross, GA",
        type: "usatt",
      },
    ],
  });
  console.log("✓ Tournaments seeded");

  // --- Resource Links ---
  await prisma.resourceLink.deleteMany();
  await prisma.resourceLink.createMany({
    data: [
      // Equipment stores
      {
        title: "Paddle Palace",
        url: "https://www.paddlepalace.com",
        description: "European and Japanese equipment. Contact an officer for a coupon code.",
        category: "equipment",
        order: 1,
      },
      {
        title: "Megaspin",
        url: "https://www.megaspin.net",
        description: "European, Japanese, and Chinese equipment. Use our affiliate link to support the club!",
        category: "equipment",
        order: 2,
      },
      {
        title: "Cole's Table Tennis",
        url: "https://www.colestt.com",
        description: "US distributor of Chinese TT equipment. Great prices. First time buying? Check the 'Premade Buster' or 'Beginners' combos.",
        category: "equipment",
        order: 3,
      },
      // Coaching: General
      {
        title: "PingSkills Techniques Playlist",
        url: "https://www.youtube.com/@PingSkills",
        description: "Comprehensive technique tutorials covering all aspects of the game.",
        category: "coaching-general",
        order: 10,
      },
      {
        title: "Understanding Spin",
        url: "https://www.youtube.com/watch?v=vm1IQFA01R8",
        description: "Video explaining the different types of spin and how to read them.",
        category: "coaching-general",
        order: 11,
      },
      {
        title: "Technique Overview (Shakehand)",
        url: "https://www.pingskills.com/table-tennis-lessons/advanced",
        description: "Overview of proper technique for shakehand grip players.",
        category: "coaching-general",
        order: 12,
      },
      // Coaching: Forehand
      {
        title: "Forehand Drive / Counterhit",
        url: "https://www.youtube.com/watch?v=U3Fk0RGg7cg",
        description: "Fundamentals of the forehand drive and counterhit stroke.",
        category: "coaching-forehand",
        order: 20,
      },
      {
        title: "Footwork Tutorial",
        url: "https://www.youtube.com/watch?v=1MYKoE2XKMU",
        description: "Essential footwork patterns for better court coverage.",
        category: "coaching-forehand",
        order: 21,
      },
      // Coaching: Backhand
      {
        title: "Backhand Counterhit (TTedge)",
        url: "https://www.youtube.com/watch?v=DqSUFuOVuoI",
        description: "Backhand counterhit technique by TTedge.",
        category: "coaching-backhand",
        order: 30,
      },
    ],
  });
  console.log("✓ Resource links seeded");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
