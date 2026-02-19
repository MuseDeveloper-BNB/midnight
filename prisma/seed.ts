import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'password123';

async function main() {
  const hashedPassword = await hash(SEED_PASSWORD, 10);

  // ---------- Users ----------
  const admin = await prisma.user.upsert({
    where: { email: 'admin@midnight.news' },
    update: {},
    create: {
      email: 'admin@midnight.news',
      name: 'Midnight Admin',
      password: hashedPassword,
      role: 'ADMIN',
      provider: 'EMAIL',
      active: true,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@midnight.news' },
    update: {},
    create: {
      email: 'editor@midnight.news',
      name: 'Crypto Editor',
      password: hashedPassword,
      role: 'EDITOR',
      provider: 'EMAIL',
      active: true,
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'member@midnight.news' },
    update: {},
    create: {
      email: 'member@midnight.news',
      name: 'Night Holder',
      password: hashedPassword,
      role: 'MEMBER',
      provider: 'EMAIL',
      active: true,
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'trader@midnight.news' },
    update: {},
    create: {
      email: 'trader@midnight.news',
      name: 'DeFi Trader',
      password: hashedPassword,
      role: 'MEMBER',
      provider: 'EMAIL',
      active: true,
    },
  });

  console.log('Users created.');

  // ---------- Content: Crypto & $NIGHT focused news and blogs ----------
  const IMG_CRYPTO = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop';
  const IMG_CHART = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop';
  const IMG_BLOCKCHAIN = 'https://images.unsplash.com/photo-1644143379190-08a5f055de1d?w=800&h=450&fit=crop';
  const IMG_DEFI = 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop';
  const IMG_TRADING = 'https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=800&h=450&fit=crop';
  const IMG_MOON = 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&h=450&fit=crop';

  const makeImg = (url: string, alt: string) => 
    `<figure style="margin: var(--space-md) 0;"><img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:8px;" /></figure>`;

  // NEWS 1: $NIGHT Token Launch
  const news1 = await prisma.content.upsert({
    where: { slug: 'night-token-breaks-new-highs' },
    update: {},
    create: {
      type: 'NEWS',
      title: '$NIGHT Token Breaks New All-Time High as Trading Volume Surges',
      body:
        makeImg(IMG_CRYPTO, '$NIGHT cryptocurrency token') +
        '<p>The $NIGHT token has reached a new all-time high of $0.087 today, marking a 340% increase from its launch price. Trading volume on major exchanges has surpassed $12 million in the last 24 hours.</p>' +
        '<p>Analysts attribute the surge to increased adoption of the Midnight Protocol and recent partnerships with major DeFi platforms. The token\'s unique "Butter Index" — which tracks the ratio of $NIGHT to US butter prices — has become a viral sensation among crypto enthusiasts.</p>' +
        '<p>"We\'re seeing unprecedented interest from both retail and institutional investors," said the project lead. "The community has grown to over 50,000 holders in just three months."</p>' +
        '<p>The Midnight Protocol team announced plans for a major upgrade in Q2, which will introduce staking rewards and cross-chain compatibility with Ethereum and Solana networks.</p>',
      slug: 'night-token-breaks-new-highs',
      status: 'PUBLISHED',
      imageUrl: IMG_CRYPTO,
      authorId: editor.id,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  // NEWS 2: Butter Index Explained
  const news2 = await prisma.content.upsert({
    where: { slug: 'butter-index-explained' },
    update: {},
    create: {
      type: 'NEWS',
      title: 'The Butter Index: Why Crypto Traders Are Obsessed With Dairy Prices',
      body:
        makeImg(IMG_CHART, 'Butter Index chart') +
        '<p>In an unexpected twist, the cryptocurrency community has embraced an unusual metric: the $NIGHT/Butter ratio. This index tracks how many $NIGHT tokens it takes to buy one pound of US Grade AA butter.</p>' +
        '<p>The metric originated as a joke on crypto Twitter but has since become a serious indicator for $NIGHT traders. "It\'s actually a clever way to measure real purchasing power," explains market analyst Sarah Chen. "Unlike comparing to USD, butter prices reflect real-world commodity inflation."</p>' +
        '<p>Currently, one pound of butter costs approximately 87 $NIGHT tokens — down from over 200 tokens at launch. The decreasing ratio indicates strengthening token value against real-world commodities.</p>' +
        '<p>The Midnight News platform now features a live Butter Index chart, updated hourly with data from CME butter futures and real-time $NIGHT prices.</p>',
      slug: 'butter-index-explained',
      status: 'PUBLISHED',
      imageUrl: IMG_CHART,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // NEWS 3: Exchange Listing
  const news3 = await prisma.content.upsert({
    where: { slug: 'night-listed-on-major-exchanges' },
    update: {},
    create: {
      type: 'NEWS',
      title: '$NIGHT Token Listed on Three Major Exchanges This Week',
      body:
        makeImg(IMG_TRADING, 'Cryptocurrency exchange trading') +
        '<p>In a significant milestone for the Midnight Protocol, the $NIGHT token has been listed on KuCoin, Gate.io, and MEXC Global this week. The listings provide access to millions of new potential traders.</p>' +
        '<p>Trading pairs include NIGHT/USDT, NIGHT/BTC, and NIGHT/ETH across all three platforms. Initial trading volumes have exceeded expectations, with over $5 million traded in the first 24 hours on KuCoin alone.</p>' +
        '<p>The project team has confirmed that discussions are ongoing with Tier-1 exchanges, including Binance and Coinbase. "We\'re focused on building the product first, but increased accessibility is crucial for adoption," the team stated.</p>' +
        '<p>With these listings, $NIGHT is now available on seven exchanges globally, up from just two decentralized exchanges at launch.</p>',
      slug: 'night-listed-on-major-exchanges',
      status: 'PUBLISHED',
      imageUrl: IMG_TRADING,
      authorId: editor.id,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  // NEWS 4: DeFi Integration
  const news4 = await prisma.content.upsert({
    where: { slug: 'night-defi-integration-announced' },
    update: {},
    create: {
      type: 'NEWS',
      title: 'Midnight Protocol Announces DeFi Integration with 15% APY Staking',
      body:
        makeImg(IMG_DEFI, 'DeFi staking platform') +
        '<p>The Midnight Protocol has launched its highly anticipated staking program, offering holders up to 15% annual percentage yield (APY) on their $NIGHT tokens.</p>' +
        '<p>The staking mechanism uses a novel "Nocturnal Rewards" system that distributes rewards based on both stake duration and participation in governance votes. Early stakers who lock tokens for 12 months receive bonus multipliers.</p>' +
        '<p>Additionally, the protocol has integrated with Uniswap V3 and PancakeSwap, enabling liquidity providers to earn trading fees alongside staking rewards. Total Value Locked (TVL) has already reached $8 million within the first week.</p>' +
        '<p>"This is just the beginning of our DeFi ecosystem," announced the development team. "We\'re building utilities that give $NIGHT real value beyond speculation."</p>',
      slug: 'night-defi-integration-announced',
      status: 'PUBLISHED',
      imageUrl: IMG_DEFI,
      authorId: editor.id,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  // BLOG 1: Understanding $NIGHT
  const blog1 = await prisma.content.upsert({
    where: { slug: 'understanding-night-tokenomics' },
    update: {},
    create: {
      type: 'BLOG',
      title: 'Understanding $NIGHT Tokenomics: A Deep Dive for New Investors',
      body:
        makeImg(IMG_BLOCKCHAIN, 'Blockchain technology visualization') +
        '<h2>What is $NIGHT?</h2>' +
        '<p>$NIGHT is the native token of the Midnight Protocol, a blockchain-based platform designed for transparent, real-time news distribution and community governance. Unlike traditional media, content decisions are made by token holders through decentralized voting.</p>' +
        '<h2>Token Distribution</h2>' +
        '<p>The total supply of $NIGHT is capped at 1 billion tokens:</p>' +
        '<ul><li>40% - Community rewards and airdrops</li><li>25% - Development fund (4-year vesting)</li><li>20% - Liquidity provision</li><li>10% - Team (2-year cliff, 4-year vesting)</li><li>5% - Marketing and partnerships</li></ul>' +
        '<h2>Utility</h2>' +
        '<p>$NIGHT tokens serve multiple purposes within the ecosystem:</p>' +
        '<ul><li>Governance voting on content policies</li><li>Tipping journalists and content creators</li><li>Premium subscription access</li><li>Staking for passive income</li></ul>' +
        '<h2>Why the Butter Index?</h2>' +
        '<p>The famous Butter Index started as a community meme but evolved into a legitimate purchasing power indicator. It resonates because it connects digital assets to tangible, everyday commodities — making crypto value more relatable.</p>',
      slug: 'understanding-night-tokenomics',
      status: 'PUBLISHED',
      imageUrl: IMG_BLOCKCHAIN,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  // BLOG 2: Trading Strategies
  const blog2 = await prisma.content.upsert({
    where: { slug: 'night-trading-strategies-beginners' },
    update: {},
    create: {
      type: 'BLOG',
      title: '$NIGHT Trading Strategies for Beginners: When to Buy, Hold, or Sell',
      body:
        makeImg(IMG_CHART, 'Trading chart analysis') +
        '<h2>Understanding Market Cycles</h2>' +
        '<p>Like all cryptocurrencies, $NIGHT experiences cycles of accumulation, markup, distribution, and markdown. Recognizing these phases can significantly improve your trading outcomes.</p>' +
        '<h2>Key Indicators to Watch</h2>' +
        '<p><strong>1. The Butter Index:</strong> When the ratio drops below 50 NIGHT/lb, historically it has indicated strong buying opportunities. Above 150 suggests caution.</p>' +
        '<p><strong>2. Trading Volume:</strong> Sudden volume spikes often precede major price movements. Monitor 24-hour volume changes on CoinGecko or CoinMarketCap.</p>' +
        '<p><strong>3. Social Sentiment:</strong> Track mentions on Twitter and Discord. The community is highly active and often signals momentum shifts.</p>' +
        '<h2>Risk Management</h2>' +
        '<p>Never invest more than you can afford to lose. Consider these rules:</p>' +
        '<ul><li>Set stop-losses at 15-20% below entry</li><li>Take partial profits at 2x and 3x gains</li><li>Keep 20% of portfolio in stablecoins for dip-buying</li></ul>' +
        '<h2>Long-Term vs Short-Term</h2>' +
        '<p>If you believe in the Midnight Protocol\'s mission, staking for 12+ months provides the best risk-adjusted returns through compounding APY and governance rewards.</p>',
      slug: 'night-trading-strategies-beginners',
      status: 'PUBLISHED',
      imageUrl: IMG_CHART,
      authorId: editor.id,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  // BLOG 3: Future Roadmap
  const blog3 = await prisma.content.upsert({
    where: { slug: 'midnight-protocol-2026-roadmap' },
    update: {},
    create: {
      type: 'BLOG',
      title: 'Midnight Protocol 2026 Roadmap: What\'s Coming for $NIGHT Holders',
      body:
        makeImg(IMG_MOON, 'Moon and night sky') +
        '<h2>Q1 2026: Cross-Chain Expansion</h2>' +
        '<p>The team is finalizing bridges to Ethereum, Solana, and Avalanche. This will allow $NIGHT to be traded and used across multiple ecosystems, dramatically increasing accessibility and liquidity.</p>' +
        '<h2>Q2 2026: Mobile App Launch</h2>' +
        '<p>A native iOS and Android app will bring Midnight News to mobile users. Features include push notifications for breaking news, in-app $NIGHT wallet, and one-tap tipping for articles.</p>' +
        '<h2>Q3 2026: NFT Integration</h2>' +
        '<p>Exclusive NFTs for long-term holders and active community members. These will unlock premium features, early access to content, and voting power multipliers.</p>' +
        '<h2>Q4 2026: Institutional Features</h2>' +
        '<p>Enterprise API access, institutional staking pools, and compliance tools for regulated entities. The goal is to make $NIGHT accessible to traditional finance players.</p>' +
        '<h2>The Vision</h2>' +
        '<p>By end of 2026, Midnight Protocol aims to be the leading decentralized news platform with 1 million active users and $100 million in TVL. The Butter Index will be featured on Bloomberg Terminal. We\'re building the future of media — one block at a time.</p>',
      slug: 'midnight-protocol-2026-roadmap',
      status: 'PUBLISHED',
      imageUrl: IMG_MOON,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    },
  });

  console.log('Crypto content created.');

  // ---------- Comments ----------
  const comment1 = await prisma.comment.create({
    data: {
      body: 'Just bought more $NIGHT after reading this. The Butter Index is genius!',
      contentId: news1.id,
      authorId: member1.id,
      status: 'VISIBLE',
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      body: 'Been holding since day one. This project has serious potential.',
      contentId: news1.id,
      authorId: member2.id,
      status: 'VISIBLE',
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      body: 'Great explanation of the tokenomics. Shared with my crypto group!',
      contentId: blog1.id,
      authorId: member1.id,
      status: 'VISIBLE',
    },
  });

  const comment4 = await prisma.comment.create({
    data: {
      body: 'The 15% APY staking is amazing. Already locked up my tokens.',
      contentId: news4.id,
      authorId: member2.id,
      status: 'VISIBLE',
    },
  });

  console.log('Comments created.');

  // ---------- SavedItem ----------
  await prisma.savedItem.upsert({
    where: { userId_contentId: { userId: member1.id, contentId: news1.id } },
    update: {},
    create: { userId: member1.id, contentId: news1.id },
  });
  await prisma.savedItem.upsert({
    where: { userId_contentId: { userId: member1.id, contentId: blog1.id } },
    update: {},
    create: { userId: member1.id, contentId: blog1.id },
  });
  await prisma.savedItem.upsert({
    where: { userId_contentId: { userId: member2.id, contentId: news2.id } },
    update: {},
    create: { userId: member2.id, contentId: news2.id },
  });

  console.log('SavedItems created.');

  // ---------- ModerationLog ----------
  await prisma.moderationLog.create({
    data: {
      action: 'PUBLISH_CONTENT',
      targetType: 'CONTENT',
      targetId: news1.id,
      moderatorId: editor.id,
      details: { slug: news1.slug },
    },
  });

  await prisma.moderationLog.create({
    data: {
      action: 'PUBLISH_CONTENT',
      targetType: 'CONTENT',
      targetId: blog1.id,
      moderatorId: admin.id,
      details: { slug: blog1.slug },
    },
  });

  console.log('Moderation logs created.');
  console.log('\n--- Seed complete. ---');
  console.log('Test accounts (all use password: ' + SEED_PASSWORD + '):');
  console.log('  Admin:  admin@midnight.news');
  console.log('  Editor: editor@midnight.news');
  console.log('  Member: member@midnight.news');
  console.log('  Member: trader@midnight.news');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
