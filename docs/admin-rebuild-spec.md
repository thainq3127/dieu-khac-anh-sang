# Spec: Tách Admin CMS riêng (NestJS + Prisma), kiến trúc đa cấp Organization → Page → Block/Section → Element

> Trạng thái: draft v2 — các quyết định kiến trúc chính đã được chốt (xem mục 12). Còn 1 số chi tiết implementation sẽ tinh chỉnh trong lúc code Phase 0, nhưng khung tổng thể trong tài liệu này là bản để bắt đầu build.

---

## 1. Mục tiêu

1. Admin mới là một ứng dụng **hoàn toàn tách biệt** khỏi frontend hiện tại (`vanhoacham-nextjs`): repo/khả năng deploy riêng, domain riêng (vd `admin.xxx.vn`), không import code hay đụng DB trực tiếp từ Next.js public site.
2. Giữ **đầy đủ tính năng** admin hiện có (xem mục 2) — không được thiếu tính năng khi chuyển đổi.
3. Backend là **NestJS + Prisma**, thay cho cách hiện tại (Next.js Server Actions gọi thẳng SQL qua `pg` Pool). Frontend (admin và cả public site) chỉ nói chuyện với DB qua REST API.
4. Mô hình dữ liệu phải hỗ trợ **nhiều website khác nhau** trên cùng một hệ thống (multi-tenant), với phân cấp:
   `Organization → Page → Section/Block → Element (nội dung, style, ...)`
5. Admin là **nền tảng gốc, có thể mở rộng dần**: thêm block type mới, page type mới, section mới... mà không phải đập lại schema.
6. **Xác nhận:** nhiều website (Organization) khác nhau dùng **chung 1 bộ thư viện Block/Section/Element** (registry toàn cục) — mỗi org không phải định nghĩa lại bộ block từ đầu, chỉ khác nhau ở nội dung/style thực tế và (tuỳ chọn) vài block type riêng bổ sung cho org đó. Phạm vi triển khai đợt này: **chỉ Backend (NestJS+Prisma) + Admin app**. Từng website public là các dự án/repo độc lập, xây riêng lẻ và không nằm trong phạm vi đợt này — chúng chỉ cần đọc dữ liệu qua API công khai (mục 5b) theo đúng Organization của mình.

---

## 2. Hiện trạng — tóm tắt để đối chiếu khi migrate

Đã đọc toàn bộ `supabase/schema.sql`, `supabase/migrations/*.sql`, `migrations/*.sql`, `src/lib/db.ts`, `src/lib/repos/*`, `src/auth.ts`, `src/components/admin/**`, `src/components/blocks/**`, `src/app/admin/**`. Tóm tắt các điểm quan trọng cho việc thiết kế lại:

| Khu vực | Hiện trạng | Ảnh hưởng lên thiết kế mới |
|---|---|---|
| **DB access** | Raw SQL qua `pg.Pool` (`src/lib/db.ts`) + repository pattern tay (`src/lib/repos/*.ts`), không ORM. RLS/trigger Supabase đã bị tháo bỏ hoàn toàn (`migrations/20260622_remove_supabase_auth_artifacts.sql`) — **không còn authorization ở tầng DB**, toàn bộ nằm ở app layer. | Xác nhận hướng NestJS + Prisma là đúng; toàn bộ auth/tenant-scoping phải làm ở service layer (guard + Prisma), không được trông chờ DB. |
| **Auth** | NextAuth v5 Credentials provider, so sánh **plaintext** với 1 cặp `ADMIN_EMAIL`/`ADMIN_PASSWORD` trong env — không có bảng user thật, không hash password. JWT session 8h, không có refresh token. | Đây là lỗ hổng lớn nhất cần vá: hệ thống mới phải có user thật + bcrypt + JWT access/refresh. |
| **RBAC "Accounts"** | UI `/admin/accounts` (CRUD account, activity log) đã build đầy đủ nhưng **backend bị stub cứng** — `saveAccount`/`deleteAccount` luôn trả lỗi, `getAccounts()` trả 1 row giả từ env var. Bảng `profiles` (role admin/edit) tồn tại nhưng không ai query. | Ý định RBAC 2 role (admin/edit) đã có sẵn trong UI cũ — hệ thống mới nên **làm thật** việc này, mở rộng thành multi-org membership. |
| **Activity log** | Bảng `activity_logs` vẫn được đọc, nhưng **không còn ai viết vào** vì trigger ghi log (`log_activity_trigger`) bị drop khi rời Supabase. | Phải viết lại tầng ghi log ở NestJS service (interceptor hoặc gọi service tường minh), không dựa DB trigger. |
| **Pages/Blocks (core CMS)** | `pages` (title/description JSONB `{vi,en,ru,zh}` cứng) 1-nhiều `content_blocks` (`block_type` string, `content` JSONB, `sort_order`, `is_visible`, `label`). 12 block type cố định, style dùng chung `BaseBlockStyleProps`. | Đây là phần lõi cần generalize thành cây `ContentNode` (mục 4.3) để hỗ trợ Section→Element lồng nhau và nhiều loại block mở rộng được. |
| **5 nguồn sự thật không đồng bộ cho block type** | Render switch (`DynamicBlock.tsx`), form switch (`BlockForm.tsx`), `BLOCK_TYPES` metadata, `LAYOUT_OPTIONS` gallery, `validateBlockContent` — 5 chỗ hard-code riêng biệt, phải sửa tay đồng thời khi thêm 1 block type. | Thiết kế mới cần **1 registry duy nhất** (`BlockTypeDefinition`, mục 4.4) làm nguồn sự thật, loại bỏ tình trạng này. |
| **Block/Element lồng nhau** | Không tồn tại trong hệ thống production — mỗi block có vài field dạng "array riêng" (`images[]`, `cards[]`, `infoCards[]`...), không phải cây Element tổng quát. **Tồn tại 1 prototype chưa gắn DB** ở `/admin/blocks/builder` (`CanvasElement` cây đệ quy, drag-drop `@dnd-kit`, tab Content/Style/Animation) — nút "Lưu" không có handler, chưa từng lưu DB. | Đây chính xác là ý tưởng Section→Element cần chính thức hoá thành model thật (mục 4.3) — dùng lại UX/UI đã prototype, gắn vào DB thật. |
| **Đa ngôn ngữ nội dung động** | JSONB `{vi,en,ru,zh}` **cứng 4 ngôn ngữ** trong schema (default value), danh sách ngôn ngữ lặp lại rời rạc ở nhiều nơi (`src/lib/languages.ts`, `i18n/routing.ts`, hard-code trong 2 trang editor). Auto-translate qua Gemini/Google Translate, engine không đồng nhất. | Site khác nhau cần set ngôn ngữ khác nhau (vd site chỉ vi/en) → phải làm `Locale` + `OrganizationLocale` động, không hard-code. |
| **i18n UI tĩnh (next-intl)** | Tách biệt hoàn toàn với i18n nội dung — đúng, giữ nguyên cách này ở web layer. | Không đổi. |
| **Blog/Posts** | Model **hoàn toàn song song** với Pages/Blocks — `posts.content` chỉ là 1 blob HTML/locale (Tiptap), không có block nào cả. | **Đã chốt:** unify vào Page (mục 4.3, `Page.kind = STANDARD \| POST`) để bài viết cũng có block-based content, xem mục 4.6. |
| **Map locations** | `map_locations` + `location_categories`, JSONB i18n, có thể gắn `page_id` — là tiền lệ tốt cho việc "block tham chiếu 1 bảng chuẩn hoá riêng". | Giữ làm module riêng, scope theo `organizationId`. |
| **Media** | Bảng `media` tồn tại trong schema nhưng **không code nào dùng** — upload đi thẳng S3, DB chỉ lưu object key rời rạc trong từng field (`seo_image`, `cover_image`, trong JSON content...). | Hệ thống mới nên dùng bảng Media thật (media library thật sự) thay vì rải key khắp nơi. |
| **Settings** | `site_settings` key/value JSONB, không tenant-scoped (vì chỉ có 1 site). | Thêm `organizationId` vào key/value settings. |
| **Revalidate** | Next.js `updateTag('cms')` gọi trực tiếp trong Server Action sau mỗi mutation — vì admin & public site chung 1 process. | Khi tách rời, cần webhook revalidate (mục 8). |
| **File thừa/rác** | `list-blocks-temp.mjs` (script debug Supabase cũ, không dùng), `/admin/blocks` + `/admin/blocks/builder` (prototype chưa nối DB), `migrations/20260622_migrate_supabase_asset_urls_to_s3_public_base_url.sql` (còn nguyên conflict marker `<<<<<<<`, chưa từng chạy được), `/api/admin/session-debug` (route debug). | Không cần migrate các phần này; ghi chú lại để không tưởng nhầm là feature thật. |

---

## 3. Kiến trúc tổng thể

**Phạm vi build đợt này chỉ gồm 2 khối: NestJS API + Admin app.** Các website public (site hiện tại `vanhoacham-nextjs` và các site tương lai) là những dự án hoàn toàn độc lập, do đội khác/thời điểm khác build, không nằm trong repo hay lộ trình này — chúng chỉ cần tuân theo 1 hợp đồng API công khai (mục 5b) để lấy dữ liệu theo đúng `Organization` của mình.

```
                         ┌────────────────────────┐
                         │   NestJS API (apps/api) │
                         │  Prisma + PostgreSQL    │
                         │  Auth (JWT) cho Admin   │
                         │  API Key cho Public API │
                         │  Media (S3), Webhooks   │
                         └───────────▲─────────────┘
                    REST/JSON (JWT)  │   REST/JSON (API Key, read-only)
              ┌─────────────────────┼─────────────────────────────────┐
              │                                                       │
   ┌──────────┴───────────┐                          ┌────────────────┴────────────────┐
   │  Admin app (mới)      │                          │  Website public — NGOÀI PHẠM VI  │
   │  apps/admin           │                          │  đợt này, mỗi site 1 dự án riêng: │
   │  Next.js, JWT login   │                          │  - vanhoacham-nextjs (hiện tại,   │
   │  quản trị mọi org     │                          │    migrate sau, khi sẵn sàng)     │
   │  mà user có quyền     │                          │  - các website khác sau này,      │
   └───────────────────────┘                          │    đều cùng đọc chung data model  │
                                                       │    phân cấp theo Organization     │
                                                       └───────────────────────────────────┘
```

**Nguyên tắc:** Admin là client duy nhất được ghi dữ liệu (qua JWT), không ai được đụng DB trực tiếp nữa. Mỗi website public đọc dữ liệu **read-only** qua Public Content API (xác thực bằng API Key theo từng Organization, mục 5b) — vì mỗi site là 1 dự án tách biệt, hợp đồng API (request/response shape) chính là ranh giới tích hợp, không có code dùng chung giữa Admin và các site public.

Vì admin phải phục vụ **nhiều website**, 1 tài khoản user có thể là member của nhiều Organization; admin UI có bộ chọn "Organization đang làm việc" ở góc trên, mọi API call sau đó đều scope theo `organizationId` đang chọn.

**[Đã chốt]** Không có tầng "Site" riêng giữa Organization và Page — **1 Organization = 1 website**, đúng như phân cấp bạn xác nhận. Các thuộc tính kỹ thuật của site (domain, GA4 property, S3 prefix, ngôn ngữ hỗ trợ...) nằm trực tiếp trên `Organization`. Nhiều Organization (nhiều website) khác nhau **dùng chung 1 bộ Block/Section/Element registry toàn cục** (`BlockTypeDefinition.organizationId = null`) — đây là điểm mấu chốt giúp thêm website mới không phải xây lại bộ block từ đầu, chỉ cần tạo Organization mới + nhập nội dung.

---

## 4. Mô hình dữ liệu (Prisma)

### 4.1. Tenant & người dùng

```prisma
model Organization {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  domain        String?
  status        OrgStatus @default(ACTIVE)
  defaultLocale String   @default("vi")
  ga4PropertyId String?
  s3Prefix      String?           // ví dụ "org/vanhoacham"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  locales            OrganizationLocale[]
  memberships        Membership[]
  pages              Page[]
  mediaAssets        MediaAsset[]
  settings           OrganizationSetting[]
  postCategories     PostCategory[]
  locationCategories LocationCategory[]
  mapLocations       MapLocation[]
  blockTypes         BlockTypeDefinition[]   // block type tuỳ biến riêng của org
  activityLogs       ActivityLog[]
  apiKeys            ApiKey[]
}
enum OrgStatus { ACTIVE SUSPENDED }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  isSuperAdmin Boolean  @default(false)   // vận hành toàn hệ thống, thấy mọi org
  createdAt    DateTime @default(now())

  memberships  Membership[]
  activityLogs ActivityLog[]
  refreshTokens RefreshToken[]
}

model Membership {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           OrgRole  @default(EDITOR)
  createdAt      DateTime @default(now())

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@unique([userId, organizationId])
}
enum OrgRole { OWNER ADMIN EDITOR VIEWER }

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String
  expiresAt DateTime
  revokedAt DateTime?
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Locale {
  code String @id      // 'vi' | 'en' | 'ru' | 'zh' | ...
  name String
  orgLocales OrganizationLocale[]
}

model OrganizationLocale {
  organizationId String
  localeCode     String
  isDefault      Boolean @default(false)
  isEnabled      Boolean @default(true)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  locale       Locale       @relation(fields: [localeCode], references: [code])
  @@id([organizationId, localeCode])
}

// Dùng cho các website public (dự án tách biệt, ngoài phạm vi đợt này) gọi Public Content API — xem mục 5b
model ApiKey {
  id             String    @id @default(cuid())
  organizationId String
  name           String                    // vd "vanhoacham-nextjs production"
  keyHash        String                    // hash của key, không lưu plaintext
  lastUsedAt     DateTime?
  revokedAt      DateTime?
  createdAt      DateTime  @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```

### 4.2. Trang (Page)

Tách phần "field ổn định, cần đánh index/search" (title, SEO...) ra bảng translation riêng, thay cho JSONB cứng 4 field như hiện tại — để số ngôn ngữ không bị hard-code.

```prisma
model Page {
  id             String    @id @default(cuid())
  organizationId String
  slug           String
  kind           PageKind  @default(STANDARD)   // STANDARD | POST
  isPublished    Boolean   @default(false)
  sortOrder      Int       @default(0)
  seoImage       String?
  audioUrl       String?
  categoryId     String?                        // dùng khi kind = POST
  publishedAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  translations PageTranslation[]
  nodes        ContentNode[]
  navItems     NavigationItem[]
  category     PostCategory?     @relation(fields: [categoryId], references: [id])
  mapLocations MapLocation[]

  @@unique([organizationId, slug])
}
enum PageKind { STANDARD POST }

model PageTranslation {
  id             String  @id @default(cuid())
  pageId         String
  locale         String
  title          String
  description    String?
  seoTitle       String?
  seoDescription String?

  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
  @@unique([pageId, locale])
}
```

### 4.3. Block/Section/Element — cây nội dung tổng quát

Đây là phần trung tâm giải quyết yêu cầu "block/section => element". Thay 12 kiểu block cứng + field array riêng biệt từng loại bằng **1 bảng cây tự tham chiếu**: node ở gốc (parentId = null) đóng vai trò *Section*, node con của nó là *Block/Element*, con của con là *Element* lồng sâu hơn (ví dụ: Section "Columns" → Block "Column" → Element "Button"). Độ sâu không giới hạn ở schema — do UI/registry quyết định loại nào được chứa loại nào (`allowedChildren`, mục 4.4).

```prisma
model ContentNode {
  id             String   @id @default(cuid())
  organizationId String                     // denormalize để lọc/tenant-scope nhanh, tránh join
  pageId         String
  parentId       String?
  type           String                     // khoá tham chiếu BlockTypeDefinition.key, vd 'hero' | 'columns' | 'button'
  label          String?                    // tên hiển thị tuỳ biến trong admin (giữ tương đương field `label` cũ)
  sortOrder      Int      @default(0)
  isVisible      Boolean  @default(true)
  content        Json     @default("{}")    // { props: {...}, i18n: { vi: {...}, en: {...} } }
  styles         Json     @default("{}")    // background/spacing/typography — tương đương BaseBlockStyleProps cũ
  animation      Json     @default("{}")    // fade/slide/scale... (đã có prototype AnimationPanel)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  page     Page          @relation(fields: [pageId], references: [id], onDelete: Cascade)
  parent   ContentNode?  @relation("NodeChildren", fields: [parentId], references: [id], onDelete: Cascade)
  children ContentNode[] @relation("NodeChildren")

  @@index([pageId, parentId, sortOrder])
}

model NavigationItem {
  id        String @id @default(cuid())
  pageId    String
  nodeId    String?                 // anchor tới 1 ContentNode cụ thể (thay cho "block id" cũ trong sub_nav)
  sortOrder Int    @default(0)
  label     Json                    // { vi: '...', en: '...' } — dùng OrganizationLocale để biết cần field nào

  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
}
```

**Về `content.i18n`:** vẫn dùng pattern JSON theo locale-key như hện tại (`{vi: {...}, en: {...}}`) — đã có sẵn cơ chế `translateContentObject` hoạt động tốt với shape này, không cần viết lại engine auto-translate. Khác biệt duy nhất: danh sách locale-key không còn hard-code 4 ngôn ngữ, mà lấy từ `OrganizationLocale` của org đó tại runtime — cùng 1 record `ContentNode`, org A có thể chỉ có key `vi/en`, org B có `vi/en/ru/zh/ja`.

**Về `styles`/`animation` tách khỏi `content`:** hiện tại style bị trộn chung vào `content` JSONB của `content_blocks` (qua `BlockStylingForm`). Tách riêng giúp: (a) UI có thể tái dùng chung 1 "Style panel"/"Animation panel" cho mọi loại node (đúng như prototype `/admin/blocks/builder` đã làm), (b) sau này dễ làm "style theo theme/token dùng lại" mà không đụng vào nội dung.

### 4.4. Registry loại Block/Element — cơ chế mở rộng

Giải quyết trực tiếp yêu cầu "Admin làm gốc, sau đó mở rộng thêm block, page, section": thay 5 nơi hard-code (render switch, form switch, `BLOCK_TYPES`, `LAYOUT_OPTIONS`, validate switch) bằng **1 bảng là nguồn sự thật**.

```prisma
model BlockTypeDefinition {
  id              String   @id @default(cuid())
  organizationId  String?                  // null = loại dùng chung toàn hệ thống (built-in)
  key             String                   // 'hero' | 'split' | 'custom.testimonial' ...
  label           String
  category        String?                  // 'layout' | 'media' | 'content' | 'custom'
  isContainer     Boolean  @default(false) // true nếu cho phép chứa children (Section, Columns...)
  allowedChildren String[]                 // [] = không nhận con; danh sách key = chỉ nhận các loại này
  jsonSchema      Json?                    // JSON Schema validate `content.props` — dùng cho form generic
  defaultProps    Json     @default("{}")
  defaultStyles   Json     @default("{}")
  icon            String?
  createdAt       DateTime @default(now())

  organization Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@unique([organizationId, key])
}
```

**[Đã chốt]** `organizationId = null` là bộ block/element **dùng chung cho mọi website** (global) — đây là bộ mặc định mọi Organization đều thấy ngay khi tạo mới, không phải khai báo lại. `organizationId` khác null là block type riêng do 1 website tự định nghĩa thêm (customization), chỉ hiện với org đó.

**[Đã chốt]** cách render form nhập liệu cho từng loại: giữ **form tay (curated component)** cho các block/element type "chính thức" trong bộ dùng chung (port từ `src/components/admin/block-forms/*` — trải nghiệm soạn nội dung tốt hơn nhiều so với form sinh tự động, đặc biệt với các mảng lồng như `infoCards`, `statsRow`), đăng ký theo `key`. Với block type **mới/tuỳ biến của riêng 1 org** (định nghĩa qua `BlockTypeDefinition.jsonSchema`), dùng **generic form sinh từ JSON Schema** làm fallback (tương tự ô JSON thô hiện tại nhưng có validate, thay vì textarea JSON trần). Sau này muốn nâng cấp 1 custom type lên form tay riêng thì chỉ cần thêm component + đăng ký key, không đổi schema.

#### 4.4.1. Danh mục type cần seed sẵn (global) — gồm 12 Section cũ + các Element con tách ra từ mảng lồng

Để hỗ trợ migrate dữ liệu cũ thành cây phân rã sâu (mục 9), registry global cần seed không chỉ 12 `block_type` cũ (nay là các type ở **cấp Section**, `isContainer=true`, gắn trực tiếp dưới Page) mà cả các **Element type con** tương ứng với từng mảng lặp trong `content` cũ — mỗi phần tử của mảng trở thành 1 `ContentNode` con thật sự, sửa/xoá/kéo-thả từng cái được, thay vì bị khoá cứng trong 1 field JSON của node cha:

| Section (`type`, isContainer=true) | Element/container con cần seed | Nguồn (field mảng cũ) |
|---|---|---|
| `hero` | `image` (lặp), `button` (lặp) | `images[]`, `buttons[]` |
| `split` | `gallery` (container) → `image` (con của gallery); `gallery-below` (container) → `image`; `stats-row` (container) → `stat-card`; `info-cards` (container) → `info-card`; `mini-cards` (container) → `mini-card`; `button-group` (container) → `button`; `paragraph` (lặp trực tiếp dưới `split`); `tag` (lặp trực tiếp dưới `split`) | `images[]`, `galleryBelow[]`, `statsRow[]`, `infoCards[]`, `miniCards[]`, `ctaButtons[]`, `body[]`, `tags[]` |
| `split_cards` | `info-cards` (container) → `info-card`; `button-group` (container) → `button` | `infoCards[]`, `ctaButtons[]` |
| `marquee` | `marquee-item` (lặp) | `items[]` |
| `quote_break` | *(không có, giữ leaf node — quote/eyebrow/theme là props scalar)* | — |
| `card_grid` | `card-grid-items` (container) → `grid-card` | `cards[]` |
| `video_grid` | `video-list` (container) → `video-item` | `videos[]` |
| `features_strip` | `features-list` (container) → `feature-item` | `items[]` |
| `iframe`, `image_banner`, `intro` | *(không có, giữ leaf node)* | — |
| `map` | *(không tách — chỉ tham chiếu `MapLocation.id`, không phải nội dung sở hữu bởi node)* | `locationIds[]`/`onlyLocationId` giữ nguyên trong props |

**Nguyên tắc phân rã chung** (áp dụng khi migrate lẫn khi build block mới sau này): field nào là **danh sách các mục người dùng thêm/xoá/kéo-thả độc lập trong UI hiện tại** (ảnh, nút, card, video, mini-card...) → tách thành `ContentNode` con thật; field **scalar/đơn lẻ thuộc về chính khối đó** (title, eyebrow, theme, mediaType...) → giữ nguyên trong `content.props`/`content.i18n` của node cha, không cần tách, tránh phân mảnh quá mức không có lợi ích.

#### 4.4.2. Đặc tả field đầy đủ của 12 Section hiện có (để seed `defaultProps`/`jsonSchema` không thiếu field)

Mục 4.4.1 mới nêu **tên** 12 block và field nào cần tách thành Element con — chưa liệt kê đủ toàn bộ prop/field. Bảng dưới đây đọc trực tiếp từ `src/components/blocks/types.ts`, `blockStyles.ts`, `main-page/IntroSection.tsx`, `main-page/MapSection.tsx` để đảm bảo không thiếu field khi seed registry.

**Style dùng chung cho MỌI Section** (`BaseBlockStyleProps`, `src/components/blocks/blockStyles.ts:3-26`) — map thẳng vào cột `ContentNode.styles`, không cần khai báo lại ở từng type: `customBgType`('solid'|'gradient'), `customBgColor`, `customBgGradientStart/End/Angle`, `customTextColor`, `customTitleColor`, `customBodyColor`, `customAccentColor`, `customTextAlign`('left'|'center'|'right'|'justify'), `customPaddingSize`('none'|'small'|'medium'|'large'), `customMarginSize`(cùng 4 giá trị), `customPaddingTop/Bottom/Left/Right`(px, override preset), `customMarginTop/Bottom`(px), `customThemeMode`('light'|'dark'), `customFontFamily`('sans'|'serif'|'mono'), `customFontWeight`('normal'|'medium'|'semibold'|'bold'), `customFontSize`('small'|'medium'|'large'|'xlarge'|'xxlarge'|'xxxlarge').

**Style riêng theo 1 field cụ thể** (`TextElementStyle`, dùng cho title/eyebrow/subtitle/body/blockquote/buttons riêng lẻ của Hero & Split): `fontSize`('small'|'medium'|'large'|'xlarge'|'xxlarge'), `fontWeight`('normal'|'medium'|'semibold'|'bold'), `fontStyle`('normal'|'italic'), `fontFamily`('sans'|'serif'|'mono'). Vì đây là override của **1 field scalar**, không phải danh sách, model mới lưu trong `styles.textStyles.<tênField>` của chính node đó (vd `styles.textStyles.title`), **không** tách thành Element riêng.

**Primitive dùng chung**: `BlockImage {src, alt, caption?, fancyboxGroup?}`, `BlockButton {label, href, variant:'primary'|'outline', is3d?, isInternal?, locale?}`.

| Section (`type`) | Toàn bộ field (`*` = bắt buộc) | Ghi chú xử lý trong model mới |
|---|---|---|
| `hero` | `images*: string[]`, `title*`, `eyebrow?`, `subtitle?`, `buttons?: BlockButton[]`, `scrollLabel?`, `paginationId?`, `contentAlign?`('start'\|'end'), `audioUrl?`, + `titleStyle/eyebrowStyle/subtitleStyle/buttonsStyle?: TextElementStyle` | `images[]`, `buttons[]` → Element con (4.4.1); còn lại scalar trong `content.props`/`i18n`, các `*Style` vào `styles.textStyles.*` |
| `split` | `id?`, `theme?`, `bgImage?`, `bgImageOpacity?`, `eyebrow?`, `chapterNumber?`, `title*`, `subtitle?`, `body*: string[]`, `bodyColumns?`, `blockquote?`, `tags?: string[]`, `miniCards?`, `miniCardsLayout?`('grid'\|'vertical'), `ctaButtons?`, `imagePosition?`, `mediaType?`(6 giá trị: single/grid-3-cols/grid-2x3/mosaic-1+2/mosaic-4/info-cards), `images?: BlockImage[]`, `parallax?`, `galleryBelow?`, `statsRow?`, `infoCards?`, + `eyebrowStyle/titleStyle/subtitleStyle/bodyStyle/blockquoteStyle/ctaButtonsStyle?` | `body[]` (mỗi câu 1 `paragraph`), `tags[]` (mỗi tag 1 Element `tag`, **bổ sung so với 4.4.1 — đã bỏ sót**), `images[]`/`galleryBelow[]`/`statsRow[]`/`infoCards[]`/`miniCards[]`/`ctaButtons[]` → container+Element theo 4.4.1; còn lại scalar |
| `split_cards` | `id?`, `theme?`, `eyebrow?`, `chapterNumber?`, `title*`, `subtitle?`, `body*: string[]`, `blockquote?`, `tags?`, `ctaButtons?`, `imagePosition?`, `infoCards*: SplitInfoCard[]`, `bgImage?`, `bgImageOpacity?` | Giống `split` nhưng không có media/gallery/stats/miniCards; `infoCards` bắt buộc |
| `marquee` | `items*: string[]`, `theme*`('gold'\|'dark'\|'footer') | mỗi item → Element `marquee-item` |
| `quote_break` | `quote*`, `eyebrow?`, `theme*`('terra'\|'forest'), `bgImage?`, `bgImageOpacity?` | leaf node, không có mảng |
| `card_grid` | `id?`, `theme?`, `eyebrow?`, `chapterNumber?`, `title?`, `subtitle?`, `cardStyle?`('numbered-roman'\|'numbered-decimal'\|'plain'), `columns?`(2\|3\|4), `cards*: CardGridItem[]`({prefix?,title,body}), `bodyText?`, `bgImage?`, `bgImageOpacity?` | `cards[]` → Element `grid-card` |
| `video_grid` | `id?`, `eyebrow?`, `title*`, `subtitle?`, `videos*: VideoItem[]`({id,tag?,title,desc,thumbnail?}), `columns?`(2\|3), `bgImage?`, `bgImageOpacity?`, `theme?` | `videos[]` → Element `video-item` |
| `features_strip` | `items*: FeaturesStripItem[]`({iconKey — 1 trong 10 giá trị lucide: `Landmark,Drama,Palette,ShieldCheck,MapPin,Music,Camera,Star,BookOpen,Globe` (`DynamicBlock.tsx:18-29`), title, subtitle}), `theme?`('light'\|'dark'), `ariaLabel?` | `items[]` → Element `feature-item`; `iconKey` nên validate bằng enum 10 giá trị trên trong `jsonSchema`, cho phép mở rộng thêm icon sau |
| `iframe` | `id?`, `src*`, `layout?`('full-width'\|'contained'), `height?`, `mobileHeight?`, `width?`, `theme?`, `bgImage?`, `bgImageOpacity?` | leaf node |
| `image_banner` | `id?`, `src*`, `alt?`, `caption?`, `layout?`('full'\|'shell'\|'narrow'), `height?`(preset hoặc CSS value tự do), `objectPosition?` | leaf node |
| `intro` | `eyebrow?`, `title?`, `srText1?`, `srText2?` (`main-page/IntroSection.tsx:5-10`) | leaf node. **Lưu ý bug hiện tại:** `LAYOUT_OPTIONS` (`pages/[slug]/page.tsx:161-182`) seed sẵn field `subtitle` cho block `intro`, nhưng `IntroSectionProps` **không có** prop `subtitle` — giá trị này bị bỏ qua khi render (dữ liệu chết). Khi migrate/seed registry mới, dùng đúng field thật (`eyebrow/title/srText1/srText2`), không mang theo `subtitle` cũ. |
| `map` | `onlyLocationId?`, `locationIds?: (string\|number)[]`, `title?`, `subtitle?`, `description?` (`main-page/MapSection.tsx:16-22`) | leaf node; `locationIds` là tham chiếu tới `MapLocation.id`, không phải nội dung sở hữu |

**Về `LAYOUT_OPTIONS` (14 preset khởi tạo, ví dụ `split` có 5 biến thể theo `mediaType`, xem `pages/[slug]/page.tsx:67-226`):** đây chỉ là **template điền sẵn** cho dialog "thêm block" (mỗi preset = 1 `type` + 1 bộ `initialContent` mẫu), không phải type riêng. Trong hệ thống mới **không cần model hoá trong DB** — giữ như 1 danh sách tĩnh phía Admin app (mảng preset trong code, tương tự `LAYOUT_OPTIONS` hiện tại), tham chiếu tới `BlockTypeDefinition.key` sẵn có, không tách thành `BlockTypeDefinition` riêng cho từng biến thể.

### 4.5. Media

```prisma
model MediaAsset {
  id             String        @id @default(cuid())
  organizationId String
  fileName       String
  storageKey     String                          // ví dụ "org/vanhoacham/uploads/a.jpg"
  mimeType       String
  fileType       MediaFileType @default(IMAGE)
  width          Int?
  height         Int?
  fileSize       Int?
  altText        Json?                           // { vi: '...', en: '...' }
  createdAt      DateTime      @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
enum MediaFileType { IMAGE VIDEO AUDIO FILE }
```

Khác với hiện tại (bảng `media` tồn tại nhưng bị bỏ qua, upload rải key trực tiếp vào từng field), hệ thống mới **luôn tạo 1 `MediaAsset` khi upload**, các field như `Page.seoImage`, `ContentNode.content.props.imageId`... tham chiếu qua `mediaAsset.id` (hoặc vẫn lưu `storageKey` trực tiếp nếu muốn đơn giản hơn — xem mục 6). Có media library thật giúp: tìm-kiếm-lại-ảnh-đã-upload, biết ảnh nào đang được dùng ở đâu trước khi xoá.

### 4.6. Settings / Blog / Bản đồ / Activity log

```prisma
model OrganizationSetting {
  organizationId String
  key            String
  value          Json
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@id([organizationId, key])
}

model PostCategory {
  id             String @id @default(cuid())
  organizationId String
  slug           String
  sortOrder      Int    @default(0)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  translations PostCategoryTranslation[]
  posts        Page[]
  @@unique([organizationId, slug])
}
model PostCategoryTranslation {
  id          String  @id @default(cuid())
  categoryId  String
  locale      String
  name        String
  description String?

  category PostCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@unique([categoryId, locale])
}

model LocationCategory {
  id             String @id @default(cuid())
  organizationId String

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  translations LocationCategoryTranslation[]
  locations    MapLocation[]
}
model LocationCategoryTranslation {
  id         String @id @default(cuid())
  categoryId String
  locale     String
  name       String

  category LocationCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@unique([categoryId, locale])
}

model MapLocation {
  id             String  @id @default(cuid())
  organizationId String
  lat            Decimal
  lng            Decimal
  iconColor      String  @default("#c8920c")
  sortOrder      Int     @default(0)
  isPublished    Boolean @default(true)
  googleMapsUrl  String?
  categoryId     String?
  pageId         String?

  organization Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  category     LocationCategory? @relation(fields: [categoryId], references: [id])
  page         Page?             @relation(fields: [pageId], references: [id])
  translations MapLocationTranslation[]
}
model MapLocationTranslation {
  id          String  @id @default(cuid())
  locationId  String
  locale      String
  name        String
  description String?

  location MapLocation @relation(fields: [locationId], references: [id], onDelete: Cascade)
  @@unique([locationId, locale])
}

model ActivityLog {
  id             String   @id @default(cuid())
  organizationId String
  userId         String?
  action         String                       // CREATE | UPDATE | DELETE | PUBLISH | UNPUBLISH
  targetType     String                       // 'page' | 'contentNode' | 'mediaAsset' | ...
  targetId       String?
  before         Json?
  after          Json?
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User?        @relation(fields: [userId], references: [id])
}
```

**[Đã chốt]** Blog reuse Page/ContentNode (`Page.kind = POST`) thay vì giữ model riêng như hiện tại — bài viết sẽ có "block content" giống trang thường (đoạn văn = 1 Element `richtext`, ảnh chèn giữa bài = Element `image`...), thay vì 1 blob HTML duy nhất. `PostCategory`/`PostCategoryTranslation` giữ nguyên như đã thiết kế ở trên (chỉ đổi quan hệ: `PostCategory.posts` giờ trỏ tới `Page` có `kind=POST`). Cần build sẵn Element `richtext` (bọc Tiptap, tái dùng `RichTextEditor.tsx` hiện có) ngay từ Phase 1 vì blog cần dùng ngay — xem roadmap mục 11.

---

## 5. Kiến trúc NestJS — module & endpoint

```
apps/api/src
  auth/            AuthModule        (login, refresh, me)
  users/           UsersModule       (quản lý user toàn hệ thống — chỉ superAdmin)
  organizations/   OrganizationsModule (CRUD org, quản lý member/role)
  locales/         LocalesModule
  pages/           PagesModule       (CRUD page, publish, duplicate, translations)
  content-nodes/   ContentNodesModule (CRUD node, move/reorder, duplicate subtree)
  block-types/     BlockTypesModule  (registry, JSON Schema)
  media/           MediaModule       (upload S3, media library)
  settings/        SettingsModule
  post-categories/ PostCategoriesModule (bài viết = Page kind=POST, chỉ category còn là module riêng)
  map/             MapLocationsModule, LocationCategoriesModule
  analytics/       AnalyticsModule   (proxy GA4 theo org + thống kê content)
  activity-log/    ActivityLogModule
  webhooks/        RevalidationModule (gọi webhook site public sau khi publish)
  public/          PublicContentModule (API Key auth, đọc read-only cho website public — mục 5b)
  common/          guards, interceptors, Prisma tenant-scoping helper
```

| Module | Endpoint chính |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Organizations | `GET/POST/PATCH/DELETE /organizations`, `GET /organizations/:id/members`, `POST /organizations/:id/members` (invite), `PATCH .../members/:userId` (đổi role), `GET/POST/DELETE .../api-keys` (cấp/thu hồi API Key cho website public) |
| Locales | `GET/POST/PATCH/DELETE /organizations/:orgId/locales` |
| Pages | `GET/POST/PATCH/DELETE /organizations/:orgId/pages`, `POST .../pages/:id/publish`, `POST .../pages/:id/duplicate`, `PATCH .../pages/reorder`, `PUT .../pages/:id/translations/:locale` |
| Content Nodes | `GET .../pages/:pageId/nodes` (dạng cây), `POST .../nodes`, `PATCH .../nodes/:id`, `DELETE .../nodes/:id`, `POST .../nodes/:id/duplicate`, `PATCH .../nodes/reorder`, `PATCH .../nodes/:id/move` (đổi parent) |
| Block Types | `GET /block-types` (global + của org hiện tại), `POST /organizations/:orgId/block-types`, `PATCH/DELETE .../block-types/:id` |
| Media | `POST /media/upload`, `GET /media`, `DELETE /media/:id` |
| Settings | `GET/PUT /organizations/:orgId/settings` |
| Map | CRUD `.../map-locations`, `.../location-categories` |
| Post categories (blog dùng chung `Pages` với `kind=POST`, xem 4.6) | CRUD `.../post-categories` |
| Analytics | `GET .../analytics?range=` |
| Activity log | `GET .../activity-log` |
| Webhooks | `POST .../revalidate` (internal, gọi ra ngoài, không phải cho FE gọi vào) |
| Public Content (cho website public, xem 5b) | `GET /public/pages`, `/public/pages/:slug`, `/public/posts`, `/public/post-categories`, `/public/map-locations`, `/public/settings`, `/public/locales` — auth bằng `X-Api-Key`, không dùng JWT |

### 5b. Public Content API — hợp đồng cho các website public (dự án tách biệt)

Vì mỗi website public là 1 dự án riêng, xây rời khỏi đợt này, API cần có sẵn **1 mặt bằng đọc dữ liệu ổn định, read-only, không cần login JWT**, để bất kỳ website nào (site hiện tại hoặc site mới sau này) cũng tích hợp được theo cùng 1 cách:

- Xác thực bằng **API Key** (bảng `ApiKey` ở mục 4.1), gửi qua header `X-Api-Key`, chỉ dùng **server-side** (site public gọi từ server/SSR, không lộ key ra browser) — 1 key gắn cứng với 1 `organizationId`, không cần chọn org trong request.
- Luôn chỉ trả dữ liệu `isPublished = true` (page, post, map location) — không có khái niệm draft ở mặt này.
- Endpoint đề xuất: `GET /public/pages`, `GET /public/pages/:slug?locale=vi`, `GET /public/pages/:slug/nodes` (cây ContentNode đã publish, đã resolve asset URL), `GET /public/posts`, `GET /public/posts/:slug`, `GET /public/post-categories`, `GET /public/map-locations`, `GET /public/settings`, `GET /public/locales` (danh sách locale org đó bật).
- Response trả **1 locale đã resolve sẵn** theo query `?locale=`, giữ nguyên tinh thần hàm `translateContent()`/`resolveAssetContent()` hiện tại (chọn đúng locale, expand storage key thành URL đầy đủ) — website public không cần biết gì về cấu trúc JSONB đa ngôn ngữ hay object key nội bộ.
- Đây chính là "hợp đồng tích hợp" giữa hệ thống mới và `vanhoacham-nextjs`/các site tương lai — team build từng site chỉ cần đọc spec (nên sinh OpenAPI/Swagger từ NestJS) mà không cần biết gì về schema Prisma/ContentNode bên trong.

**Guard bắt buộc mọi route (trừ Auth):**
1. `JwtAuthGuard` — xác thực access token.
2. `OrgScopeGuard` — kiểm tra `:orgId` trong URL khớp với 1 membership của user (hoặc `isSuperAdmin`), set `request.organizationId` cho toàn bộ pipeline.
3. `RolesGuard` (`@Roles('OWNER','ADMIN')`) — chặn theo role trên các action nhạy cảm (xoá page, xoá account, xoá tổ chức...) — tương đương các chỗ check `role === 'admin'` rải rác trong UI hiện tại, nhưng giờ enforce thật ở server, không chỉ ẩn nút trên UI.

**Chống rò dữ liệu cross-tenant:** vì mọi bảng chính đều có `organizationId`, bắt buộc dùng 1 base repository/service helper luôn tự thêm `where: { organizationId }` (lấy từ `request.organizationId` do guard set) — không cho phép service tự viết `prisma.page.findMany()` trần không kèm filter org. Nên cân nhắc Prisma Client Extension (`$extends`) để enforce tự động ở tầng thấp nhất, giảm rủi ro 1 dev quên filter.

---

## 6. Auth & phân quyền

- **User thật, đa tổ chức:** 1 email = 1 `User`, có thể có nhiều `Membership` (mỗi org 1 role). Không còn khái niệm "1 admin cứng qua env var".
- **Password:** bcrypt hash (đã có sẵn dependency `bcryptjs` trong project cũ, giữ dùng lại được).
- **Token:** JWT access token ngắn hạn (~15 phút) mang `sub`, `email`; **không** nhúng org/role vào access token vì user có thể đổi org đang làm việc — role được resolve lại mỗi request qua `OrgScopeGuard` tra `Membership` theo `:orgId` trong URL (tránh phải re-login khi đổi org, và tránh token cũ mang quyền cũ sau khi bị đổi role). Refresh token lưu hash trong DB (`RefreshToken`), revoke được (đăng xuất, đổi mật khẩu).
- **Role:** `OWNER` (toàn quyền + xoá org), `ADMIN` (toàn quyền trong org, tương đương `role==='admin'` cũ), `EDITOR` (tạo/sửa nội dung, không xoá/publish — tương đương `role==='edit'` từng được thiết kế nhưng chưa hoạt động), `VIEWER` (chỉ đọc — mới, phục vụ khách xem trước).
- **superAdmin (`User.isSuperAdmin`)** — vận hành nền tảng, tạo Organization mới, không cần Membership để truy cập mọi org.

---

## 7. Media/Upload

Giữ nguyên hạ tầng S3/MinIO đã hoạt động tốt (không có lý do đổi), nhưng chuyển luồng upload sang NestJS:

- `POST /media/upload` (multipart) → NestJS validate session + org → upload qua AWS SDK S3 client → tạo `MediaAsset` row → trả về `{ id, storageKey, url }`.
- Convention path: `{S3_BUCKET}/org/{organizationSlug}/uploads/...` — cách li theo tenant ngay ở object key, không chỉ ở DB.
- URL công khai vẫn resolve theo base URL cấu hình (`NEXT_PUBLIC_ASSET_BASE_URL` tương đương) — có thể để cấu hình **theo org** (mỗi site có CDN domain riêng) thay vì 1 biến env toàn cục như hiện tại.
- Logic `resolveAssetUrl`/`assetUrlToStoragePath` (`src/lib/assets.ts`) chuyển thành 1 pure function sống **trong NestJS API** — dùng khi Admin hiển thị preview và khi Public Content API (mục 5b) trả response cho website public. Vì website public giờ là dự án tách biệt, nó **không cần tự cài lại logic này** — API đã trả URL đầy đủ, đã resolve sẵn theo locale, site public chỉ việc render.

---

## 8. Đồng bộ với public site (cache/revalidate)

Hiện tại admin gọi `revalidateTag('cms')` trực tiếp vì cùng 1 Next.js process. Khi tách rời:

- Mỗi Organization có 1 (hoặc nhiều) **webhook URL + secret** cấu hình trong `OrganizationSetting` (vd `revalidate_webhook_url`).
- NestJS, sau mỗi mutation publish-worthy (publish page, sửa block, đổi settings...), gọi `POST {webhook_url}` kèm HMAC signature bằng secret → public Next.js site có 1 route `/api/revalidate` verify signature rồi gọi `revalidateTag`/`revalidatePath` tương ứng.
- Cách này tổng quát cho nhiều site khác nhau, mỗi site chỉ cần khai báo đúng 1 endpoint webhook.

---

## 9. Kế hoạch di trú dữ liệu (từ schema hiện tại)

1. Tạo 1 `Organization` cho site hiện tại (vd slug `vanhoacham`), set `defaultLocale='vi'`, tạo 4 `OrganizationLocale` (vi/en/ru/zh) từ `enabled_languages` hiện có trong `site_settings`.
2. `pages` → `Page` + unroll JSONB `{vi,en,ru,zh}` của `title`/`description` thành 4 row `PageTranslation`.
3. `content_blocks` → `ContentNode`, **phân rã thành cây sâu ngay trong lần migrate** (không dừng ở 1 cấp), theo bảng type ở mục 4.4.1:
   - Mỗi row `content_blocks` cũ → 1 `ContentNode` gốc (`parentId=null`, `type = block_type` cũ), giữ `sort_order`/`is_visible`/`label`.
   - Viết **1 hàm transform riêng cho mỗi `block_type`** (12 hàm, ứng với 12 dòng ở bảng 4.4.1, field chi tiết xem 4.4.2) — mỗi hàm đọc field mảng tương ứng trong `content` JSONB cũ (`images[]`, `buttons[]`, `cards[]`, `infoCards[]`, `statsRow[]`, `miniCards[]`, `videos[]`, `items[]`, `body[]`, `tags[]`...) và:
     a. Nếu field là container 2 cấp (vd `split.infoCards[]`) → tạo 1 `ContentNode` container (`type='info-cards'`, `parentId` = node Section gốc), rồi mỗi phần tử mảng → 1 `ContentNode` con (`type='info-card'`, `parentId` = node container vừa tạo, `sortOrder` = vị trí trong mảng, `content.i18n` = đúng phần dữ liệu của phần tử đó).
     b. Nếu field là mảng phẳng lặp trực tiếp dưới Section (vd `hero.images[]`, `hero.buttons[]`, `marquee.items[]`, `split.body[]`) → mỗi phần tử → 1 `ContentNode` con trực tiếp của Section (không cần container trung gian).
     c. Field scalar (title, eyebrow, theme, mediaType, imagePosition...) → giữ nguyên trong `content.props`/`content.i18n` của chính node Section đó, không tách.
   - Field style (`customPaddingSize`, màu nền, padding/margin, font...) hiện trộn chung trong `content` JSONB → tách sang cột `styles` mới của node Section gốc theo danh sách field đã biết trong `BaseBlockStyleProps` (style không cần/không nên đẩy xuống từng Element con, trừ khi sau này chỉnh sửa thủ công muốn override riêng).
   - Việc này cho phép ngay sau migrate, admin mới có thể sửa/xoá/kéo-thả **từng ảnh, từng nút, từng card riêng lẻ** như 1 node độc lập, đúng tinh thần "chỉnh chi tiết từng chút một" — không phải sửa cả cụm JSON như hiện tại.
4. `map_locations`/`location_categories`, `posts`/`post_categories`, `site_settings` → model tương ứng, đều gắn `organizationId` của org vừa tạo; JSONB tên/mô tả unroll thành translation row tương tự bước 2.
5. Media: **không cần di chuyển object S3** — giữ nguyên bucket/key hiện tại, chỉ cần với mỗi key đang được tham chiếu (trong `seo_image`, `cover_image`, hoặc quét trong `content` JSON) tạo 1 `MediaAsset` row trỏ tới key đó, gắn `organizationId`.
6. Tài khoản admin: tạo 1 `User` thật với email lấy từ `ADMIN_EMAIL` cũ, password mới (bcrypt) do bạn đặt lại thủ công (không migrate được plaintext env-var password sang hash một cách "giữ nguyên", vì trước giờ nó không hề được hash), gắn `Membership(role=OWNER)` vào Organization vừa tạo.
7. Bỏ qua khi migrate (đã xác nhận không phải feature thật): `profiles`, `activity_logs` (dữ liệu cũ có thể giữ lại archive, không insert tiếp), `/admin/blocks/builder` prototype, `list-blocks-temp.mjs`.
8. **Không bắt buộc làm ngay:** khi nào `vanhoacham-nextjs` sẵn sàng chuyển, cấp 1 `ApiKey` cho org đó rồi đổi `src/lib/repos/*` từ raw SQL sang gọi Public Content API (mục 5b) — giữ nguyên chữ ký hàm hiện có (`getPageBlocks`, `getPublishedPosts`...) càng nhiều càng tốt để không phải sửa lại các page component đang gọi chúng. Việc này độc lập với tiến độ build API+Admin, có thể làm sau.

---

## 10. Cấu trúc repo đề xuất

**[Đã chốt]** phạm vi repo đợt này **chỉ gồm Backend + Admin** — 1 monorepo pnpm workspace (project đã dùng pnpm sẵn) để share type/DTO giữa API và Admin, tránh lệch contract:

```
/apps
  /api      NestJS + Prisma (mới)
  /admin    Admin app mới — Next.js App Router, JWT login riêng,
            có thể copy trực tiếp src/components/ui (shadcn) và
            phần lớn src/components/admin/* hiện tại làm điểm khởi đầu UI
            (Sidebar, dialogs, BlockForm, RichTextEditor, dnd reorder...
            chỉ đổi lớp data-fetching từ server action sang API client)
/packages
  /shared-types   DTO/zod schema dùng chung giữa API ↔ Admin
```

`vanhoacham-nextjs` (website public hiện tại) và mọi website tương lai **không nằm trong monorepo này** — mỗi site là 1 dự án/repo riêng, vận hành/deploy độc lập, chỉ tích hợp với hệ thống qua Public Content API (mục 5b, xác thực bằng API Key). Muốn đồng bộ contract với các site public mà không share code, dùng `@nestjs/swagger` sinh OpenAPI spec công khai cho mục `/public/*`, để mỗi đội build site tự generate client type phía họ.

Nếu không muốn monorepo cho cả API+Admin (đơn giản hoá CI/CD riêng biệt), tách thành 2 repo độc lập vẫn được — chỉ mất thêm bước đồng bộ type qua OpenAPI như trên.

---

## 11. Lộ trình triển khai

| Phase | Nội dung | Output |
|---|---|---|
| **0 — Nền tảng** | Prisma schema (mục 4), NestJS skeleton, AuthModule thật (bcrypt+JWT+refresh), OrganizationsModule, seed 1 org từ site hiện tại | API chạy được, login thật, tạo/xem 1 org |
| **1 — CMS core** | PagesModule, ContentNodesModule (CRUD + reorder + duplicate subtree + move giữa cha/con), BlockTypesModule (seed toàn bộ type ở bảng 4.4.1 — cả Section lẫn Element con — làm global), MediaModule, SettingsModule, Element `richtext` (Tiptap, phục vụ Blog); Admin app mới build UI Pages list + Page/Node editor (form theo từng type, dnd reorder cây, live preview) | Đạt tính năng tương đương mục "3a/3b/3c" hiện tại, đã có cây Section→Element thật |
| **2 — Module phụ & Public API** | MapLocationsModule, LocationCategoriesModule; Blog qua `Page.kind=POST` (đã chốt, mục 4.6); PublicContentModule + `ApiKey` (mục 5b) để website public có thể bắt đầu tích hợp | Đạt tính năng mục "5/6" hiện tại; có hợp đồng API sẵn sàng cho site public dùng |
| **3 — RBAC & vận hành thật** | Membership/role thật thay Accounts giả, ActivityLogModule (ghi log thật ở service layer), AnalyticsModule (GA4 theo org) | Đạt tính năng mục "2/8" hiện tại, và Accounts UI lần đầu tiên hoạt động thật |
| **4 — Mở rộng block/element** | BlockTypesModule cho phép 1 org tự tạo type riêng (jsonSchema + generic form), hoàn thiện UX cây Section→Element nhiều cấp trong UI (kế thừa từ prototype `/admin/blocks/builder`) | Thoả yêu cầu "mở rộng thêm block/page/section" |
| **5 — Di trú dữ liệu site hiện tại** (làm khi `vanhoacham-nextjs` sẵn sàng chuyển, không bắt buộc ngay) | Script migrate dữ liệu (mục 9, phân rã cây sâu), sau đó bên `vanhoacham-nextjs` tự đổi lớp đọc dữ liệu sang gọi Public Content API bằng API Key | Site hiện tại chạy trên hạ tầng mới, khi team đó sẵn sàng |
| **6 — Multi-tenant onboarding** | Flow tạo Organization mới (chọn locale, mời user, cấu hình domain/S3/GA4, cấp API Key) | Sẵn sàng nhận thêm website thứ 2, thứ 3... mỗi cái là 1 dự án độc lập |

---

## 12. Quyết định đã chốt & điểm còn mở

**Đã chốt (không cần bàn lại):**
1. Organization = website, không có tầng Site riêng; nhiều Organization dùng chung 1 bộ Block/Section/Element registry toàn cục.
2. Blog dùng chung Page/ContentNode (`kind=POST`), không giữ model `Post` riêng.
3. Repo đợt này chỉ gồm `apps/api` + `apps/admin` (monorepo pnpm); website public là dự án tách biệt, tích hợp qua Public Content API (mục 5b).
4. Migrate dữ liệu cũ phân rã thành cây sâu ngay (Section→container→Element), theo bảng 4.4.1, không dừng ở 1 cấp.
5. Credential Google service account bị lộ trong `.env.example` (mục đầu tài liệu): không xử lý như 1 hạng mục vá lỗi riêng — coi là công việc bình thường của việc build `AuthModule`/quản lý config đợt này: `.env.example` của hệ thống mới chỉ chứa placeholder, secret thật (JWT secret, S3 key, `GOOGLE_PRIVATE_KEY`...) nằm trong secret manager/env thực tế, không commit. Việc rotate key `ga4-realtime-reader@vanhoacham.iam.gserviceaccount.com` hiện tại nên làm trong Google Cloud Console trước khi đưa giá trị mới vào cấu hình hệ thống mới, độc lập với tiến độ code.

**Còn mở, cân nhắc trước Phase 0 (không blocking, có thể quyết trong lúc code):**
1. Form nhập liệu cho ~12 block type "chính thức": giữ form tay port từ `src/components/admin/block-forms/*` (khuyến nghị, UX tốt hơn) hay generic-form-hoá luôn từ JSON Schema (nhanh hơn để build, UX kém hơn).
2. `MediaAsset` được tham chiếu bằng `id` quan hệ hay chỉ lưu `storageKey` trực tiếp trong các field khác (đơn giản hơn, giống cách hiện tại) — mục 4.5 đang để mở cả 2 hướng.

---

## Phụ lục: biến môi trường cần cho hệ thống mới (kế thừa từ `.env.example` hiện tại)

| Nhóm | Biến (API mới) | Ghi chú |
|---|---|---|
| DB | `DATABASE_URL` | Prisma dùng trực tiếp |
| Auth | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` | thay `AUTH_SECRET`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` |
| S3/MinIO | `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | giữ nguyên như cũ |
| Asset public URL | mỗi Organization có field riêng (`Organization` hoặc `OrganizationSetting`) thay vì 1 biến env toàn cục `NEXT_PUBLIC_ASSET_BASE_URL` | phục vụ multi-tenant, mỗi site domain khác nhau |
| GA4 | `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` ở mức hệ thống (service account chung) + `Organization.ga4PropertyId` riêng từng org | **rotate key hiện tại trước khi dùng lại** |
| Auto-translate | `GEMINI_API_KEY` | giữ nguyên engine, có thể thêm Google Translate làm fallback như cũ |
| Revalidate webhook | `REVALIDATE_WEBHOOK_SECRET` (hoặc field riêng theo org) | mới, phục vụ mục 8 |
