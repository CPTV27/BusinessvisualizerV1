# FUNCTIONAL REVENUE MODEL
## Big Muddy Blues Hotels + SuperChase Platform

> **Last Updated**: 2026-02-06
> **Source Data**: Discovery Model (Google Sheets), constants.ts entity definitions, SIDEKICK agent metrics

---

## PART 1: BIG MUDDY BLUES HOTELS (First Tenant)

### Revenue Streams

#### 1. LODGING (Foundation Layer)
| Room Category | Rate/Night | Rooms | Occupancy Target | Monthly Revenue |
|---|---|---|---|---|
| Delta Standard | $349 | 6 | 85% | $53,847 |
| Crossroads King | $399 | 4 | 80% | $38,323 |
| Juke Joint Suite | $599 | 3 | 75% | $40,433 |
| Legendary Suite | $799 | 1 | 70% | $16,779 |
| **TOTAL** | **$349-799** | **14** | **79% blended** | **$149,382** |

**Annual Lodging Revenue**: ~$1.79M

#### 2. ENTERTAINMENT (Business Layer)
| Show | Frequency | Capacity | Ticket Price | Monthly Revenue |
|---|---|---|---|---|
| Blue Monday | 4/month | 100 | Free (bar min) | $4,000 (F&B) |
| Blues School | 4/month | 75 | $25 | $7,500 |
| Headline Friday | 4/month | 150 | $45 | $27,000 |
| Saturday Double Feature | 4/month | 150 | $55 | $33,000 |
| Gospel & Gravy | 4/month | 100 | $35 (brunch incl) | $14,000 |
| **TOTAL** | **20/month** | **75-150** | **$0-55** | **$85,500** |

**Annual Entertainment Revenue**: ~$1.03M

#### 3. FOOD & BEVERAGE (Business Layer)
| Venue | Covers/Week | Avg Check | Weekly Revenue |
|---|---|---|---|
| Soul Kitchen (dinner) | 300 | $65 | $19,500 |
| Soul Kitchen (lunch) | 100 | $35 | $3,500 |
| Blues Room (bar) | 450 | $22 | $9,900 |
| Gospel & Gravy (brunch) | 100 | $35 | $3,500 |
| **TOTAL** | **450+** | - | **$36,400** |

**Annual F&B Revenue**: ~$1.89M

#### 4. PACKAGES (Business Layer — Upsell Engine)
| Package | Price/Stay | Bookings/Month | Monthly Revenue |
|---|---|---|---|
| Stay & Hear Bronze (Room + 1 Show) | $449 | 50 | $22,450 |
| Stay & Hear Silver (Room + 2 Shows + Dinner) | $699 | 30 | $20,970 |
| Stay & Hear Gold (Full Immersion) | $1,199 | 10 | $11,990 |
| **TOTAL** | - | **90** | **$55,410** |

**Annual Package Revenue**: ~$664K
**Note**: Package revenue overlaps with Lodging + Entertainment + F&B. Net incremental is the premium over individual pricing (~$200K/year).

#### 5. BRANDED PRODUCTS (Network Layer)
| Product Line | Channel | Accounts/Volume | Monthly Revenue |
|---|---|---|---|
| Delta Textures (linens/home) | Wholesale | 12 accounts | $18,000 |
| Delta Textures | Hotel gift shop | Direct | $4,500 |
| Delta Textures | Online (Shopify) | DTC | $6,000 |
| **TOTAL** | - | - | **$28,500** |

**Annual Product Revenue**: ~$342K

#### 6. ARTIST RESIDENCY (Network Layer)
| Tier | Artists/Quarter | Stipend | Revenue Source |
|---|---|---|---|
| Emerging | 2 | Housing only | Content creation, social, performances |
| Mid-Career | 1 | Housing + $500/wk | Headline shows, workshops, media |
| Master | 0-1 | Housing + $1,500/wk | Signature experiences, brand collabs |

**Revenue Model**: Residency is a **cost center** that generates **indirect revenue** through:
- Free content creation (social media, video, photography)
- Guest-draw performances (increases occupancy)
- Media coverage and press
- Relationship building with artist networks
**Estimated indirect value**: $15-25K per artist quarter

#### 7. EXPANSION PROPERTIES (Network Layer — Future)
| Location | Concept | Stage | Projected Revenue |
|---|---|---|---|
| Memphis (Beale St) | Pop-up gallery + listening room | Scouting | $0 (funnel to Natchez) |
| Hot Springs, AR | Spa city blues connection | Concept | TBD |

---

### BIG MUDDY TOTAL REVENUE PROJECTION

| Stream | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Lodging | $1,490,000 | $1,790,000 | $2,100,000 |
| Entertainment | $850,000 | $1,030,000 | $1,200,000 |
| F&B | $1,570,000 | $1,890,000 | $2,200,000 |
| Packages (incremental) | $150,000 | $200,000 | $280,000 |
| Products (Delta Textures) | $280,000 | $342,000 | $450,000 |
| **TOTAL** | **$4,340,000** | **$5,252,000** | **$6,230,000** |

**Key Assumptions**:
- Year 1: Ramp-up (80% of capacity), building reputation
- Year 2: Full operations, word-of-mouth established
- Year 3: Memphis outpost driving traffic, product line expanded

---

## PART 2: SUPERCHASE PLATFORM (The Business of the Business)

### Platform Revenue Model

SuperChase isn't just Big Muddy's tool — it's a **multi-tenant creative operations platform**.

#### Revenue Streams

**1. SaaS Platform Fees (Future)**
| Tier | Price/Month | Target Clients | Description |
|---|---|---|---|
| Starter | $299 | Boutique hotels, small venues | SIDEKICK agents, basic Studio |
| Professional | $799 | Mid-size hospitality groups | Full agent suite, immersive Studio, analytics |
| Enterprise | $2,499 | Hotel chains, entertainment cos | Custom agents, white-label Studio, API access |

**2. Implementation Services**
| Service | Price | Description |
|---|---|---|
| Discovery Model Build | $5,000 | Full business architecture mapping |
| Agent Configuration | $3,000 | Custom SIDEKICK agent training |
| Immersive Environment Design | $10,000 | Custom 3D world for client brand |
| Full Platform Setup | $15,000 | End-to-end onboarding |

**3. AI Credits / Usage**
- Gemini API calls for image/environment generation
- Grok API calls for social research
- Pass-through with margin (30%)

#### Platform Economics
| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Clients | 1 (Big Muddy) | 5 | 20 |
| MRR | $0 (internal) | $8,000 | $35,000 |
| ARR | $0 | $96,000 | $420,000 |
| Implementation Revenue | $0 | $40,000 | $150,000 |
| **Total Platform Revenue** | **$0** | **$136,000** | **$570,000** |

---

## PART 3: SIDEKICK AGENT SYSTEM (Operational Value)

### Current Agent Performance (Live Data)
| Metric | Value | Efficiency |
|---|---|---|
| Prospects Discovered | 49 | Automated (0 human hours) |
| Drafts Generated | 20 | ~10 min human review each |
| Campaign Goals | 10 | Tracked automatically |
| Tasks Completed | 26 | Fully autonomous |

### Cost of Manual Equivalent
| Task | Manual Time | Agent Time | Monthly Savings |
|---|---|---|---|
| Social media research | 40 hrs/mo | Automated | $2,000 (at $50/hr) |
| Prospect qualification | 20 hrs/mo | Automated | $1,000 |
| Message drafting | 15 hrs/mo | 5 min review each | $625 |
| Analytics & reporting | 10 hrs/mo | Automated | $500 |
| Relationship tracking | 8 hrs/mo | Automated | $400 |
| **TOTAL** | **93 hrs/mo** | **~3 hrs/mo** | **$4,525/mo** |

**Annual operational savings**: ~$54,300
**ROI on AI tooling costs**: ~$600/mo in API costs = **7.5x return**

---

## PART 4: THE BLUES TRAIL NETWORK (3-Year Vision)

### Expansion Roadmap

**Stage 1: Natchez Hub (Now - Month 12)**
- 14-room Big Muddy Inn
- Blues Room venue
- Soul Kitchen restaurant
- Delta Textures product line
- Artist Residency program

**Stage 2: Memphis Outpost (Month 6-18)**
- Beale Street pop-up gallery/listening room
- Funnel traffic to Natchez
- Brand presence in major music tourism market
- Est. 2,000 foot traffic/day on Beale

**Stage 3: Hot Springs Connection (Month 12-24)**
- Spa city blues experience
- Mississippi corridor complete
- Cross-marketing with Natchez hub

**Stage 4: Blues Trail Network (Month 18-36)**
- Multi-city interconnected experiences
- Shared loyalty/booking system
- Regional brand recognition
- Platform powering all locations via SuperChase

### Network Revenue Projection
| Stage | Venues | Annual Revenue | Platform MRR |
|---|---|---|---|
| Stage 1 (Natchez) | 1 | $4.3M | $0 (internal) |
| Stage 2 (+Memphis) | 2 | $6.5M | $799 |
| Stage 3 (+Hot Springs) | 3 | $9.2M | $1,598 |
| Stage 4 (Network) | 5+ | $15M+ | $5,000+ |

---

## BUSINESS GAPS (Strategic Action Items)

From the entity model in constants.ts — these are the open gaps that need resolution:

| Priority | Entity | Gap | Impact |
|---|---|---|---|
| HIGH | HEG/Blues Room | Soundproofing for Gospel & Gravy vs sleeping guests | Guest satisfaction |
| HIGH | Crossroads King | Missing guest arrival ritual logic | Premium experience |
| HIGH | Legendary Suite | Concierge VIP arrival experience design | Ultra-premium positioning |
| HIGH | Artist Residency | Application pipeline and vetting process not built | Program launch blocker |
| HIGH | Ari Aslin Brand | Q4 merchandise strategy missing | Revenue timing |
| HIGH | Arkansas Dev | Hot Springs market analysis not started | Expansion planning |
| MEDIUM | Delta Standard | Amenity kit sourcing from Delta artisans | Brand authenticity |
| MEDIUM | Stay & Hear Bronze | Pricing vs OTA room-only rates | Package competitiveness |
| MEDIUM | Soul Kitchen | Cocktail menu names (Blues history alignment) | Brand storytelling |
| LOW | Juke Joint Suite | In-room vinyl collection licensing check | Legal compliance |

---

*Revenue model is a living document. Update as actuals come in and assumptions change.*
