import { writeFileSync } from 'fs';

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Văn hóa Chăm — Khánh Hòa · Di sản sống</title>
  <meta name="description" content="Di sản sống trong dòng chảy Việt Nam — hành trình khám phá văn hóa Chăm tại Khánh Hòa.">
  <link rel="icon" href="assets/images/site-favicon.jpg">
  <link rel="stylesheet" href="assets/css/styles-v2.css">
</head>
<body>

  <!-- HEADER -->
  <header class="site-header" data-header>
    <a class="brand" href="#hero" aria-label="Về trang chủ">
      <span class="brand-kicker">Khánh Hòa</span>
      <span class="brand-name">Văn hóa Chăm</span>
    </a>
    <button class="nav-toggle" type="button" aria-label="Mở menu" aria-expanded="false">
      <span></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Điều hướng chính">
      <a href="#hero">Trang chủ</a>
      <a href="#khong-gian">Không gian</a>
      <a href="#thap-cham">Tháp Chăm</a>
      <a href="#di-san">Di sản</a>
      <a href="#hanh-trinh">Hành trình</a>
      <a href="#video">Video</a>
      <a href="#hanh-trinh" class="nav-cta">Khám phá ngay</a>
    </nav>
  </header>

  <!-- Hidden nav for SEO -->
  <nav class="sr-only" aria-label="Di tích Chăm nổi bật">
    <a href="#thap-cham">Tháp Ponagar</a>
    <a href="#thap-cham">Tháp Po Klong Garai</a>
    <a href="#thap-cham">Tháp Hòa Lai</a>
    <a href="#bao-ton">Bảo tàng Tỉnh</a>
  </nav>

  <main>

    <!-- ══════════════════════════════════════════════════════
         HERO
    ══════════════════════════════════════════════════════ -->
    <section class="hero" id="hero" aria-labelledby="hero-h1">
      <div class="hero-visual" aria-hidden="true">
        <img src="assets/images/hero-tower.jpg" alt="" class="hero-img">
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-body" data-reveal>
        <p class="hero-dateline">Khánh Hòa · Việt Nam · 2026</p>
        <h1 id="hero-h1">Văn hóa<br>Chăm</h1>
        <p class="hero-deck">Di sản sống trong dòng chảy Việt Nam</p>
        <div class="hero-actions">
          <a href="#khong-gian" class="btn-primary">Khám phá di sản →</a>
          <a href="#video" class="btn-outline">Xem video</a>
        </div>
      </div>

      <div class="hero-scroll-cue" aria-hidden="true">
        <span>Cuộn xuống</span>
        <svg width="1" height="40" viewBox="0 0 1 40"><line x1="0.5" y1="0" x2="0.5" y2="40" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════
         FEATURES STRIP  (Mapi "Our Unique Point")
    ══════════════════════════════════════════════════════ -->
    <div class="features-strip" aria-label="Giá trị cốt lõi của di sản Chăm">
      <div class="features-inner">
        <div class="feature-item">
          <div class="feature-icon" aria-hidden="true">🏯</div>
          <div class="feature-text">
            <strong>Kiến trúc ngàn năm</strong>
            <span>Tháp Chăm linh thiêng</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon" aria-hidden="true">🎭</div>
          <div class="feature-text">
            <strong>Di sản sống</strong>
            <span>Lễ hội &amp; nghệ thuật</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon" aria-hidden="true">🎨</div>
          <div class="feature-text">
            <strong>Làng nghề truyền thống</strong>
            <span>Gốm Bàu Trúc · Dệt Mỹ Nghiệp</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon" aria-hidden="true">🌿</div>
          <div class="feature-text">
            <strong>Bảo tồn bền vững</strong>
            <span>Cộng đồng làm chủ di sản</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         MARQUEE #1  (gold band)
    ══════════════════════════════════════════════════════ -->
    <div class="marquee-band" aria-hidden="true">
      <div class="marquee-inner">
        <span class="marquee-item">Văn hóa Chăm · Khánh Hòa 2026</span>
        <span class="marquee-item">Di sản sống · Lễ hội Katê</span>
        <span class="marquee-item">Tháp Bà Ponagar · Pô Klong Garai</span>
        <span class="marquee-item">Gốm Bàu Trúc · Dệt Mỹ Nghiệp</span>
        <span class="marquee-item">Chào mừng Ngày hội Văn hóa Chăm lần thứ VI</span>
        <span class="marquee-item">Văn hóa Chăm · Khánh Hòa 2026</span>
        <span class="marquee-item">Di sản sống · Lễ hội Katê</span>
        <span class="marquee-item">Tháp Bà Ponagar · Pô Klong Garai</span>
        <span class="marquee-item">Gốm Bàu Trúc · Dệt Mỹ Nghiệp</span>
        <span class="marquee-item">Chào mừng Ngày hội Văn hóa Chăm lần thứ VI</span>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         INTRO SECTION  (large pull quote)
    ══════════════════════════════════════════════════════ -->
    <div class="intro-section">
      <div data-reveal>
        <p class="sr-only">Văn hóa Chăm là một phần đặc sắc trong nền văn hóa Việt Nam thống nhất và đa dạng.</p>
        <p class="sr-only">"Chào mừng Lễ Khai mạc Ngày hội Văn hóa dân tộc Chăm lần thứ VI năm 2026, tại tỉnh Khánh Hòa"</p>
        <p class="intro-label">Tinh hoa di sản</p>
        <p class="intro-pull">Mỗi lễ hội, mỗi điệu múa, mỗi tiếng trống Ginăng — là cách cộng đồng kể lại ký ức, niềm tin và bản sắc của mình.</p>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         CHAPTER 01 — Không gian văn hóa Chăm
    ══════════════════════════════════════════════════════ -->
    <section class="chapter chapter-alt" id="khong-gian">
      <div class="editorial-split">

        <div class="ed-photo side-left" data-reveal>
          <figure class="fill-fig">
            <img src="assets/images/ponagar-wide.jpg" alt="Không gian tháp Chăm tại Khánh Hòa" data-parallax="10">
          </figure>
        </div>

        <div class="ed-text chapter-alt" data-reveal>
          <header class="ch-hd">
            <span class="ch-num" aria-hidden="true">01</span>
            <span class="section-label">LỊCH SỬ &amp; VĂN HÓA</span>
          </header>
          <h2>Không gian văn hóa Chăm</h2>
          <p class="ch-deck">Từ miền tháp nắng đến cộng đồng hôm nay</p>
          <div class="body-copy">
            <p>Không gian văn hóa Chăm trải dài qua nhiều vùng đất, đặc biệt là các địa phương có cộng đồng Chăm sinh sống như Khánh Hòa, Gia Lai, Đắk Lắk, Lâm Đồng, Tây Ninh, An Giang và TP. Hồ Chí Minh. Mỗi vùng mang một sắc thái riêng, tạo nên bức tranh văn hóa đa dạng giữa miền núi, đồng bằng, duyên hải và Nam Bộ.</p>
            <p>Trong không gian ấy, Khánh Hòa được nhấn mạnh như một địa bàn giàu dấu ấn Chăm với những di sản tiêu biểu như Tháp Bà Ponagar, không gian Xóm Bóng, các lễ hội, làng nghề và hoạt động giao lưu văn hóa. Đây là nơi di sản không chỉ được nhìn ngắm, mà còn được thực hành, trình diễn, trao truyền và giới thiệu tới công chúng trong nước, quốc tế.</p>
          </div>
          <blockquote class="inline-pq">
            <p>"Di sản không chỉ được nhìn ngắm, mà còn được thực hành, trình diễn, trao truyền."</p>
          </blockquote>
        </div>

      </div>

      <div class="gamma-triptych" data-reveal-group>
        <figure>
          <img src="assets/images/culture-space.jpg" alt="Chức sắc Chăm thực hiện nghi thức áo choàng" data-parallax="8">
        </figure>
        <figure>
          <img src="assets/images/tower-detail-01.jpg" alt="Cộng đồng trong lễ hội sau nghi thức tại tháp" data-parallax="12">
        </figure>
        <figure>
          <img src="assets/images/tower-detail-02.jpg" alt="Lễ tế truyền thống trong không gian văn hóa Chăm" data-parallax="16">
        </figure>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════
         MARQUEE #2  (dark band)
    ══════════════════════════════════════════════════════ -->
    <div class="marquee-band band-dark slow" aria-hidden="true">
      <div class="marquee-inner">
        <span class="marquee-item">Tháp Bà Ponagar</span>
        <span class="marquee-item">Pô Klong Garai</span>
        <span class="marquee-item">Tháp Hòa Lai</span>
        <span class="marquee-item">Lễ hội Katê</span>
        <span class="marquee-item">Múa Apsara</span>
        <span class="marquee-item">Gốm Bàu Trúc</span>
        <span class="marquee-item">Dệt thổ cẩm Mỹ Nghiệp</span>
        <span class="marquee-item">Trống Ginăng &amp; Baranưng</span>
        <span class="marquee-item">Kèn Saranai</span>
        <span class="marquee-item">Đàn Kanhi</span>
        <span class="marquee-item">Tháp Bà Ponagar</span>
        <span class="marquee-item">Pô Klong Garai</span>
        <span class="marquee-item">Tháp Hòa Lai</span>
        <span class="marquee-item">Lễ hội Katê</span>
        <span class="marquee-item">Múa Apsara</span>
        <span class="marquee-item">Gốm Bàu Trúc</span>
        <span class="marquee-item">Dệt thổ cẩm Mỹ Nghiệp</span>
        <span class="marquee-item">Trống Ginăng &amp; Baranưng</span>
        <span class="marquee-item">Kèn Saranai</span>
        <span class="marquee-item">Đàn Kanhi</span>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         CHAPTER 02 — Tháp Chăm  (fullscreen dark feature)
    ══════════════════════════════════════════════════════ -->
    <section class="chapter chapter-feature chapter-tower" id="thap-cham">
      <div class="feature-bg" aria-hidden="true">
        <img src="assets/images/intangible-01.jpg" alt="">
      </div>
      <div class="feature-shell">

        <div class="feature-copy" data-reveal>
          <header class="ch-hd">
            <span class="ch-num" aria-hidden="true">02</span>
            <span class="section-label">KIẾN TRÚC &amp; TÍN NGƯỠNG</span>
          </header>
          <h2>Tháp Chăm</h2>
          <p class="ch-deck">Ký ức bằng gạch đỏ và niềm tin</p>
          <div class="body-copy two-col">
            <p>Tháp Chăm là biểu tượng nổi bật của di sản văn hóa Chăm. Những công trình như Tháp Bà Ponagar, Pô Klong Garai và các cụm tháp Chăm trên dải duyên hải miền Trung không chỉ có giá trị kiến trúc, mỹ thuật, mà còn là không gian linh thiêng gắn với tín ngưỡng, huyền thoại và đời sống tinh thần của cộng đồng.</p>
            <p>Mỗi ngọn tháp là một "bảo tàng mở" lưu giữ dấu ấn của kỹ thuật xây dựng, nghệ thuật tạo hình, biểu tượng thần linh và ký ức cộng đồng. Bảo tồn tháp Chăm không chỉ là tu bổ vật chất công trình, mà còn cần gìn giữ bối cảnh văn hóa xung quanh: nghi lễ, lễ hội, câu chuyện dân gian, sinh hoạt cộng đồng và cách người Chăm tiếp tục gắn bó với di sản của mình.</p>
          </div>
        </div>

        <div class="chapter-collage" data-reveal-group>
          <figure class="collage-a">
            <img src="assets/images/intangible-01.jpg" alt="Hoàng hôn trên di tích Tháp Bà Pô Nagar" data-parallax="12">
          </figure>
          <figure class="collage-b">
            <img src="assets/images/intangible-02.jpg" alt="Tháp Pô Klong Garai — di tích quốc gia đặc biệt" data-parallax="16">
          </figure>
          <figure class="collage-wide">
            <img src="assets/images/intangible-03.jpg" alt="Tháp Hòa Lai — kiến trúc Chăm cổ kính" data-parallax="20">
          </figure>
        </div>

      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════
         CHAPTER 03 — Di sản phi vật thể
    ══════════════════════════════════════════════════════ -->
    <section class="chapter" id="di-san">

      <div class="ch-intro-wide" data-reveal>
        <header class="ch-hd">
          <span class="ch-num" aria-hidden="true">03</span>
          <span class="section-label">DI SẢN PHI VẬT THỂ</span>
        </header>
        <h2>Di sản phi vật thể</h2>
        <p class="ch-deck">Lễ hội, âm nhạc và bàn tay nghệ nhân</p>
      </div>

      <div class="essay-body" data-reveal>
        <div class="body-copy">
          <p>Văn hóa Chăm tỏa sáng mạnh mẽ qua các di sản phi vật thể: lễ hội Katê, dân ca, dân vũ, múa quạt, múa đội nước, múa đội lửa, múa Apsara, múa trống, múa khăn, cùng hệ thống nhạc cụ truyền thống như trống Ginăng, trống Baranưng, kèn Saranai, đàn Kanhi, chiêng và chập chõa.</p>
          <p>Bên cạnh nghệ thuật trình diễn, các làng nghề như gốm Bàu Trúc, dệt thổ cẩm Mỹ Nghiệp cũng là những "mạch sống" quan trọng của di sản. Ở đó, nghệ nhân không chỉ làm ra sản phẩm, mà còn giữ lại tri thức, kỹ năng, thẩm mỹ và ký ức nghề truyền qua nhiều thế hệ. Di sản Chăm vì vậy cần được bảo tồn bằng cách tôn vinh nghệ nhân, tạo không gian thực hành, hỗ trợ truyền nghề và đưa các giá trị truyền thống đến gần hơn với công chúng trẻ.</p>
        </div>
        <ul class="tag-grid" aria-label="Giá trị di sản phi vật thể">
          <li>Nghề truyền thống</li>
          <li>Bảo tồn tri thức</li>
          <li>Tôn vinh nghệ nhân</li>
          <li>Tiếp cận công chúng</li>
          <li>Lễ hội Katê</li>
          <li>Gốm Bàu Trúc</li>
          <li>Dệt Mỹ Nghiệp</li>
        </ul>
      </div>

    </section>

    <!-- ══════════════════════════════════════════════════════
         CHAPTER 04 — Du lịch di sản
    ══════════════════════════════════════════════════════ -->
    <section class="chapter chapter-alt" id="du-lich">
      <div class="cine-split">

        <div class="cine-text" data-reveal>
          <header class="ch-hd">
            <span class="ch-num" aria-hidden="true">04</span>
            <span class="section-label">DU LỊCH DI SẢN</span>
          </header>
          <h2>Văn hóa Chăm trong du lịch di sản</h2>
          <p class="ch-deck">Phát huy giá trị di sản</p>
          <div class="body-copy">
            <p>Văn hóa Chăm có tiềm năng lớn để phát triển du lịch di sản thông qua các tuyến tham quan tháp cổ, làng nghề, lễ hội, trình diễn nghệ thuật, trải nghiệm ẩm thực và giao lưu cộng đồng. Những giá trị như Tháp Bà Ponagar, Pô Klong Garai, gốm Bàu Trúc, dệt Mỹ Nghiệp, âm nhạc và múa dân gian có thể trở thành điểm nhấn hấp dẫn đối với du khách trong nước và quốc tế.</p>
            <p>Tuy nhiên, phát triển du lịch cần đi cùng bảo tồn bền vững: tôn trọng không gian thiêng, tránh thương mại hóa quá mức, bảo đảm quyền tham gia và lợi ích của cộng đồng Chăm. Du lịch chỉ thật sự có giá trị khi giúp di sản được hiểu đúng, được gìn giữ tốt hơn và mang lại sinh kế chính đáng cho người dân.</p>
          </div>
        </div>

        <div class="cine-mosaic" data-reveal-group>
          <figure class="cm-tall">
            <img src="assets/images/heritage-tour-01.jpg" alt="Nghi lễ Kareh mở ra trải nghiệm văn hóa Chăm" data-parallax="12">
          </figure>
          <figure class="cm-sm">
            <img src="assets/images/heritage-tour-02.jpg" alt="Nghệ nhân giới thiệu sản phẩm gốm truyền thống" data-parallax="18">
          </figure>
          <figure class="cm-sm">
            <img src="assets/images/heritage-tour-03.jpg" alt="Nghệ nhân biểu diễn trống Ginăng trong lễ Katê" data-parallax="10">
          </figure>
          <figure class="cm-sm">
            <img src="assets/images/tour-card-01.jpg" alt="Theo dấu tháp cổ trong hành trình du lịch Chăm" data-parallax="16">
          </figure>
          <figure class="cm-sm">
            <img src="assets/images/tour-card-02.jpg" alt="Trải nghiệm di sản sống của cộng đồng Chăm" data-parallax="12">
          </figure>
          <figure class="cm-sm">
            <img src="assets/images/tour-card-03.jpg" alt="Du khách cùng gìn giữ bản sắc văn hóa Chăm" data-parallax="18">
          </figure>
        </div>

      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════
         QUOTE BREAK
    ══════════════════════════════════════════════════════ -->
    <div class="quote-break">
      <div class="qb-inner" data-reveal>
        <blockquote>
          <p>Di sản Chăm chỉ thật sự sống khi cộng đồng được tham gia, tự hào và hưởng lợi từ chính giá trị văn hóa của mình. Bảo tồn không phải để giữ quá khứ trong khuôn khổ tĩnh, mà để văn hóa Chăm tiếp tục hiện diện, kể chuyện và tỏa sáng trong đời sống hôm nay.</p>
        </blockquote>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         CHAPTER 05 — Bảo tồn và phát huy
    ══════════════════════════════════════════════════════ -->
    <section class="chapter chapter-dark" id="bao-ton">
      <div class="editorial-split editorial-flip">

        <div class="ed-text chapter-dark" data-reveal>
          <header class="ch-hd">
            <span class="ch-num" aria-hidden="true">05</span>
            <span class="section-label">PHÁT HUY GIÁ TRỊ</span>
          </header>
          <h2>Bảo tồn và phát huy</h2>
          <p class="ch-deck">Để sắc màu Chăm tiếp tục tỏa sáng</p>
          <div class="body-copy">
            <p>Bảo tồn văn hóa Chăm trong thời kỳ mới cần được nhìn từ góc độ phát triển bền vững: giữ gìn bản sắc, tôn trọng cộng đồng chủ thể, đồng thời tạo điều kiện để di sản tham gia vào giáo dục, du lịch văn hóa, truyền thông số và giao lưu sáng tạo. Di sản chỉ thật sự sống khi cộng đồng được tham gia, được tự hào và được hưởng lợi từ chính giá trị văn hóa của mình.</p>
          </div>
        </div>

        <div class="ed-photo side-right" data-reveal>
          <figure class="fill-fig">
            <img src="assets/images/preserve-wide.jpg" alt="Khai mạc Lễ hội Tháp Bà Pô Nagar với trình diễn nghệ thuật Chăm" data-parallax="16">
          </figure>
        </div>

      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════
         CHAPTER 06 — Hành trình du lịch
    ══════════════════════════════════════════════════════ -->
    <section class="chapter" id="hanh-trinh">

      <div class="ch-intro-wide" data-reveal>
        <header class="ch-hd">
          <span class="ch-num" aria-hidden="true">06</span>
          <span class="section-label">HÀNH TRÌNH TRẢI NGHIỆM</span>
        </header>
        <h2>Hành trình du lịch</h2>
        <p class="ch-deck">Ba chặng — một di sản</p>
      </div>

      <div class="journey-grid" data-reveal-group>
        <article class="jcard">
          <div class="jcard-body">
            <span class="jcard-num" aria-hidden="true">I</span>
            <h3>Theo dấu tháp cổ</h3>
            <p>Khám phá những công trình tháp Chăm linh thiêng, nơi lưu giữ ký ức lịch sử, tín ngưỡng và dấu ấn kiến trúc đặc sắc.</p>
          </div>
        </article>
        <article class="jcard">
          <div class="jcard-body">
            <span class="jcard-num" aria-hidden="true">II</span>
            <h3>Chạm vào di sản sống</h3>
            <p>Trải nghiệm làng nghề, lễ hội, âm nhạc, trang phục và đời sống cộng đồng Chăm trong không gian văn hóa bản địa.</p>
          </div>
        </article>
        <article class="jcard">
          <div class="jcard-body">
            <span class="jcard-num" aria-hidden="true">III</span>
            <h3>Cùng gìn giữ bản sắc</h3>
            <p>Mỗi điểm đến không chỉ để tham quan, mà còn để hiểu, trân trọng và chung tay bảo tồn giá trị văn hóa Chăm hôm nay.</p>
          </div>
        </article>
      </div>

      <div class="journey-story" data-reveal>
        <p>Hành trình du lịch văn hóa Chăm tại Khánh Hòa mở ra chuyến đi từ Tháp Bà Pô Nagar linh thiêng bên sông Cái đến những không gian tháp cổ, làng nghề và lễ hội giàu bản sắc. Du khách được chiêm ngưỡng kiến trúc gạch đỏ, lắng nghe câu chuyện về Mẹ xứ sở, theo dấu Pô Klong Garai, rồi chạm vào đời sống di sản qua gốm Bàu Trúc và dệt thổ cẩm Mỹ Nghiệp. Nếu đến đúng mùa Katê, hành trình trở thành cuộc gặp gỡ với âm nhạc, nghi lễ và cộng đồng. Đây không chỉ là chuyến tham quan, mà là trải nghiệm học cách hiểu, tôn trọng và cùng gìn giữ văn hóa Chăm.</p>
      </div>

    </section>

    <!-- ══════════════════════════════════════════════════════
         VIDEO
    ══════════════════════════════════════════════════════ -->
    <section class="chapter chapter-alt" id="video">

      <div class="ch-intro-wide" data-reveal>
        <span class="section-label">THƯ VIỆN VIDEO</span>
        <h2>Thư viện Video</h2>
        <p class="ch-deck">Nhìn gần hơn — nghe sâu hơn</p>
      </div>

      <div class="video-grid">

        <article class="vcard" data-reveal>
          <div class="video-embed-wrap">
            <button class="video-trigger" type="button" data-video-embed="https://www.youtube.com/embed/5PpEvxas5SQ" aria-label="Phát video: Khám phá vẻ đẹp di sản tháp Chăm ở Khánh Hòa | THDT">
              <img src="https://i.ytimg.com/vi/5PpEvxas5SQ/hqdefault.jpg" alt="Xem video: Khám phá vẻ đẹp di sản tháp Chăm ở Khánh Hòa | THDT" loading="lazy">
              <span class="video-play" aria-hidden="true">▶</span>
            </button>
          </div>
          <div class="vcard-info">
            <span class="vcard-tag">YouTube</span>
            <h3>Khám phá vẻ đẹp di sản tháp Chăm ở Khánh Hòa | THDT</h3>
            <p class="vcard-sub">Góc nhìn của Đài Phát thanh Truyền hình Đồng Tháp về di sản kiến trúc Chăm tại Khánh Hòa.</p>
          </div>
        </article>

        <article class="vcard" data-reveal>
          <div class="video-embed-wrap">
            <button class="video-trigger" type="button" data-video-embed="https://www.youtube.com/embed/9h-tyEmgZnM" aria-label="Phát video: Kiến trúc Chăm ở tháp bà Ponagar">
              <img src="https://i.ytimg.com/vi/9h-tyEmgZnM/hqdefault.jpg" alt="Xem video: Kiến trúc Chăm ở tháp bà Ponagar" loading="lazy">
              <span class="video-play" aria-hidden="true">▶</span>
            </button>
          </div>
          <div class="vcard-info">
            <span class="vcard-tag">YouTube</span>
            <h3>Kiến trúc Chăm ở tháp bà Ponagar</h3>
            <p class="vcard-sub">Nét đặc sắc trong kiến trúc và điêu khắc của Tháp Bà Ponagar — di tích Chăm nổi tiếng nhất Việt Nam.</p>
          </div>
        </article>

        <article class="vcard" data-reveal>
          <div class="video-embed-wrap">
            <button class="video-trigger" type="button" data-video-embed="https://www.youtube.com/embed/qGi_Rad7vHQ" aria-label="Phát video: Lễ hội Katê - di sản văn hóa phi vật thể của người Chăm">
              <img src="https://i.ytimg.com/vi/qGi_Rad7vHQ/hqdefault.jpg" alt="Xem video: Lễ hội Katê - di sản văn hóa phi vật thể của người Chăm" loading="lazy">
              <span class="video-play" aria-hidden="true">▶</span>
            </button>
          </div>
          <div class="vcard-info">
            <span class="vcard-tag">YouTube</span>
            <h3>Lễ hội Katê - di sản văn hóa phi vật thể của người Chăm</h3>
            <p class="vcard-sub">Lễ hội lớn nhất, đặc sắc nhất của người Chăm — được công nhận di sản văn hóa phi vật thể quốc gia.</p>
          </div>
        </article>

        <article class="vcard" data-reveal>
          <div class="video-embed-wrap">
            <button class="video-trigger" type="button" data-video-embed="https://www.youtube.com/embed/z-7iCxVyav0" aria-label="Phát video: Khám phá nguồn gốc và văn hóa Dân tộc Chăm">
              <img src="https://i.ytimg.com/vi/z-7iCxVyav0/hqdefault.jpg" alt="Xem video: Khám phá nguồn gốc và văn hóa Dân tộc Chăm" loading="lazy">
              <span class="video-play" aria-hidden="true">▶</span>
            </button>
          </div>
          <div class="vcard-info">
            <span class="vcard-tag">YouTube</span>
            <h3>Khám phá nguồn gốc và văn hóa Dân tộc Chăm</h3>
            <p class="vcard-sub">Hành trình khám phá lịch sử, nguồn gốc và những nét văn hóa độc đáo của dân tộc Chăm.</p>
          </div>
        </article>

      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════
         CLOSING — Số hóa
    ══════════════════════════════════════════════════════ -->
    <section class="chapter" id="so-hoa">
      <div class="closing-layout" data-reveal>

        <div class="closing-text">
          <header class="ch-hd">
            <span class="section-label">KỶ NGUYÊN SỐ</span>
          </header>
          <h2>Lan tỏa di sản Chăm trong kỷ nguyên số</h2>
          <div class="body-copy">
            <p>Trong thời kỳ mới, văn hóa Chăm cần được lan tỏa qua các hình thức gần gũi như website, bản đồ số, triển lãm số, phim tư liệu, thư viện hình ảnh, video ngắn, thuyết minh đa ngôn ngữ và chương trình giáo dục di sản.</p>
            <p>Số hóa không thay thế di sản gốc, mà giúp di sản được lưu trữ, tiếp cận và lan tỏa rộng hơn. Khi tháp cổ, lễ hội, âm nhạc, làng nghề và câu chuyện cộng đồng được trình bày sinh động trên môi trường số, văn hóa Chăm sẽ đến gần hơn với thế hệ trẻ, du khách và bạn bè quốc tế.</p>
          </div>
          <p class="closing-sig">Sắc màu Chăm – Di sản sống, tỏa sáng cùng thời gian.</p>
        </div>

        <div class="closing-gallery">
          <figure class="closing-hero-image">
            <img src="assets/images/closing-wide.jpg" alt="Tháp Bà Pô Nagar bên sông Cái trong ánh chiều" data-parallax="18">
          </figure>
        </div>

      </div>
    </section>

  </main>

  <!-- ══════════════════════════════════════════════════════
       MARQUEE #3 before footer (Mapi style)
  ══════════════════════════════════════════════════════ -->
  <div class="marquee-band" aria-hidden="true">
    <div class="marquee-inner">
      <span class="marquee-item">Sắc màu Chăm</span>
      <span class="marquee-item">Di sản sống</span>
      <span class="marquee-item">Tỏa sáng cùng thời gian</span>
      <span class="marquee-item">Khánh Hòa 2026</span>
      <span class="marquee-item">Ngày hội Văn hóa Chăm lần thứ VI</span>
      <span class="marquee-item">Sắc màu Chăm</span>
      <span class="marquee-item">Di sản sống</span>
      <span class="marquee-item">Tỏa sáng cùng thời gian</span>
      <span class="marquee-item">Khánh Hòa 2026</span>
      <span class="marquee-item">Ngày hội Văn hóa Chăm lần thứ VI</span>
    </div>
  </div>

  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <p class="foot-brand">Văn hóa Chăm · Khánh Hòa</p>
        <p class="foot-tagline">Di sản sống trong dòng chảy Việt Nam</p>
        <nav class="foot-nav" aria-label="Điều hướng footer">
          <a href="#hero">Trang chủ</a>
          <a href="#khong-gian">Không gian</a>
          <a href="#thap-cham">Tháp Chăm</a>
          <a href="#di-san">Di sản</a>
          <a href="#hanh-trinh">Hành trình</a>
          <a href="#video">Video</a>
        </nav>
      </div>
      <p class="foot-credit">Lưu trữ di sản số · 2026</p>
    </div>
  </footer>

  <!-- Image lightbox -->
  <dialog class="media-lightbox" data-lightbox aria-label="Xem ảnh phóng to">
    <button class="lightbox-backdrop" type="button" data-lightbox-close aria-label="Đóng ảnh phóng to"></button>
    <div class="lightbox-stage">
      <button class="lightbox-close" type="button" data-lightbox-close aria-label="Đóng ảnh phóng to">×</button>
      <button class="lightbox-nav lightbox-prev" type="button" data-lightbox-prev aria-label="Ảnh trước">‹</button>
      <img src="" alt="" data-lightbox-img>
      <button class="lightbox-nav lightbox-next" type="button" data-lightbox-next aria-label="Ảnh tiếp theo">›</button>
    </div>
  </dialog>

  <!-- Video lightbox -->
  <dialog class="media-lightbox video-lightbox" data-video-lightbox aria-label="Xem video">
    <button class="lightbox-backdrop" type="button" data-video-lightbox-close aria-label="Đóng video"></button>
    <div class="lightbox-stage video-lightbox-stage">
      <button class="lightbox-close" type="button" data-video-lightbox-close aria-label="Đóng video">×</button>
      <div class="video-lightbox-frame" data-video-lightbox-frame></div>
    </div>
  </dialog>

  <script src="assets/js/main-v2.js"></script>
</body>
</html>`;

writeFileSync('g:/Khanh Hoa/index-v2.html', html, 'utf8');
console.log('HTML written:', html.length, 'chars');
