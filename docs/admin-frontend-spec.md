# Spec: Frontend UI cho Admin CMS mới (`apps/admin`)

> Tài liệu này là phần bổ sung cho `admin-rebuild-spec.md` (kiến trúc dữ liệu + BE) — tập trung riêng vào **giao diện/màn hình/luồng thao tác** của Admin app, để AI build FE không phải tự đoán UI. Đọc `admin-rebuild-spec.md` trước để hiểu mô hình dữ liệu (Organization → Page → ContentNode → Element), tài liệu này chỉ mô tả cách hiển thị/thao tác với mô hình đó.

---

## 1. Nguyên tắc chung

1. **Không vẽ lại UI từ đầu nếu không cần thiết.** Admin cũ (`vanhoacham-nextjs`, thư mục `src/components/admin/**` và `src/app/admin/**`) đã có UI production-ready, dùng shadcn/tailwind, trải nghiệm đã được người dùng thật chấp nhận (drag-drop, live preview, đa ngôn ngữ, auto-translate...). Với mỗi màn hình bên dưới, tài liệu ghi rõ **file gốc tương ứng** để port — chỉ đổi lớp gọi dữ liệu (Server Action → gọi REST API mới), giữ nguyên layout/component/UX trừ khi tài liệu nói rõ là thay đổi.
2. **Admin giờ multi-tenant** — UI không được mang branding cứng của 1 website cụ thể (bỏ font "Brygada 1918" và các asset của site Cham/Kim Anh khỏi admin UI — đó là font/hình ảnh hiển thị NỘI DUNG site, không phải giao diện quản trị). Admin dùng theme trung tính riêng (Inter, màu sắc trung tính, có thể giữ tông màu accent tương tự bản cũ nếu muốn quen mắt).
3. **Mọi màn hình (trừ chọn Organization và trang superAdmin) đều scope theo 1 `organizationId` đang chọn** — hiển thị rõ ràng ở topbar, mọi API call phải gắn `:orgId` theo giá trị đang chọn.
4. **Ngôn ngữ trong form nội dung là động theo `OrganizationLocale`**, không hard-code danh sách vi/en/ru/zh như bản cũ.
5. FE chỉ ẩn/khoá nút theo role để tối ưu UX — **không phải ranh giới bảo mật**, BE luôn phải tự enforce lại (đã ghi trong `admin-rebuild-spec.md` mục 6).

## 2. Design system / component nền tảng

- **Stack:** Next.js App Router, TailwindCSS v4, shadcn/ui (`components.json` gốc), Radix/`@base-ui/react`, icon `lucide-react`.
- **Port trực tiếp từ repo cũ** (không viết lại): `src/components/ui/**` (toàn bộ primitive: Button, Card, Dialog, Dropdown, Tabs, Input, Select, Switch, Badge, Table, Textarea, Popover...), `src/lib/toast.ts` (toast/notification), `src/lib/utils.ts` (`cn()` helper).
- **Data fetching:** TanStack Query (khuyến nghị) — queryKey luôn gồm `organizationId` để cache không lẫn giữa các org khi chuyển đổi. Mutation dùng optimistic update cho các thao tác cần cảm giác mượt (reorder, toggle visibility/publish) — giữ đúng UX cũ (`pages/[slug]/page.tsx` bản cũ optimistic update rồi mới gọi server).
- **Form:** `react-hook-form` + `zod` resolver, schema khớp với DTO của BE.
- **Upload:** giữ pattern `ImageUploader`/`VideoUploader`/`AudioUploader` (`src/components/admin/*Uploader.tsx`) — chỉ đổi endpoint từ `/api/data/storage` sang `POST {API_URL}/media/upload`.
- **Rich text:** port `RichTextEditor.tsx` (Tiptap) làm form cho Element `richtext`.

## 3. Cấu trúc route (App Router)

```
apps/admin/src/app
  /login/page.tsx
  /select-org/page.tsx                      # hiện khi user thuộc >1 Organization
  /(protected)/layout.tsx                    # auth guard + OrgProvider + Sidebar/Topbar shell
  /(protected)/[orgSlug]/
    page.tsx                                 # Dashboard (Analytics)
    pages/page.tsx                           # Pages list (kind=STANDARD)
    pages/[pageId]/page.tsx                  # Page settings + Content tree editor
    blog/page.tsx                            # Bài viết list (kind=POST) — filter khác của Pages list
    blog/categories/page.tsx                 # Post categories
    media/page.tsx                           # Media library
    map/page.tsx                             # Map locations
    map/categories/page.tsx                  # Location categories
    settings/page.tsx                        # Organization settings + API keys + webhook
    members/page.tsx                         # Membership/RBAC
    activity-log/page.tsx
    block-types/page.tsx                     # Registry block/element (Phase 4)
  /(protected)/platform/                     # chỉ superAdmin, không scope theo org
    organizations/page.tsx                   # danh sách + tạo Organization mới
    users/page.tsx                           # danh sách User toàn hệ thống
```

Dùng `[orgSlug]` trong URL (không phải chỉ lưu trong state) để: (a) F5/chia sẻ link vẫn đúng org, (b) tách bạch rõ ràng dữ liệu của org nào đang xem, tránh bug "quên đổi context khi chuyển org".

## 4. Global shell

### 4.1. Sidebar (port từ `src/components/admin/Sidebar.tsx` + `AdminLayoutClient.tsx`)
- Nav item: Dashboard, Trang (Pages), Bài viết (Blog), Thư viện Media, Bản đồ, Thành viên, Nhật ký hoạt động, Cài đặt, (Loại Block — hiện có điều kiện theo quyền).
- Mobile: drawer trượt, giữ nguyên cơ chế cũ.
- Ẩn mục "Thành viên" nếu role hiện tại trong org là `EDITOR`/`VIEWER` (tương đương cách Sidebar cũ ẩn "Accounts" với non-admin).

### 4.2. Topbar
- **Org switcher** (mới, không có ở bản cũ vì bản cũ chỉ có 1 site): dropdown hiện tên + slug các Organization mà user hiện tại là thành viên, chọn xong điều hướng sang `/{orgSlug}/...` tương ứng. Nếu `isSuperAdmin`, có thêm mục "Quản lý nền tảng" dẫn tới `/platform/organizations`.
- User menu: tên, email, đổi mật khẩu, đăng xuất.

### 4.3. Auth guard
- `middleware.ts` kiểm tra access token (từ cookie httpOnly) hợp lệ; hết hạn → thử refresh token 1 lần; refresh cũng fail → redirect `/login`.
- Sau login: gọi `GET /auth/me` lấy danh sách Organization user thuộc về → nếu 1 org, redirect thẳng `/{orgSlug}`; nếu nhiều, vào `/select-org`; nếu 0 (user mới, chưa được mời vào org nào), hiện màn "Chưa thuộc tổ chức nào, liên hệ quản trị viên".

### 4.4. Pattern dùng chung nhiều nơi
- `ConfirmDialog` — 1 component dùng chung cho mọi hành động xoá (Page, ContentNode, Media, Member, Location, Category...), không viết riêng từng chỗ như 1 phần bản cũ đang làm rời rạc.
- `LocaleTabs` — component tab chọn ngôn ngữ đang sửa trong mọi form nội dung, đọc danh sách từ `OrganizationLocale` của org hiện tại (thay cho việc hard-code mảng 4 ngôn ngữ lặp lại ở nhiều nơi như bản cũ).
- `AutoTranslateButton` — 1 component/hook dùng chung gọi API dịch tự động cho 1 field hoặc cả object, thay vì mỗi màn tự cài đặt riêng (bản cũ có `translateContentObject`, `translateText`, `translateHTML` gọi rời rạc ở nhiều component).
- `AssetPicker` — dialog chọn ảnh/video từ Media Library HOẶC upload file mới, dùng lại ở mọi field kiểu ảnh (SEO image, cover image, ảnh trong Element...) thay vì mỗi form tự có uploader riêng như bản cũ.

## 5. Chi tiết từng màn hình

### 5.1. Login (`/login`)
- Form email + password, gọi `POST /auth/login`. Lỗi hiển thị inline (sai email/password, tài khoản bị khoá...).
- Không còn khái niệm "1 tài khoản admin cố định qua env" như bản cũ — đây là màn login thật cho mọi `User`.

### 5.2. Chọn Organization (`/select-org`)
- Grid các thẻ Organization user thuộc về: tên, slug/domain, role của user trong org đó, số Page đã tạo (nếu BE trả kèm để trang trí). Click vào → điều hướng `/{orgSlug}`.

### 5.3. Dashboard/Analytics (`/{orgSlug}`)
Port gần như nguyên bản từ `src/components/admin/analytics/{DashboardClient,AnalyticsCard,AnalyticsCharts,AnalyticsTable}.tsx`, chỉ đổi nguồn dữ liệu từ server action `getAnalyticsData()` sang `GET /organizations/:orgId/analytics?range=...`:
- Toolbar sticky chọn khoảng thời gian: Realtime / Hôm nay / 7 ngày / 30 ngày / Tuỳ chỉnh (date range picker).
- Grid KPI card — dùng đúng layout đã chỉnh gần đây (lưới 12 đơn vị ở `lg`, hàng cuối tự giãn đều nếu số card không chia hết cho 4; ở chế độ realtime giữ layout 6 cột 3+2 hiện có).
- Charts (recharts): traffic/users theo thời gian, tăng trưởng người dùng luỹ kế, tăng trưởng nội dung (Page/Post/MapLocation theo tháng), tỉ trọng theo quốc gia.
- Bảng top trang theo lượt xem + top theo lượt quét QR (tab chuyển đổi).

### 5.4. Pages list (`/{orgSlug}/pages`)
Port từ `src/app/admin/(protected)/pages/page.tsx`:
- Bảng: tiêu đề (theo locale mặc định của org), slug, trạng thái publish (switch inline), thứ tự, cập nhật lần cuối.
- Toolbar: nút "Thêm trang" (dialog nhập slug + title theo `LocaleTabs`), tìm kiếm theo tiêu đề/slug.
- Menu hành động mỗi hàng: Sửa cài đặt trang, Sửa nội dung (Content tree), Nhân bản (kèm toàn bộ cây `ContentNode`), Xoá (chặn xoá trang chủ — org có field đánh dấu `homePageId`/slug đặc biệt, tương đương chặn xoá slug `home` ở bản cũ), ẩn mục Xoá nếu role hiện tại không đủ quyền (`EDITOR` trở xuống).
- Kéo-thả sắp xếp `sortOrder` trực tiếp trên bảng (giữ UX cũ).

### 5.5. Page settings dialog/tab
Port từ `EditPageSettingsDialog.tsx` (824 dòng ở bản cũ — đầy đủ tính năng nhất, port cẩn thận):
- Form đa ngôn ngữ (qua `LocaleTabs`): slug, title, description, seoTitle, seoDescription, seoImage (qua `AssetPicker`).
- Nút Dịch tự động từng field và dịch tất cả 1 lần.
- Upload audio nền (`.mp3`) nếu Page có Element `hero` cần dùng.
- **Sub-navigation editor:** thêm/xoá/sắp xếp mục menu liên kết trong trang, mỗi mục trỏ tới 1 `ContentNode.id` cụ thể (dropdown liệt kê các Section/Element có thể làm anchor) + nhãn đa ngôn ngữ.
- **QR code generator:** giữ y hệt tính năng cũ — sinh URL kèm `?utm_source=qr&qr_id=...` theo từng locale, hiển thị/copy URL, xem/tải QR ảnh (dùng lại lib `qrcode`).

### 5.6. Content tree editor — màn quan trọng nhất (`/{orgSlug}/pages/[pageId]`, tab "Nội dung")

Đây là màn thay thế "chỉnh sửa blocks" cũ, giờ thao tác trên **cây `ContentNode` đa cấp** thay vì mảng phẳng `content_blocks`. Bố cục 3 vùng (desktop):

1. **Cây Section/Element (trái):** danh sách Section gốc của Page, mỗi Section thu gọn/mở rộng để thấy Element con (đệ quy). Kéo-thả bằng `@dnd-kit/core` + `@dnd-kit/sortable` (nâng cấp so với bản cũ — bản cũ dùng HTML5 DnD phẳng cho Section và không có drag cho item con; giờ cần kéo-thả đa cấp, tham khảo tinh thần prototype `/admin/blocks/builder` cũ về cách dùng `@dnd-kit` cho cây lồng nhau). Hỗ trợ: sắp xếp trong cùng cấp cha, kéo sang cha khác (đổi `parentId`) nếu `allowedChildren` của cha mới cho phép loại đó.
   - Mỗi node có menu hành động nhanh: sửa, xoá, nhân bản (kèm toàn bộ nhánh con), ẩn/hiện (`isVisible`), đổi tên hiển thị (`label`).
2. **Form chỉnh sửa node đang chọn (giữa):** 3 tab **Nội dung / Style / Animation** (kế thừa cấu trúc `BlockForm.tsx` + `BlockStylingForm` + prototype `AnimationPanel.tsx`):
   - Tab Nội dung: form field theo đúng `type` của node — nếu là 1 trong các type "chính thức" (12 Section + Element con theo `admin-rebuild-spec.md` mục 4.4.2), dùng form tay chuyên biệt (port từ `src/components/admin/block-forms/*.tsx`: `HeroForm`, `SplitForm`, `SplitCardsForm`, `MarqueeForm`, `QuoteBreakForm`, `VideoGridForm`, `CardGridForm`, `FeaturesStripForm`, `IntroForm`, `MapForm`, `IframeForm`, `ImageBannerForm`, cộng thêm form mới cho các Element con: `image`, `button`, `stat-card`, `info-card`, `mini-card`, `grid-card`, `video-item`, `feature-item`, `marquee-item`, `paragraph`, `tag`, `richtext`). Nếu là type tuỳ biến của org (chưa có form tay) → sinh form generic từ `jsonSchema` của `BlockTypeDefinition` (fallback, thay cho ô JSON thô của bản cũ).
   - Có `LocaleTabs` để chuyển ngôn ngữ đang sửa field, `AutoTranslateButton` để dịch field/toàn node.
   - Tab Style: dùng lại toàn bộ field của `BaseBlockStyleProps` (màu nền solid/gradient, màu chữ theo từng phần, căn lề, padding/margin theo preset hoặc px tự do, font family/weight/size, theme sáng/tối) — áp dụng cho `ContentNode.styles`.
   - Tab Animation: fade/slide (4 hướng)/scale/bounce/blur, delay/duration/trigger(load|scroll)/once — kế thừa từ `AnimationPanel.tsx` prototype, áp dụng cho `ContentNode.animation`.
3. **Live preview (phải):** iframe trỏ tới 1 route preview độc lập (tương đương `/preview-block` cũ) nhận dữ liệu qua `postMessage` mỗi khi form thay đổi, render bằng đúng component hiển thị công khai để WYSIWYG. Có nút chuyển kích thước xem trước (desktop/tablet/mobile) và mở rộng toàn màn hình.
- **Thêm Section mới:** nút "+" mở dialog gallery các layout preset (ảnh minh hoạ + mô tả, port từ `LAYOUT_OPTIONS` cũ) — chọn xong tạo `ContentNode` gốc với `defaultProps` tương ứng.
- **Thêm Element con vào 1 container:** nút "+" trong lòng node container, chỉ hiện các type nằm trong `allowedChildren` của node cha đó.
- **Mobile:** chuyển bố cục 3 vùng thành tab switcher Editor / Preview (giữ đúng UX cũ), cây node hiện dạng list cuộn kéo-thả đơn giản hơn (không cần preview song song).

### 5.7. Blog (`/{orgSlug}/blog`, `/{orgSlug}/blog/categories`)
- Danh sách bài viết = Pages list (5.4) lọc `kind=POST`, có thể tách thành route/tab riêng cho gọn UX biên tập viên (không bắt buộc dùng chung 1 bảng UI, miễn dữ liệu backend là `Page`).
- Khi tạo bài viết mới, tự động seed sẵn 1 `ContentNode` Element `richtext` để biên tập viên có chỗ gõ nội dung ngay (giữ cảm giác "soạn bài viết" quen thuộc thay vì phải tự thêm Section rồi Element).
- Category (port từ modal quản lý category trong `blogs/page.tsx` cũ): list, thêm/sửa/xoá, đa ngôn ngữ, auto-translate, sort order.
- Cài đặt trang danh sách blog (`OrganizationSetting.blog_settings`): `list_label`/`list_title`/`list_subtitle` đa ngôn ngữ — form riêng trong Settings hoặc modal ở trang Blog.

### 5.8. Media Library (`/{orgSlug}/media`) — mới, bản cũ không có UI thật cho việc này
- Grid ảnh/video/audio đã upload (thumbnail cho ảnh/video, icon cho audio/file), filter theo loại, tìm theo tên file.
- Upload: kéo-thả vùng trống hoặc nút chọn file, tiến trình upload hiển thị theo % .
- Click 1 item mở panel chi tiết: preview lớn, alt text theo `LocaleTabs`, kích thước/dung lượng/định dạng, ngày upload, nút xoá (cảnh báo rõ nếu API cho biết item đang được tham chiếu ở đâu đó — nếu BE Phase đầu chưa hỗ trợ kiểm tra usage thì chỉ cảnh báo chung "xoá có thể làm vỡ nội dung đang dùng ảnh này").
- Component này được tái sử dụng làm `AssetPicker` (mục 4.4) nhúng vào mọi field chọn ảnh trong hệ thống.

### 5.9. Map / Địa điểm di sản (`/{orgSlug}/map`, `/{orgSlug}/map/categories`)
Port từ `src/app/admin/(protected)/map/page.tsx`:
- Bảng: tên, toạ độ, category (badge), màu marker, trạng thái publish.
- Thêm/sửa (modal): tên+mô tả theo `LocaleTabs`, lat/lng, color picker 3 màu preset + tuỳ chỉnh, chọn category (kèm nút tạo nhanh category mới ngay trong dropdown), Google Maps URL override, liên kết tới 1 Page (select).
- Quản lý category: modal hoặc trang con riêng, CRUD + đa ngôn ngữ.

### 5.10. Settings (`/{orgSlug}/settings`)
- Thông tin chung: tên site, mô tả (theo `LocaleTabs`), contact email, social links, domain.
- Ngôn ngữ: bật/tắt từng `OrganizationLocale`, chọn locale mặc định (locale mặc định không được tắt).
- Tích hợp: GA4 property id, S3/CDN base URL riêng của org (nếu org tự có domain asset riêng).
- **API Keys** (mới, phục vụ Public Content API mục 5b của spec): list key đã cấp (tên, ngày tạo, lần dùng cuối), nút tạo key mới (hiện giá trị plaintext đúng 1 lần lúc tạo, sau đó chỉ hiện dạng ẩn), thu hồi key.
- **Webhook revalidate** (mục 8 của spec): URL + secret để hệ thống gọi khi có publish/thay đổi, nút "Test webhook".

### 5.11. Thành viên & phân quyền (`/{orgSlug}/members`) — thay "Accounts" cũ, giờ hoạt động thật
- Bảng thành viên: tên, email, role, ngày tham gia, nút đổi role (dropdown OWNER/ADMIN/EDITOR/VIEWER — chỉ OWNER/ADMIN thấy được dropdown này), nút xoá khỏi org (chặn xoá OWNER cuối cùng của org).
- Mời thành viên: nhập email + chọn role → nếu email đã có `User` trong hệ thống, tạo `Membership` ngay; nếu chưa có, tạo `User` mới kèm mật khẩu tạm hoặc luồng invite-qua-email (tuỳ Phase, ghi rõ trong UI trạng thái "chờ nhận lời mời" nếu áp dụng flow email).
- Mục riêng "Tài khoản của tôi": đổi tên hiển thị, đổi mật khẩu.

### 5.12. Nhật ký hoạt động (`/{orgSlug}/activity-log`)
Port từ `ActivityLogDetailsDialog.tsx` + `DataDiffViewer.tsx` cũ:
- Bảng: người thực hiện, hành động (CREATE/UPDATE/DELETE/PUBLISH...), loại đối tượng, thời gian, filter theo người dùng/loại đối tượng/khoảng thời gian.
- Click 1 dòng mở dialog xem diff `before`/`after` (dùng lại `DataDiffViewer` — hiển thị JSON diff dễ đọc).

### 5.13. Registry Block/Element (`/{orgSlug}/block-types`) — Phase 4
- Danh sách type hiện có, tách 2 nhóm: "Dùng chung toàn hệ thống" (global, chỉ superAdmin sửa được) và "Riêng của tổ chức này" (org tự tạo, ADMIN/OWNER sửa được).
- Tạo type mới: form `key`, `label`, `category`, `isContainer` (switch), `allowedChildren` (multi-select từ danh sách type khác), `jsonSchema` (code editor JSON có validate cú pháp), `defaultProps`/`defaultStyles` (JSON editor hoặc form sinh động từ chính `jsonSchema` vừa nhập).
- Xem trước: hiển thị thử form generic sẽ trông như thế nào trong Content tree editor khi ai đó dùng type này.

### 5.14. Quản lý nền tảng — chỉ superAdmin (`/platform/organizations`, `/platform/users`)
- Danh sách toàn bộ Organization (website) trong hệ thống: tên, slug, domain, trạng thái, số thành viên, ngày tạo.
- Tạo Organization mới: tên, slug, domain, defaultLocale + chọn các locale khác cần bật ngay → sau khi tạo, hệ thống tự seed toàn bộ `BlockTypeDefinition` global (đã có sẵn, không cần làm gì thêm) và cho phép mời ngay 1 `User` làm OWNER đầu tiên.
- Danh sách `User` toàn hệ thống (không scope theo org) — chủ yếu để hỗ trợ/khoá tài khoản khi cần.

## 6. Trạng thái loading/empty/error — áp dụng nhất quán mọi màn hình

- Loading: skeleton theo đúng hình dạng layout thật (không dùng spinner to giữa màn hình cho danh sách/bảng).
- Empty state: mỗi danh sách rỗng có minh hoạ + câu gọi hành động phù hợp (vd Pages rỗng → "Chưa có trang nào — Tạo trang đầu tiên").
- Error: toast cho lỗi thao tác (mutation), inline banner cho lỗi tải dữ liệu chính của trang (kèm nút thử lại).

## 7. Bảng tổng hợp route (tham chiếu nhanh)

| Route | Màn hình | Port từ (file cũ) |
|---|---|---|
| `/login` | Đăng nhập | `src/app/admin/login/LoginForm.tsx` |
| `/select-org` | Chọn Organization | mới |
| `/{orgSlug}` | Dashboard/Analytics | `src/components/admin/analytics/*` |
| `/{orgSlug}/pages` | Danh sách Page | `src/app/admin/(protected)/pages/page.tsx` |
| `/{orgSlug}/pages/[pageId]` | Cài đặt Page + Content tree editor | `EditPageSettingsDialog.tsx` + `pages/[slug]/page.tsx` + `BlockForm.tsx`/`block-forms/*` |
| `/{orgSlug}/blog`, `/blog/categories` | Bài viết & danh mục | `src/app/admin/(protected)/blogs/**` |
| `/{orgSlug}/media` | Thư viện Media | mới |
| `/{orgSlug}/map`, `/map/categories` | Bản đồ di sản | `src/app/admin/(protected)/map/page.tsx` |
| `/{orgSlug}/settings` | Cài đặt tổ chức + API Key + Webhook | `src/app/admin/(protected)/settings/page.tsx` (+ mới) |
| `/{orgSlug}/members` | Thành viên & phân quyền | `src/app/admin/(protected)/accounts/**` (làm lại phần backend thật) |
| `/{orgSlug}/activity-log` | Nhật ký hoạt động | `ActivityLogDetailsDialog.tsx`, `DataDiffViewer.tsx` |
| `/{orgSlug}/block-types` | Registry Block/Element | mới (Phase 4) |
| `/platform/organizations`, `/platform/users` | Quản lý nền tảng (superAdmin) | mới |
