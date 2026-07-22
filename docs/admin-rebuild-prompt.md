# Prompt để giao cho AI build Admin CMS mới (dùng kèm `admin-rebuild-spec.md` + `admin-frontend-spec.md`)

> **Cách dùng:** Mở 1 phiên làm việc AI coding agent (Claude Code, Cursor, v.v.) trong **1 repo mới, trống**, KHÔNG phải trong repo `vanhoacham-nextjs` hiện tại (vì hệ thống mới phải tách biệt hoàn toàn — xem mục 1 của spec). Đính kèm/copy nguyên văn **cả 2 file** `docs/admin-rebuild-spec.md` (kiến trúc dữ liệu + BE) và `docs/admin-frontend-spec.md` (màn hình/UI Admin) vào cùng phiên đó, sau đó copy toàn bộ nội dung bên dưới (từ dòng `---` đầu tiên) làm tin nhắn đầu tiên gửi cho AI. Nếu công cụ bạn dùng không hỗ trợ đính kèm file, dán luôn nội dung 2 file đó vào ngay phía trên prompt này trong cùng 1 tin nhắn.
>
> Nếu AI vẫn còn quyền đọc repo `vanhoacham-nextjs` gốc (cùng máy, cùng workspace) thì nói rõ đường dẫn để nó tham khảo/port UI — prompt bên dưới đã có mục riêng cho việc này.

---

## Bối cảnh & vai trò

Bạn là kỹ sư full-stack cấp senior, được giao xây dựng **từ đầu** một hệ thống Admin CMS đa tổ chức (multi-tenant), thay thế cho 1 hệ thống admin cũ (Next.js + Postgres trực tiếp) đang chỉ phục vụ 1 website. Toàn bộ yêu cầu có trong 2 file đính kèm — đó là nguồn sự thật duy nhất cho dự án này, không phải tài liệu tham khảo phụ:
- **`admin-rebuild-spec.md`** — kiến trúc tổng thể, mô hình dữ liệu (Prisma), module/endpoint BE, quyết định đã chốt.
- **`admin-frontend-spec.md`** — chi tiết từng màn hình/route/component/luồng thao tác của Admin frontend, kèm tham chiếu file gốc cần port từ repo cũ cho từng màn hình.

**Việc đầu tiên bạn phải làm: đọc toàn bộ cả 2 file trên từ đầu đến cuối trước khi viết bất kỳ dòng code nào.** Đặc biệt chú ý mục 12 của `admin-rebuild-spec.md` ("Quyết định đã chốt & điểm còn mở") — những gì đã chốt thì tuân theo tuyệt đối, không tự ý đổi kiến trúc; những điểm còn mở thì tự chọn theo khuyến nghị đã ghi trong đó (không cần hỏi lại) trừ khi bạn phát hiện lý do kỹ thuật rõ ràng khiến khuyến nghị đó không khả thi.

## Phạm vi công việc

Xây dựng đúng 2 ứng dụng trong 1 monorepo pnpm workspace mới (theo mục 10 của spec):

```
/apps
  /api      NestJS + Prisma + PostgreSQL
  /admin    Admin frontend — Next.js App Router
/packages
  /shared-types   DTO/type dùng chung API ↔ Admin
```

**Không** build website public (public content site) trong dự án này — mỗi website public là 1 dự án khác, ngoài phạm vi (mục 5b/10 của spec chỉ yêu cầu bạn *chừa sẵn* Public Content API để họ tích hợp sau, không cần bạn tự xây site tiêu thụ nó).

## Các nguyên tắc bắt buộc — không tự ý đổi

Đây là những điểm đã chốt quan trọng nhất trong spec, nhắc lại ở đây để không bị trôi khi code lâu dài:

1. **1 Organization = 1 website.** Không thêm tầng "Site" trung gian. Mọi bảng dữ liệu chính đều có `organizationId`.
2. **Nhiều Organization dùng chung 1 bộ Block/Section/Element registry toàn cục** (`BlockTypeDefinition.organizationId = null`). Một org có thể thêm type riêng (`organizationId` khác null) nhưng bộ mặc định phải seed sẵn theo đúng mục 4.4.1 + 4.4.2 của spec — **seed đủ toàn bộ 12 block type cũ và các Element/container con của chúng, đúng field, không được thiếu hay bịa thêm field không có trong spec.**
3. **Blog dùng chung `Page`/`ContentNode`** (`Page.kind = POST`), không tạo model `Post` riêng.
4. **`ContentNode` là cây tự tham chiếu** (`parentId`), không giới hạn độ sâu ở schema — Section (gốc) → container → Element (lá), đúng theo mục 4.3.
5. **Auth thật:** bcrypt cho password, JWT access token ngắn hạn + refresh token lưu hash trong DB, **không** nhúng org/role vào access token (role resolve lại theo `:orgId` mỗi request). RBAC 4 role: `OWNER/ADMIN/EDITOR/VIEWER` theo `Membership`.
6. **Tenant-scoping là bắt buộc tuyệt đối** ở mọi query — không được có bất kỳ chỗ nào query 1 bảng có `organizationId` mà thiếu điều kiện lọc theo org. Ưu tiên dùng Prisma Client Extension hoặc 1 base service bắt buộc filter, thay vì tin tưởng từng dev tự nhớ thêm `where`.
7. **Public Content API** (`/public/*`, xác thực bằng `X-Api-Key`, không dùng JWT) phải tách guard hoàn toàn khỏi Admin API — dù chưa có website nào gọi tới ngay, vẫn phải build đúng theo mục 5b.
8. **Bí mật/secret:** `.env.example` chỉ chứa placeholder, không bao giờ commit giá trị secret thật.

## Cách làm việc — bắt buộc theo từng Phase, không nhảy cóc

Đi theo đúng thứ tự Phase 0 → 4 ở mục 11 của spec (Phase 5 và 6 để sau, không cần làm trong đợt này trừ khi được yêu cầu thêm):

- **Trước khi bắt đầu 1 phase:** đọc lại đúng các mục liên quan trong spec, liệt kê ngắn gọn việc sẽ làm trong phase đó.
- **Trong khi làm:** ưu tiên đúng đắn và đầy đủ tính năng hơn là tốc độ; không thêm tính năng/module ngoài spec; không tự sáng tạo thêm field/entity nếu spec chưa nói tới — nếu thấy thiếu, dừng lại hỏi thay vì tự bịa.
- **Sau khi xong 1 phase:** đảm bảo project build được (`pnpm build` không lỗi), Prisma migrate chạy được từ schema sạch, có ít nhất smoke test hoặc hướng dẫn test thủ công (ví dụ: curl login, curl tạo page) chứng minh tính năng hoạt động thật — không chỉ "code xong nhìn có vẻ đúng". Viết tóm tắt ngắn: đã làm gì, cách chạy thử, việc gì còn lại trước khi báo đã xong phase.
- Ghi tiến độ vào 1 file `PROGRESS.md` ở root repo mới (phase nào xong, quyết định nào đã tự chọn cho các điểm "còn mở") — vì dự án này lớn, nhiều khả năng phải làm qua nhiều phiên làm việc khác nhau, `PROGRESS.md` giúp phiên sau không phải đọc lại toàn bộ code để biết đang ở đâu.

## Checklist tính năng cần đạt được (đối chiếu mục 2 của spec — không được thiếu)

Khi cho rằng Phase 1-4 đã hoàn tất, đối chiếu lại đủ các nhóm tính năng sau đang có ở hệ thống cũ (chi tiết từng field/entity xem mục 2, 4, 9 của spec):

- Quản lý Page: tạo/sửa/xoá/publish/duplicate/sắp xếp, đa ngôn ngữ động theo `OrganizationLocale` (không hard-code vi/en/ru/zh).
- Quản lý cây ContentNode: thêm/sửa/xoá/kéo-thả sắp xếp/nhân bản/đổi cha-con, cho từng Section lẫn Element con (ảnh, nút, card... sửa được từng cái riêng lẻ).
- 12 block/section gốc + toàn bộ Element con tương ứng theo đúng field ở mục 4.4.2 (kể cả style riêng từng field qua `TextElementStyle`, và **không** mang theo field `subtitle` chết của block `intro` — xem ghi chú bug trong mục 4.4.2 của spec).
- Media library thật (khác hệ thống cũ — hệ thống cũ có bảng `media` nhưng không dùng, phải sửa).
- Auto-translate (tương đương engine Gemini/Google Translate cũ) áp dụng được lên cấu trúc `content.i18n` mới.
- Blog (qua `Page.kind=POST`) + `PostCategory`.
- Map/địa điểm heritage (`MapLocation`, `LocationCategory`).
- Settings theo từng Organization.
- RBAC thật (Owner/Admin/Editor/Viewer) — khác hệ thống cũ (UI có nhưng backend giả).
- Activity log ghi thật ở service layer — khác hệ thống cũ (trigger DB đã chết, không ai ghi).
- Analytics: proxy GA4 theo từng org + thống kê nội dung nội bộ.
- Public Content API đầy đủ endpoint theo mục 5b.

## Yêu cầu kỹ thuật cụ thể

**Backend (`apps/api`):**
- NestJS, chia module đúng theo mục 5 của spec.
- Prisma schema bám sát mục 4 (được phép tinh chỉnh tên field/index nhỏ nếu có lý do kỹ thuật chính đáng, nhưng giữ đúng các model, quan hệ, và nguyên tắc tenant-scoping).
- Validate input bằng DTO (`class-validator`/`class-transformer`, hoặc `zod` + `nestjs-zod` nếu bạn thấy hợp với dự án hơn — chọn 1 cách nhất quán toàn bộ API, không trộn lẫn).
- Sinh Swagger/OpenAPI cho **toàn bộ** API, kể cả nhóm `/public/*` — để sau này team build website public dùng làm hợp đồng tích hợp.
- Script seed: 1 Organization mẫu, `OrganizationLocale` (vi/en/ru/zh), toàn bộ `BlockTypeDefinition` global theo mục 4.4.1/4.4.2, 1 `User` OWNER để đăng nhập thử.
- Test tối thiểu bắt buộc: (a) 1 test chứng minh org A **không** đọc/ghi được dữ liệu của org B qua cùng 1 endpoint (tenant-isolation), (b) 1 test luồng login → access token → refresh token → logout.

**Admin frontend (`apps/admin`):**
- Xây **đúng theo `admin-frontend-spec.md`** — file đó đã đặc tả sẵn: cấu trúc route (`/login`, `/select-org`, `/{orgSlug}/...`, `/platform/...`), global shell (Sidebar/Topbar/Org switcher/Auth guard), các component dùng chung bắt buộc (`ConfirmDialog`, `LocaleTabs`, `AutoTranslateButton`, `AssetPicker`), và chi tiết từng màn hình (Dashboard, Pages list, Page settings, **Content tree editor** — màn phức tạp nhất, Media Library, Blog, Map, Settings, Members/RBAC, Activity log, Block Type Registry, Platform admin) kèm bảng tham chiếu file gốc cần port cho từng màn. Không tự nghĩ lại cấu trúc màn hình khác đi trừ khi phát hiện lý do kỹ thuật buộc phải đổi.
- Next.js App Router, gọi API qua REST (TanStack Query — đã chỉ định trong `admin-frontend-spec.md` mục 2, dùng nhất quán không trộn SWR), JWT lưu theo cách an toàn (httpOnly cookie qua route proxy, hoặc access token trong memory + refresh qua cookie httpOnly — tránh lưu access token trong localStorage).
- **Tận dụng UI đã có sẵn** thay vì viết lại từ đầu: nếu bạn có quyền đọc repo `vanhoacham-nextjs` gốc, port đúng theo bảng "Port từ (file cũ)" ở cuối `admin-frontend-spec.md` (mục 7) cho từng route — đây là danh sách chính xác, ưu tiên dùng thay vì tự dò tìm lại trong repo cũ. Nếu bạn **không** có quyền truy cập repo gốc trong phiên làm việc này, tự dựng UI tương đương từ đầu bằng shadcn/tailwind theo đúng mô tả tính năng trong `admin-frontend-spec.md` — không cần giống pixel-by-pixel, nhưng phải đủ tính năng và đúng luồng thao tác đã mô tả.
- Màn **Content tree editor** (mục 5.6 của `admin-frontend-spec.md`) là trọng tâm — bố cục 3 vùng (cây node kéo-thả đa cấp bằng `@dnd-kit` / form Content-Style-Animation / live preview iframe qua `postMessage`) — làm cẩn thận, đây là màn biên tập viên dùng nhiều nhất.

## Việc KHÔNG được làm

- Không tự thêm tầng "Site" giữa Organization và Page.
- Không tách Blog thành model riêng ngoài `Page`.
- Không bỏ qua tenant-scoping ở bất kỳ query nào, kể cả "tạm thời cho nhanh".
- Không commit giá trị secret thật vào bất kỳ file `.env*` nào.
- Không tự sáng tạo thêm block/element type ngoài danh sách ở mục 4.4.1/4.4.2 trong giai đoạn build core (Phase 0-3) — cơ chế cho phép org tự tạo type mới là việc của Phase 4, không phải lúc seed dữ liệu gốc.
- Không build hoặc giả định thay cho website public — chỉ cần API đúng hợp đồng mục 5b là đủ.

## Bắt đầu

1. Đọc toàn bộ `admin-rebuild-spec.md` và `admin-frontend-spec.md`.
2. Tóm tắt lại (ngắn gọn) cách bạn hiểu kiến trúc tổng thể + cấu trúc màn hình Admin, và kế hoạch cho Phase 0, để xác nhận trước khi code.
3. Khởi tạo monorepo (pnpm workspace, NestJS CLI cho `apps/api`, Next.js cho `apps/admin`), viết Prisma schema đầy đủ theo mục 4, chạy migration đầu tiên, dựng `AuthModule` thật, seed 1 Organization mẫu.
4. Báo cáo kết quả Phase 0 kèm hướng dẫn chạy thử trước khi sang Phase 1.
