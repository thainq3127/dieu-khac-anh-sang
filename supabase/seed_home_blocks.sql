-- ============================================================
-- Seed trang chủ – Chạy SAU schema.sql
-- ============================================================

DO $$
DECLARE
  home_id UUID;
BEGIN
  SELECT id INTO home_id FROM public.pages WHERE slug = 'home';
  IF home_id IS NULL THEN
    RAISE EXCEPTION 'Page "home" chưa tồn tại. Chạy schema.sql trước.';
  END IF;

  -- Xoá blocks cũ nếu có để seed lại
  DELETE FROM public.content_blocks WHERE page_id = home_id;

  -- ── 1. Hero ──────────────────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'hero', 10, $j${
    "paginationId": "hero-swiper-pagination-main",
    "headingId": "hero-h1",
    "contentAlign": "start",
    "eyebrow": {
      "vi": "Khánh Hòa · Việt Nam · 2026",
      "en": "Khanh Hoa · Vietnam · 2026",
      "ru": "Кханьхоа · Вьетнам · 2026",
      "zh": "庆和 · 越南 · 2026"
    },
    "title": {
      "vi": "Văn hóa Chăm",
      "en": "Cham Culture",
      "ru": "Культура Тям",
      "zh": "占族文化"
    },
    "subtitle": {
      "vi": "Di sản sống trong dòng chảy Việt Nam",
      "en": "Living heritage in the flow of Vietnam",
      "ru": "Живое наследие в потоке Вьетнама",
      "zh": "越南历史洪流中的活态遗产"
    },
    "scrollLabel": {
      "vi": "Cuộn xuống",
      "en": "Scroll down",
      "ru": "Прокрутите вниз",
      "zh": "向下滚动"
    },
    "images": [
      "/images/hero-tower.jpg",
      "/images/culture-space.jpg",
      "/images/tower-detail-01.jpg",
      "/images/tower-detail-02.jpg",
      "/images/intangible-01.jpg",
      "/images/intangible-02.jpg",
      "/images/intangible-03.jpg",
      "/images/gamma-section-03.jpg",
      "/images/heritage-tour-01.jpg",
      "/images/preserve-wide.jpg"
    ],
    "buttons": [
      {
        "label": {
          "vi": "Di sản 3D",
          "en": "3D Heritage",
          "ru": "3D Наследие",
          "zh": "3D 遗产"
        },
        "href": "https://my.matterport.com/show/?m=sgcRbCvG2oC",
        "variant": "primary",
        "is3d": true
      }
    ]
  }$j$::jsonb);

  -- ── 2. Features Strip ────────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'features_strip', 20, $j${
    "ariaLabel": {
      "vi": "Giá trị cốt lõi của di sản Chăm",
      "en": "Core values of Cham heritage",
      "ru": "Ключевые ценности тямского наследия",
      "zh": "占族遗产的核心价值"
    },
    "items": [
      {
        "iconKey": "Landmark",
        "title": {
          "vi": "Kiến trúc ngàn năm",
          "en": "Thousand-year architecture",
          "ru": "Тысячелетняя архитектура",
          "zh": "千年建筑"
        },
        "subtitle": {
          "vi": "Tháp Chăm linh thiêng",
          "en": "Sacred Cham towers",
          "ru": "Священные тямские башни",
          "zh": "神圣的占婆塔"
        }
      },
      {
        "iconKey": "Drama",
        "title": {
          "vi": "Di sản sống",
          "en": "Living heritage",
          "ru": "Живое наследие",
          "zh": "活态遗产"
        },
        "subtitle": {
          "vi": "Lễ hội & nghệ thuật",
          "en": "Festivals & arts",
          "ru": "Фестивали и искусство",
          "zh": "节日与艺术"
        }
      },
      {
        "iconKey": "Palette",
        "title": {
          "vi": "Làng nghề truyền thống",
          "en": "Traditional craft villages",
          "ru": "Традиционные ремесленные деревни",
          "zh": "传统手艺村"
        },
        "subtitle": {
          "vi": "Gốm Bàu Trúc · Dệt Mỹ Nghiệp",
          "en": "Bau Truc Pottery · My Nghiep Weaving",
          "ru": "Гончарное дело Баучук · Ткачество Миньеп",
          "zh": "保竹陶艺 · 美业织锦"
        }
      },
      {
        "iconKey": "ShieldCheck",
        "title": {
          "vi": "Bảo tồn bền vững",
          "en": "Sustainable preservation",
          "ru": "Устойчивое сохранение",
          "zh": "可持续保护"
        },
        "subtitle": {
          "vi": "Cộng đồng làm chủ di sản",
          "en": "Community-owned heritage",
          "ru": "Наследие в руках сообщества",
          "zh": "社区主导的遗产保护"
        }
      }
    ]
  }$j$::jsonb);

  -- ── 3. Marquee Gold ──────────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'marquee', 30, $j${
    "theme": "gold",
    "items": [
      {
        "vi": "Văn hóa Chăm · Khánh Hòa 2026",
        "en": "Cham Culture · Khanh Hoa 2026",
        "ru": "Культура Тям · Кханьхоа 2026",
        "zh": "占族文化 · 庆和 2026"
      },
      {
        "vi": "Di sản sống · Lễ hội Katê",
        "en": "Living Heritage · Kate Festival",
        "ru": "Живое наследие · Фестиваль Кате",
        "zh": "活态遗产 · 卡特节"
      },
      {
        "vi": "Tháp Bà Ponagar · Pô Klong Garai",
        "en": "Po Nagar Tower · Po Klong Garai",
        "ru": "Башня По Нагар · По Клонг Гарай",
        "zh": "婆那迦占婆塔 · 波克朗加莱"
      },
      {
        "vi": "Gốm Bàu Trúc · Dệt Mỹ Nghiệp",
        "en": "Bau Truc Pottery · My Nghiep Weaving",
        "ru": "Гончарное дело Баучук · Ткачество Миньеп",
        "zh": "保竹陶艺 · 美业织锦"
      },
      {
        "vi": "Chào mừng Ngày hội Văn hóa Chăm lần thứ VI",
        "en": "Welcome to the 6th Cham Cultural Festival",
        "ru": "Добро пожаловать на VI Фестиваль тямской культуры",
        "zh": "欢迎参加第六届占族文化节"
      }
    ]
  }$j$::jsonb);

  -- ── 4. Intro (hardcoded, no editable content) ────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'intro', 40, '{}'::jsonb);

  -- ── 5. Chapter 1 – Không gian văn hóa ───────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'split', 50, $j${
    "id": "khong-gian",
    "theme": "light",
    "imagePosition": "left",
    "mediaType": "single",
    "parallax": true,
    "chapterNumber": "01",
    "eyebrow": {
      "vi": "LỊCH SỬ & VĂN HÓA",
      "en": "HISTORY & CULTURE",
      "ru": "ИСТОРИЯ И КУЛЬТУРА",
      "zh": "历史与文化"
    },
    "title": {
      "vi": "Không gian văn hóa Chăm",
      "en": "Cham Cultural Space",
      "ru": "Пространство тямской культуры",
      "zh": "占族文化空间"
    },
    "subtitle": {
      "vi": "Từ miền tháp nắng đến cộng đồng hôm nay",
      "en": "From the land of sunny towers to today's community",
      "ru": "От края солнечных башен до современного сообщества",
      "zh": "从阳光高塔之地到今日的社区"
    },
    "body": [
      {
        "vi": "Không gian văn hóa Chăm trải dài qua nhiều vùng đất, đặc biệt là các địa phương có cộng đồng Chăm sinh sống như Khánh Hòa, Gia Lai, Đắk Lắk, Lâm Đồng, Tây Ninh, An Giang và TP. Hồ Chí Minh. Mỗi vùng mang một sắc thái riêng, tạo nên bức tranh văn hóa đa dạng giữa miền núi, đồng bằng, duyên hải và Nam Bộ.",
        "en": "The Cham cultural space stretches across many regions, especially in areas with active Cham communities such as Khanh Hoa, Gia Lai, Dak Lak, Lam Dong, Tay Ninh, An Giang, and Ho Chi Minh City. Each region carries its own unique traits, painting a diverse cultural picture between mountains, plains, coastal areas, and the Southern region.",
        "ru": "Пространство тямской культуры охватывает множество регионов, особенно провинции с проживанием тямских общин, такие как Кханьхоа, Зялай, Даклак, Ламдонг, Тэйнинь, Анзянг и город Хошимин. Каждый регион обладает своим колоритом, формируя разнообразную картину культуры между горами, равнинами, побережьем и югом страны.",
        "zh": "占族文化空间延伸至诸多地区，特别是有占族社区生活的省市，如庆和、嘉莱、多乐、林同、西宁、安江和胡志明市。每个地区都带有独特的色彩，构成了山区、平原、沿海和南部地区之间多元化的文化画卷。"
      },
      {
        "vi": "Trong không gian ấy, Khánh Hòa được nhấn mạnh như một địa bàn giàu dấu ấn Chăm với những di sản tiêu biểu như Tháp Bà Ponagar, không gian Xóm Bóng, các lễ hội, làng nghề và hoạt động giao lưu văn hóa. Đây là nơi di sản không chỉ được nhìn ngắm, mà còn được thực hành, trình diễn, trao truyền và giới thiệu tới công chúng trong nước, quốc tế.",
        "en": "Within this space, Khanh Hoa is highlighted as an area rich in Cham influence, featuring prominent heritages like Po Nagar Tower, Xom Bong space, traditional festivals, craft villages, and cultural exchange activities. This is a place where heritage is not just observed, but actively practiced, performed, passed down, and introduced to both domestic and international audiences.",
        "ru": "В этом пространстве провинция Кханьхоа выделяется как земля, богатая тямским наследием, со своими знаковыми объектами, такими như Башня По Нагар, квартал Сомбонг, фестивали, ремесленные деревни и культурные мероприятия. Здесь наследие не просто созерцают — его практикуют, демонстрируют, передают из поколения в поколение и представляют как вьетнамской, так и зарубежной публике.",
        "zh": "在此空间中，庆和省被强调为一块富含占族印记的土地，拥有婆那迦占婆塔、Xom Bong空间、各大节日、手艺村 và 文化交流活动等代表性遗产。在这里，遗产不仅用于观赏，更被实践、表演、传承并介绍给国内外公众。"
      }
    ],
    "blockquote": {
      "vi": "\"Di sản không chỉ được nhìn ngắm, mà còn được thực hành, trình diễn, trao truyền.\"",
      "en": "\"Heritage is not just observed, but actively practiced, performed, and passed down.\"",
      "ru": "\"Наследие нужно не просто созерцать, его необходимо практиковать, демонстрировать и передавать.\"",
      "zh": "“遗产不仅用于观赏，更被实践、表演和传承。”"
    },
    "images": [
      {
        "src": "/images/ponagar-wide.jpg",
        "alt": {
          "vi": "Không gian tháp Chăm tại Khánh Hòa",
          "en": "Cham tower space in Khanh Hoa",
          "ru": "Пространство тямской башни в Кханьхоа",
          "zh": "庆和省的占婆塔空间"
        },
        "caption": {
          "vi": "Không gian tháp Chăm tại Khánh Hòa",
          "en": "Cham tower space in Khanh Hoa",
          "ru": "Пространство тямской башни в Кханьхоа",
          "zh": "庆和省的占婆塔空间"
        },
        "fancyboxGroup": "khong-gian-image"
      }
    ],
    "galleryBelow": [
      {
        "src": "/images/culture-space.jpg",
        "alt": {
          "vi": "Chức sắc Chăm thực hiện nghi thức áo choàng",
          "en": "Cham dignitaries performing the robe ritual",
          "ru": "Тямские священнослужители совершают обряд облачения",
          "zh": "占族神职人员进行披袍仪式"
        },
        "caption": {
          "vi": "Chức sắc Chăm thực hiện nghi thức áo choàng",
          "en": "Cham dignitaries performing the robe ritual",
          "ru": "Тямские священнослужители совершают обряд облачения",
          "zh": "占族神职人员进行披袍仪式"
        },
        "fancyboxGroup": "khong-gian-image"
      },
      {
        "src": "/images/tower-detail-01.jpg",
        "alt": {
          "vi": "Cộng đồng trong lễ hội sau nghi thức tại tháp",
          "en": "Community in festival after the ritual at the tower",
          "ru": "Община на празднике после церемонии у башни",
          "zh": "塔内仪式后节日中的社区"
        },
        "caption": {
          "vi": "Cộng đồng trong lễ hội sau nghi thức tại tháp",
          "en": "Community in festival after the ritual at the tower",
          "ru": "Община на празднике после церемонии у башни",
          "zh": "塔内仪式后节日中的社区"
        },
        "fancyboxGroup": "khong-gian-image"
      },
      {
        "src": "/images/tower-detail-02.jpg",
        "alt": {
          "vi": "Lễ tế truyền thống trong không gian văn hóa Chăm",
          "en": "Traditional ritual offering in the Cham cultural space",
          "ru": "Традиционное жертвоприношение в пространстве тямской культуры",
          "zh": "占族文化空间内的传统祭祀仪式"
        },
        "caption": {
          "vi": "Lễ tế truyền thống trong không gian văn hóa Chăm",
          "en": "Traditional ritual offering in the Cham cultural space",
          "ru": "Традиционное жертвоприношение в пространстве тямской культуры",
          "zh": "占族文化空间内的传统祭祀仪式"
        },
        "fancyboxGroup": "khong-gian-image"
      }
    ]
  }$j$::jsonb);

  -- ── 6. Marquee Dark ──────────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'marquee', 60, $j${
    "theme": "dark",
    "items": [
      {
        "vi": "Tháp Bà Ponagar",
        "en": "Po Nagar Tower",
        "ru": "Башня По Нагар",
        "zh": "婆那迦占婆塔"
      },
      {
        "vi": "Pô Klong Garai",
        "en": "Po Klong Garai",
        "ru": "По Клонг Гарай",
        "zh": "波克朗加莱"
      },
      {
        "vi": "Tháp Hòa Lai",
        "en": "Hoa Lai Towers",
        "ru": "Башни Хоалай",
        "zh": "和莱占婆塔"
      },
      {
        "vi": "Lễ hội Katê",
        "en": "Kate Festival",
        "ru": "Фестиваль Кате",
        "zh": "卡特节"
      },
      {
        "vi": "Múa Apsara",
        "en": "Apsara Dance",
        "ru": "Танец Апсара",
        "zh": "仙女阿普萨拉之舞"
      },
      {
        "vi": "Gốm Bàu Trúc",
        "en": "Bau Truc Pottery",
        "ru": "Гончарное дело Баучук",
        "zh": "保竹陶艺"
      },
      {
        "vi": "Dệt thổ cẩm Mỹ Nghiệp",
        "en": "My Nghiep Brocade Weaving",
        "ru": "Ткачество парчи Миньеп",
        "zh": "美业织锦"
      },
      {
        "vi": "Trống Ginăng & Baranưng",
        "en": "Ginang & Baranung Drums",
        "ru": "Барабаны Гинанг и Баранунг",
        "zh": "吉能鼓与巴拉能鼓"
      },
      {
        "vi": "Kèn Saranai",
        "en": "Saranai Oboe",
        "ru": "Гобой Шаранай",
        "zh": "双簧管沙拉奈"
      },
      {
        "vi": "Đàn Kanhi",
        "en": "Kanhi Violin",
        "ru": "Скрипка Каньи",
        "zh": "二胡加尼"
      }
    ]
  }$j$::jsonb);

  -- ── 7. Chapter 2 – Tháp Chăm ────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'split', 70, $j${
    "id": "thap-cham",
    "theme": "dark",
    "imagePosition": "none",
    "chapterNumber": "02",
    "eyebrow": {
      "vi": "KIẾN TRÚC & TÍN NGƯỠNG",
      "en": "ARCHITECTURE & BELIEFS",
      "ru": "АРХИТЕКТУРА И ВЕРОВАНИЯ",
      "zh": "建筑与信仰"
    },
    "title": {
      "vi": "Tháp Chăm",
      "en": "Cham Towers",
      "ru": "Тямские башни",
      "zh": "占婆塔"
    },
    "subtitle": {
      "vi": "Ký ức bằng gạch đỏ và niềm tin",
      "en": "Memories in red brick and faith",
      "ru": "Память в красном кирпиче и вере",
      "zh": "红砖砌成的记忆与信仰"
    },
    "bodyColumns": true,
    "body": [
      {
        "vi": "Tháp Chăm là biểu tượng nổi bật của di sản văn hóa Chăm. Những công trình như Tháp Bà Ponagar, Pô Klong Garai và các cụm tháp Chăm trên dải duyên hải miền Trung không chỉ có giá trị kiến trúc, mỹ thuật, mà còn là không gian linh thiêng gắn với tín ngưỡng, huyền thoại và đời sống tinh thần của cộng đồng.",
        "en": "Cham towers are the outstanding symbols of Cham cultural heritage. Structures like Po Nagar Tower, Po Klong Garai, and other tower complexes along the Central coast not only hold architectural and artistic value, but also serve as sacred spaces tied to the beliefs, myths, and spiritual life of the community.",
        "ru": "Тямские башни — ярчайшие символы культурного наследия тямов. Такие сооружения, как Башня По Нагар, По Клонг Гарай и другие храмовые комплексы вдоль центрального побережья, ценны не только своей архитектурой и искусством, но и служат священными пространствами, связанными с верованиями, легендами и духовной жизнью общины.",
        "zh": "占婆塔是占族文化遗产的杰出象征。分布在中部沿海地带的婆那迦占婆塔、波克朗加莱等古塔群，不仅具有建筑和艺术价值，更是与社区的信仰、神话和精神生活紧密相连的神圣空间。"
      },
      {
        "vi": "Mỗi ngọn tháp là một \"bảo tàng mở\" lưu giữ dấu ấn của kỹ thuật xây dựng, nghệ thuật tạo hình, biểu tượng thần linh và ký ức cộng đồng. Bảo tồn tháp Chăm không chỉ là tu bổ vật chất công trình, mà còn cần gìn giữ bối cảnh văn hóa xung quanh: nghi lễ, lễ hội, câu chuyện dân gian, sinh hoạt cộng đồng và cách người Chăm tiếp tục gắn bó với di sản của mình.",
        "en": "Each tower is an \"open-air museum\" preserving the architectural techniques, plastic arts, divine symbols, and collective memory of the community. Preserving Cham towers is not just about physical restoration, but also safeguarding the surrounding cultural context: rituals, festivals, folklore, community activities, and the way the Cham people continue to connect with their heritage.",
        "ru": "Каждая башня — это «музей под открытым небом», хранящий в себе строительные технологии, пластическое искусство, божественные символы и коллективную память общины. Сохранение башен — это не просто реставрация сооружения, но и сбережение окружающего культурного контекста: ритуалов, праздников, фольклора, общественной жизни и той связи, которую тямский народ продолжает поддерживать со своим наследием.",
        "zh": "每一座古塔都是一座“露天博物馆”，保存着建筑技术、造型艺术、神明象征和社区记忆。保护占婆塔不仅是修复建筑本身，更需维护周边的文化脉络：仪式、节日、民间传说、社区活动，以及占族人继续与自身遗产紧密相连的方式。"
      }
    ],
    "galleryBelow": [
      {
        "src": "/images/intangible-01.jpg",
        "alt": {
          "vi": "Hoàng hôn trên di tích Tháp Bà Pô Nagar",
          "en": "Sunset over Po Nagar Cham Towers",
          "ru": "Закат над башнями По Нагар",
          "zh": "婆那迦占婆塔遗迹的落日"
        },
        "caption": {
          "vi": "Hoàng hôn trên di tích Tháp Bà Pô Nagar",
          "en": "Sunset over Po Nagar Cham Towers",
          "ru": "Закат над башнями По Нагар",
          "zh": "婆那迦占婆塔遗迹的落日"
        },
        "fancyboxGroup": "thap-cham-image"
      },
      {
        "src": "/images/intangible-02.jpg",
        "alt": {
          "vi": "Tháp Pô Klong Garai — di tích quốc gia đặc biệt",
          "en": "Po Klong Garai Tower — a special national monument",
          "ru": "Башня По Клонг Гарай — особый национальный памятник",
          "zh": "波克朗加莱占婆塔 —— 国家特别遗迹"
        },
        "caption": {
          "vi": "Tháp Pô Klong Garai — di tích quốc gia đặc biệt",
          "en": "Po Klong Garai Tower — a special national monument",
          "ru": "Башня По Клонг Гарай — особый национальный памятник",
          "zh": "波克朗加莱占婆塔 —— 国家特别遗迹"
        },
        "fancyboxGroup": "thap-cham-image"
      },
      {
        "src": "/images/intangible-03.jpg",
        "alt": {
          "vi": "Tháp Hòa Lai — kiến trúc Chăm cổ kính",
          "en": "Hoa Lai Towers — ancient Cham architecture",
          "ru": "Башни Хоалай — старинная тямская архитектура",
          "zh": "和莱古塔 —— 古老的占族建筑"
        },
        "caption": {
          "vi": "Tháp Hòa Lai — kiến trúc Chăm cổ kính",
          "en": "Hoa Lai Towers — ancient Cham architecture",
          "ru": "Башни Хоалай — старинная тямская архитектура",
          "zh": "和莱古塔 —— 古老的占族建筑"
        },
        "fancyboxGroup": "thap-cham-image"
      }
    ]
  }$j$::jsonb);

  -- ── 8. Chapter 3 – Di sản phi vật thể ───────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'split', 80, $j${
    "id": "di-san",
    "theme": "light",
    "imagePosition": "right",
    "mediaType": "single",
    "chapterNumber": "03",
    "eyebrow": {
      "vi": "DI SẢN PHI VẬT THỂ",
      "en": "INTANGIBLE HERITAGE",
      "ru": "НЕМАТЕРИАЛЬНОЕ НАСЛЕДИЕ",
      "zh": "非物质文化遗产"
    },
    "title": {
      "vi": "Di sản phi vật thể",
      "en": "Intangible Heritage",
      "ru": "Нематериальное наследие",
      "zh": "非物质文化遗产"
    },
    "subtitle": {
      "vi": "Lễ hội, âm nhạc và bàn tay nghệ nhân",
      "en": "Festivals, music, and the hands of artisans",
      "ru": "Фестивали, музыка и руки мастеров",
      "zh": "节日、音乐与手工艺人的双手"
    },
    "body": [
      {
        "vi": "Văn hóa Chăm tỏa sáng mạnh mẽ qua các di sản phi vật thể: lễ hội Katê, dân ca, dân vũ, múa quạt, múa đội nước, múa đội lửa, múa Apsara, múa trống, múa khăn, cùng hệ thống nhạc cụ truyền thống như trống Ginăng, trống Baranưng, kèn Saranai, đàn Kanhi, chiêng và chập chõa.",
        "en": "Cham culture shines brightly through its intangible heritage: the Kate festival, folk songs, folk dances, fan dance, water-pot balancing dance, fire-dance, Apsara dance, drum dance, scarf dance, alongside traditional musical instruments like the Ginang drum, Baranung drum, Saranai oboe, Kanhi violin, gongs, and cymbals.",
        "ru": "Тямская культура ярко раскрывается в ее нематериальном наследии: фестивале Кате, народных песнях и танцах, танцах с веерами, танцах с кувшинами на голове, огненных танцах, танце Апсара, танцах с барабанами и платками, а также в традиционных инструментах, таких как барабаны Гинанг и Баранунг, гобой Шаранай, скрипка Каньи, гонги и тарелки.",
        "zh": "占族文化在其非物质文化遗产中大放异彩：卡特节、民歌、民舞、扇子舞、顶水罐之舞、顶火之舞、仙女舞、鼓舞、哈达舞，以及吉能鼓、巴拉能鼓、沙拉奈管、加尼琴、铜锣和铙钹等传统乐器体系。"
      },
      {
        "vi": "Bên cạnh nghệ thuật trình diễn, các làng nghề như gốm Bàu Trúc, dệt thổ cẩm Mỹ Nghiệp cũng là những \"mạch sống\" quan trọng của di sản. Ở đó, nghệ nhân không chỉ làm ra sản phẩm, mà còn giữ lại tri thức, kỹ năng, thẩm mỹ và ký ức nghề truyền qua nhiều thế hệ.",
        "en": "Alongside performing arts, traditional craft villages like Bau Truc pottery and My Nghiep brocade weaving serve as crucial lifelines for the heritage. There, artisans not only craft products but also preserve the knowledge, skills, aesthetics, and vocational memories passed down through generations.",
        "ru": "Наряду с исполнительским искусством, ремесленные деревни, такие как гончарная Баучук и ткацкая Миньеп, являются жизненными артериями этого наследия. В них мастера не просто создают изделия, но и сберегают знания, умения, эстетику и профессиональную память, передаваемую из поколения в поколение.",
        "zh": "除了表演艺术外，保竹陶艺、美业织锦等手艺村 cũng là những \"mạch sống\" quan trọng của di sản. Ở đó, nghệ nhân không chỉ làm ra sản phẩm, mà còn giữ lại tri thức, kỹ năng, thẩm mỹ và ký ức nghề truyền qua nhiều thế hệ."
      }
    ],
    "tags": [
      {
        "vi": "Nghề truyền thống",
        "en": "Traditional crafts",
        "ru": "Традиционные ремесла",
        "zh": "传统手艺"
      },
      {
        "vi": "Bảo tồn tri thức",
        "en": "Knowledge preservation",
        "ru": "Сохранение знаний",
        "zh": "知识保护"
      },
      {
        "vi": "Tôn vinh nghệ nhân",
        "en": "Honoring artisans",
        "ru": "Чествование мастеров",
        "zh": "致敬手工艺人"
      },
      {
        "vi": "Tiếp cận công chúng",
        "en": "Public outreach",
        "ru": "Общественный охват",
        "zh": "面向公众"
      },
      {
        "vi": "Lễ hội Katê",
        "en": "Kate Festival",
        "ru": "Фестиваль Кате",
        "zh": "卡特节"
      },
      {
        "vi": "Gốm Bàu Trúc",
        "en": "Bau Truc Pottery",
        "ru": "Гончарное дело Баучук",
        "zh": "保竹陶艺"
      },
      {
        "vi": "Dệt Mỹ Nghiệp",
        "en": "My Nghiep Weaving",
        "ru": "Ткачество Миньеп",
        "zh": "美业织锦"
      }
    ],
    "images": [
      {
        "src": "/images/gamma-section-03.jpg",
        "alt": {
          "vi": "Cộng đồng Chăm trong nghi lễ truyền thống",
          "en": "Cham community in traditional rituals",
          "ru": "Тямская община в традиционных обрядах",
          "zh": "传统仪式中的占族社区"
        },
        "caption": {
          "vi": "Cộng đồng Chăm trong nghi lễ truyền thống",
          "en": "Cham community in traditional rituals",
          "ru": "Тямская община в традиционных обрядах",
          "zh": "传统仪式中的占族社区"
        },
        "fancyboxGroup": "di-san-image"
      }
    ]
  }$j$::jsonb);

  -- ── 9. Chapter 4 – Du lịch di sản ───────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'split', 90, $j${
    "id": "du-lich",
    "theme": "light",
    "imagePosition": "right",
    "mediaType": "grid-2x3",
    "chapterNumber": "04",
    "eyebrow": {
      "vi": "DU LỊCH DI SẢN",
      "en": "HERITAGE TOURISM",
      "ru": "КУЛЬТУРНЫЙ ТУРИЗМ",
      "zh": "遗产旅游"
    },
    "title": {
      "vi": "Văn hóa Chăm trong du lịch di sản",
      "en": "Cham culture in heritage tourism",
      "ru": "Тямская культура в сфере культурного туризма",
      "zh": "遗产旅游中的占族文化"
    },
    "subtitle": {
      "vi": "Phát huy giá trị di sản",
      "en": "Promoting heritage values",
      "ru": "Продвижение ценностей наследия",
      "zh": "发扬遗产价值"
    },
    "body": [
      {
        "vi": "Văn hóa Chăm có tiềm năng lớn để phát triển du lịch di sản thông qua các tuyến tham quan tháp cổ, làng nghề, lễ hội, trình diễn nghệ thuật, trải nghiệm ẩm thực và giao lưu cộng đồng.",
        "en": "Cham culture possesses great potential for heritage tourism development through tours of ancient towers, craft villages, festivals, artistic performances, culinary experiences, and community interactions.",
        "ru": "Тямская культура обладает огромным потенциалом для развития культурного туризма посредством посещения древних башен, ремесленных деревень, фестивалей, художественных представлений, гастрономического опыта и общения с общиной.",
        "zh": "占族文化在发展遗产旅游方面拥有巨大潜力，包括参观古塔、手艺村、参与节日、欣赏艺术表演、体验特色美食和社区互动等路线。"
      },
      {
        "vi": "Tuy nhiên, phát triển du lịch cần đi cùng bảo tồn bền vững: tôn trọng không gian thiêng, tránh thương mại hóa quá mức, bảo đảm quyền tham gia và lợi ích của cộng đồng Chăm.",
        "en": "However, tourism development must go hand in hand with sustainable preservation: respecting sacred spaces, avoiding over-commercialization, and ensuring the participation rights and benefits of the Cham community.",
        "ru": "Однако развитие туризма должно сопровождаться устойчивым сохранением: уважением к священным пространствам, избеганием чрезмерной коммерциализации, обеспечением прав участия и выгоды для тямского сообщества.",
        "zh": "然而，旅游发展必须与可持续保护相结合：尊重神圣空间、避免过度商业化、确保占族社区的参与权 and 利益。"
      }
    ],
    "images": [
      {
        "src": "/images/heritage-tour-01.jpg",
        "alt": {
          "vi": "Nghi lễ Kareh mở ra trải nghiệm văn hóa Chăm",
          "en": "Kareh ritual opening up the Cham cultural experience",
          "ru": "Обряд Карех открывает путь к познанию тямской культуры",
          "zh": "Kareh仪式开启占族文化体验"
        },
        "caption": {
          "vi": "Nghi lễ Kareh",
          "en": "Kareh Ritual",
          "ru": "Обряд Карех",
          "zh": "Kareh 仪式"
        },
        "fancyboxGroup": "du-lich"
      },
      {
        "src": "/images/heritage-tour-02.jpg",
        "alt": {
          "vi": "Nghệ nhân giới thiệu sản phẩm gốm truyền thống",
          "en": "Artisan introducing traditional pottery products",
          "ru": "Мастер представляет традиционные гончарные изделия",
          "zh": "手工艺人介绍传统陶艺产品"
        },
        "caption": {
          "vi": "Gốm truyền thống",
          "en": "Traditional Pottery",
          "ru": "Традиционная керамика",
          "zh": "传统陶艺"
        },
        "fancyboxGroup": "du-lich"
      },
      {
        "src": "/images/heritage-tour-03.jpg",
        "alt": {
          "vi": "Nghệ nhân biểu diễn trống Ginăng trong lễ Katê",
          "en": "Artisan performing the Ginang drum in Kate Festival",
          "ru": "Мастер играет на барабане Гинанг во время праздника Кате",
          "zh": "卡特节上手工艺人表演吉能鼓"
        },
        "caption": {
          "vi": "Trống Ginăng - Lễ Katê",
          "en": "Ginang Drum - Kate Festival",
          "ru": "Барабан Гинанг — Фестиваль Кате",
          "zh": "吉能鼓 —— 卡特节"
        },
        "fancyboxGroup": "du-lich"
      },
      {
        "src": "/images/tour-card-01.jpg",
        "alt": {
          "vi": "Theo dấu tháp cổ trong hành trình du lịch Chăm",
          "en": "Following the footprints of ancient towers in the Cham journey",
          "ru": "По следам древних башен в тямском путешествии",
          "zh": "占族之旅中寻访古塔足迹"
        },
        "caption": {
          "vi": "Theo dấu tháp cổ",
          "en": "Following Ancient Towers",
          "ru": "По следам древних башен",
          "zh": "寻访古塔足迹"
        },
        "fancyboxGroup": "du-lich"
      },
      {
        "src": "/images/tour-card-02.jpg",
        "alt": {
          "vi": "Trải nghiệm di sản sống của cộng đồng Chăm",
          "en": "Experiencing the living heritage of the Cham community",
          "ru": "Соприкосновение с живым наследием тямского сообщества",
          "zh": "体验占族社区的活态遗产"
        },
        "caption": {
          "vi": "Di sản sống",
          "en": "Living Heritage",
          "ru": "Живое наследие",
          "zh": "活态遗产"
        },
        "fancyboxGroup": "du-lich"
      },
      {
        "src": "/images/tour-card-03.jpg",
        "alt": {
          "vi": "Du khách cùng gìn giữ bản sắc văn hóa Chăm",
          "en": "Visitors joining hands to preserve Cham cultural identity",
          "ru": "Туристы вместе сохраняют самобытность тямской культуры",
          "zh": "游客共同守护占族文化特色"
        },
        "caption": {
          "vi": "Gìn giữ bản sắc",
          "en": "Preserving Identity",
          "ru": "Сохранение самобытности",
          "zh": "守护文化特色"
        },
        "fancyboxGroup": "du-lich"
      }
    ]
  }$j$::jsonb);

  -- ── 10. Quote Break ──────────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'quote_break', 100, $j${
    "theme": "terra",
    "quote": {
      "vi": "Di sản Chăm chỉ thật sự sống khi cộng đồng được tham gia, tự hào và hưởng lợi từ chính giá trị văn hóa của mình. Bảo tồn không phải để giữ quá khứ trong khuôn khổ tĩnh, mà để văn hóa Chăm tiếp tục hiện diện, kể chuyện và tỏa sáng trong đời sống hôm nay.",
      "en": "Cham heritage only truly lives when the community participates, takes pride in, and benefits from its own cultural values. Preservation is not about keeping the past in a static frame, but letting Cham culture continue to exist, tell stories, and shine in today's life.",
      "ru": "Тямское наследие по-настоящему живет лишь тогда, когда община участвует, гордится и извлекает пользу из своих культурных ценностей. Сохранение — это не удержание прошлого в статичных рамках, а то, чтобы тямская культура продолжала жить, рассказывать истории и сиять в сегодняшней жизни.",
      "zh": "只有当社区参与、自豪并从中受益时，占族遗产才真正具有生命力。保护并非为了将过去封存在静态的框架中，而是让占族文化继续存在、诉说故事并在今日的生活中绽放光芒。"
    }
  }$j$::jsonb);

  -- ── 11. Chapter 5 – Bảo tồn và phát huy ─────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'split', 110, $j${
    "id": "bao-ton",
    "theme": "dark",
    "imagePosition": "left",
    "mediaType": "single",
    "parallax": true,
    "chapterNumber": "05",
    "eyebrow": {
      "vi": "PHÁT HUY GIÁ TRỊ",
      "en": "PROMOTING VALUES",
      "ru": "ПРОДВИЖЕНИЕ ЦЕННОСТЕЙ",
      "zh": "发扬价值"
    },
    "title": {
      "vi": "Bảo tồn và phát huy",
      "en": "Preservation and Promotion",
      "ru": "Сохранение и продвижение",
      "zh": "保护与发扬"
    },
    "subtitle": {
      "vi": "Để sắc màu Chăm tiếp tục tỏa sáng",
      "en": "To let Cham colors continue to shine",
      "ru": "Чтобы краски тямской культуры продолжали сиять",
      "zh": "让占族色彩继续闪耀"
    },
    "body": [
      {
        "vi": "Bảo tồn văn hóa Chăm trong thời kỳ mới cần được nhìn từ góc độ phát triển bền vững: giữ gìn bản sắc, tôn trọng cộng đồng chủ thể, đồng thời tạo điều kiện để di sản tham gia vào giáo dục, du lịch văn hóa, truyền thông số và giao lưu sáng tạo. Di sản chỉ thật sự sống khi cộng đồng được tham gia, được tự hào và được hưởng lợi từ chính giá trị văn hóa của mình.",
        "en": "Preservation of Cham culture in the new era must be viewed from the perspective of sustainable development: safeguarding identity, respecting the host community, while enabling heritage to contribute to education, cultural tourism, digital media, and creative exchanges. Heritage truly lives only when the community participates, takes pride in, and benefits from its own cultural values.",
        "ru": "Сохранение тямской культуры в новую эпоху следует рассматривать через призму устойчивого развития: сбережение самобытности, уважение к общине-носителю и создание условий для вовлечения наследия в образование, культурный туризм, цифровые медиа и творческий обмен. Наследие по-настоящему живет лишь тогда, когда община участвует, гордится им и извлекает пользу из своих культурных ценностей.",
        "zh": "新时期占族文化的保护应从可持续发展的角度来看待：保持特色、尊重主体社区，同时为遗产参与 education、文化旅游、数字媒体和创意交流创造条件。只有当社区参与、自豪并从中受益时，遗产才真正具有生命力。"
      }
    ],
    "images": [
      {
        "src": "/images/preserve-wide.jpg",
        "alt": {
          "vi": "Khai mạc Lễ hội Tháp Bà Pô Nagar với trình diễn nghệ thuật Chăm",
          "en": "Opening ceremony of Po Nagar Cham Towers Festival with Cham art performances",
          "ru": "Открытие фестиваля Башни По Нагар с выступлениями тямских артистов",
          "zh": "婆那迦占婆塔文化节开幕式及占族艺术表演"
        },
        "caption": {
          "vi": "Khai mạc Lễ hội Tháp Bà Pô Nagar",
          "en": "Opening Ceremony of Po Nagar Towers Festival",
          "ru": "Открытие фестиваля Башни По Нагар",
          "zh": "婆那迦占婆塔文化节开幕式"
        },
        "fancyboxGroup": "bao-ton"
      }
    ]
  }$j$::jsonb);

  -- ── 12. Chapter 6 – Hành trình du lịch (CardGrid) ───────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'card_grid', 120, $j${
    "id": "hanh-trinh",
    "theme": "light",
    "chapterNumber": "06",
    "eyebrow": {
      "vi": "HÀNH TRÌNH TRẢI NGHIỆM",
      "en": "EXPERIENTIAL JOURNEY",
      "ru": "ЭКСКУРСИОННЫЙ МАРШРУТ",
      "zh": "体验之旅"
    },
    "title": {
      "vi": "Hành trình du lịch",
      "en": "Travel Journey",
      "ru": "Туристический маршрут",
      "zh": "旅游路线"
    },
    "subtitle": {
      "vi": "Ba chặng — một di sản",
      "en": "Three stages — one heritage",
      "ru": "Три этапа — одно наследие",
      "zh": "三段行程 —— 一份遗产"
    },
    "cardStyle": "numbered-roman",
    "columns": 3,
    "cards": [
      {
        "prefix": "I.",
        "title": {
          "vi": "Theo dấu tháp cổ",
          "en": "Following the Ancient Towers",
          "ru": "По следам древних башен",
          "zh": "寻访古塔足迹"
        },
        "body": {
          "vi": "Khám phá những công trình tháp Chăm linh thiêng, nơi lưu giữ ký ức lịch sử, tín ngưỡng và dấu ấn kiến trúc đặc sắc.",
          "en": "Explore sacred Cham tower structures that preserve historical memory, beliefs, and unique architectural footprints.",
          "ru": "Откройте для себя священные тямские башни, хранящие историческую память, верования и уникальные архитектурные черты.",
          "zh": "探索神圣的占婆塔建筑，这里保存着历史记忆、信仰和独特的建筑印记。"
        }
      },
      {
        "prefix": "II.",
        "title": {
          "vi": "Chạm vào di sản sống",
          "en": "Touching the Living Heritage",
          "ru": "Соприкосновение с живым наследием",
          "zh": "触碰活态遗产"
        },
        "body": {
          "vi": "Trải nghiệm làng nghề, lễ hội, âm nhạc, trang phục và đời sống cộng đồng Chăm trong không gian văn hóa bản địa.",
          "en": "Experience craft villages, festivals, music, costumes, and the everyday life of the Cham community within their native cultural space.",
          "ru": "Познакомьтесь с ремесленными деревнями, фестивалями, музыкой, традиционной одеждой и повседневной жизнью тямской общины.",
          "zh": "在本土文化空间中体验手艺村、节日、音乐、服饰以及占族社区的生活。"
        }
      },
      {
        "prefix": "III.",
        "title": {
          "vi": "Cùng gìn giữ bản sắc",
          "en": "Preserving the Identity Together",
          "ru": "Совместное сохранение самобытности",
          "zh": "共同守护文化特色"
        },
        "body": {
          "vi": "Mỗi điểm đến không chỉ để tham quan, mà còn để hiểu, trân trọng và chung tay bảo tồn giá trị văn hóa Chăm hôm nay.",
          "en": "Every destination is not just for sightseeing, but to understand, cherish, and join hands to preserve Cham cultural values today.",
          "ru": "Каждая остановка предназначена не только для осмотра достопримечательностей, но и для понимания, уважения и совместного сохранения тямской культуры сегодня.",
          "zh": "每一个目的地不仅为了参观，更是为了理解、珍惜并共同守护今日的占族文化价值。"
        }
      }
    ],
    "bodyText": {
      "vi": "Hành trình du lịch văn hóa Chăm tại Khánh Hòa mở ra chuyến đi từ Tháp Bà Pô Nagar linh thiêng bên sông Cái đến những không gian tháp cổ, làng nghề và lễ hội giàu bản sắc.",
      "en": "The Cham cultural journey in Khanh Hoa opens up a trip from the sacred Po Nagar Cham Towers by the Cai River to ancient tower spaces, craft villages, and identity-rich festivals.",
      "ru": "Путешествие по тямской культуре в Кханьхоа mở ra chuyến đi từ Tháp Bà Pô Nagar linh thiêng bên sông Cái đến những không gian tháp cổ, làng nghề và lễ hội giàu bản sắc.",
      "zh": "庆和省的占族文化之旅开启了一段从蔡河畔神圣的婆那迦占婆塔出发，前往古塔空间、手艺村和富有特色节日的心灵之旅。"
    }
  }$j$::jsonb);

  -- ── 13. Video Grid ───────────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'video_grid', 130, $j${
    "id": "video",
    "eyebrow": {
      "vi": "THƯ VIỆN VIDEO",
      "en": "VIDEO GALLERY",
      "ru": "ВИДЕОГАЛЕРЕЯ",
      "zh": "视频库"
    },
    "title": {
      "vi": "Thư viện Video",
      "en": "Video Gallery",
      "ru": "Видеогалерея",
      "zh": "视频库"
    },
    "subtitle": {
      "vi": "Nhìn gần hơn — nghe sâu hơn",
      "en": "Look closer — listen deeper",
      "ru": "Вглядитесь ближе — вслушайтесь глубже",
      "zh": "看更近 —— 听更深"
    },
    "columns": 2,
    "videos": [
      {
        "id": "5PpEvxas5SQ",
        "tag": "YouTube",
        "title": {
          "vi": "Khám phá vẻ đẹp di sản tháp Chăm ở Khánh Hòa | THDT",
          "en": "Discover the beauty of Cham tower heritage in Khanh Hoa | THDT",
          "ru": "Откройте для себя красоту тямского храмового наследия в Кханьхоа | THDT",
          "zh": "探索庆和省占婆塔遗产之美 | THDT"
        },
        "desc": {
          "vi": "Góc nhìn của Đài Phát thanh Truyền hình Đồng Tháp về di sản kiến trúc Chăm tại Khánh Hòa.",
          "en": "Dong Thap Radio and Television Station's perspective on Cham architectural heritage in Khanh Hoa.",
          "ru": "Взгляд телерадиокомпании Донгтхап на тямское архитектурное наследие в провинции Кханьхоа.",
          "zh": "同塔广播电视台对庆和省占族建筑遗产的独特视角。"
        }
      },
      {
        "id": "9h-tyEmgZnM",
        "tag": "YouTube",
        "title": {
          "vi": "Kiến trúc Chăm ở tháp bà Ponagar",
          "en": "Cham architecture at Po Nagar Tower",
          "ru": "Тямская архитектура в Башне По Нагар",
          "zh": "婆那迦占婆塔的占族建筑"
        },
        "desc": {
          "vi": "Nét đặc sắc trong kiến trúc và điêu khắc của Tháp Bà Ponagar — di tích Chăm nổi tiếng nhất Việt Nam.",
          "en": "Unique features in the architecture and sculpture of Po Nagar Tower — the most famous Cham relic in Vietnam.",
          "ru": "Уникальные черты архитектуры и скульптуры Башни По Нагар — самого известного тямского памятника во Вьетнаме.",
          "zh": "婆那迦占婆塔的建筑与雕刻特色 —— 越南最著名的占族遗迹。"
        }
      },
      {
        "id": "qGi_Rad7vHQ",
        "tag": "YouTube",
        "title": {
          "vi": "Lễ hội Katê - di sản văn hóa phi vật thể của người Chăm",
          "en": "Kate Festival - intangible cultural heritage of the Cham people",
          "ru": "Фестиваль Кате — нематериальное культурное наследие тямского народа",
          "zh": "卡特节 —— 占族非物质文化遗产"
        },
        "desc": {
          "vi": "Lễ hội lớn nhất, đặc sắc nhất của người Chăm — được công nhận di sản văn hóa phi vật thể quốc gia.",
          "en": "The largest and most unique festival of the Cham people — recognized as a national intangible cultural heritage.",
          "ru": "Крупнейший и самый яркий фестиваль тямского народа, признанный национальным нематериальным культурным наследием.",
          "zh": "占族最大、最独特的节日 —— 被认定为国家级非物质文化遗产。"
        }
      },
      {
        "id": "z-7iCxVyav0",
        "tag": "YouTube",
        "title": {
          "vi": "Khám phá nguồn gốc và văn hóa Dân tộc Chăm",
          "en": "Explore the origin and culture of the Cham ethnic group",
          "ru": "Узнайте о происхождении и культуре тямского народа",
          "zh": "探索占族人的起源与 culture"
        },
        "desc": {
          "vi": "Hành trình khám phá lịch sử, nguồn gốc và những nét văn hóa độc đáo của dân tộc Chăm.",
          "en": "A journey to discover the history, origin, and unique cultural features of the Cham ethnic group.",
          "ru": "Путешествие с целью открыть для себя историю, происхождение и уникальные культурные особенности тямского народа.",
          "zh": "探索占族历史、起源及独特文化魅力的旅程。"
        }
      }
    ]
  }$j$::jsonb);

  -- ── 14. Map Section ──────────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'map', 140, '{}'::jsonb);

  -- ── 15. Closing Section ──────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'split', 150, $j${
    "id": "so-hoa",
    "theme": "light",
    "imagePosition": "right",
    "mediaType": "single",
    "parallax": true,
    "eyebrow": {
      "vi": "KỶ NGUYÊN SỐ",
      "en": "DIGITAL ERA",
      "ru": "ЦИФРОВАЯ ЭПОХА",
      "zh": "数字时代"
    },
    "title": {
      "vi": "Lan tỏa di sản Chăm trong kỷ nguyên số",
      "en": "Spreading Cham heritage in the digital era",
      "ru": "Популяризация тямского наследия в цифровую эпоху",
      "zh": "数字时代传播占族遗产"
    },
    "body": [
      {
        "vi": "Trong thời kỳ mới, văn hóa Chăm cần được lan tỏa qua các hình thức gần gũi như website, bản đồ số, triển lãm số, phim tư liệu, thư viện hình ảnh, video ngắn, thuyết minh đa ngôn ngữ và chương trình giáo dục di sản.",
        "en": "In the new era, Cham culture needs to be spread through accessible forms such as websites, digital maps, virtual exhibitions, documentaries, image libraries, short videos, multilingual audio guides, and heritage education programs.",
        "ru": "В новую эпоху тямскую культуру необходимо популяризировать в таких доступных форматах, как веб-сайты, цифровые карты, виртуальные выставки, документальные фильмы, фотогалереи, короткие видеоролики, многоязычные гиды и образовательные программы.",
        "zh": "在新时期下，占族文化需要通过网站、数字地图、数字展览、纪录片、图片库、短视频、多语言解说以及遗产教育课程等亲近形式得以广泛传播。"
      },
      {
        "vi": "Số hóa không thay thế di sản gốc, mà giúp di sản được lưu trữ, tiếp cận và lan tỏa rộng hơn. Khi tháp cổ, lễ hội, âm nhạc, làng nghề và câu chuyện cộng đồng được trình bày sinh động trên môi trường số, văn hóa Chăm sẽ đến gần hơn với thế hệ trẻ, du khách và bạn bè quốc tế.",
        "en": "Digitization does not replace the original heritage but helps store, access, and spread it wider. When ancient towers, festivals, music, craft villages, and community stories are vividly presented in the digital space, Cham culture will come closer to the younger generation, tourists, and international friends.",
        "ru": "Цифровизация не заменяет оригинал, но помогает хранить наследие, делать его доступным и распространять шире. When ancient towers, festivals, music, craft villages, and community stories are vividly presented in the digital space, Cham culture will come closer to the younger generation, tourists, and international friends.",
        "zh": "数字化并不是为了取代原始遗产，而是有助于更好地保存、获取和传播遗产。当古塔、节日、音乐、手艺村和社区故事在数字环境中生动呈现时，占族文化将拉近与年轻一代、游客及国际友人的距离。"
      }
    ],
    "blockquote": {
      "vi": "Sắc màu Chăm – Di sản sống, tỏa sáng cùng thời gian.",
      "en": "Colors of Cham – Living heritage, shining through time.",
      "ru": "Краски тямской культуры — живое наследие, сияющее сквозь время.",
      "zh": "占族色彩 —— 活态遗产，与时间共耀。"
    },
    "images": [
      {
        "src": "/images/closing-wide.jpg",
        "alt": {
          "vi": "Tháp Bà Pô Nagar bên sông Cái trong ánh chiều",
          "en": "Po Nagar Towers by the Cai River in afternoon light",
          "ru": "Башни По Нагар у реки Кай в предзакатных лучах",
          "zh": "黄昏斜阳下蔡河畔的婆那迦占婆塔"
        },
        "caption": {
          "vi": "Tháp Bà Pô Nagar bên sông Cái trong ánh chiều",
          "en": "Po Nagar Towers by the Cai River in afternoon light",
          "ru": "Башни По Нагар у реки Кай в предзакатных лучах",
          "zh": "黄昏斜阳下蔡河畔的婆那迦占婆塔"
        },
        "fancyboxGroup": "so-hoa"
      }
    ]
  }$j$::jsonb);

  -- ── 16. Marquee Footer ───────────────────────────────────────
  INSERT INTO public.content_blocks (page_id, block_type, sort_order, content) VALUES (home_id, 'marquee', 160, $j${
    "theme": "footer",
    "items": [
      {
        "vi": "Văn hóa Chăm",
        "en": "Cham Culture",
        "ru": "Культура Тям",
        "zh": "占族文化"
      },
      {
        "vi": "Khánh Hoà 2026",
        "en": "Khanh Hoa 2026",
        "ru": "Кханьхоа 2026",
        "zh": "庆和 2026"
      },
      {
        "vi": "Di sản sống",
        "en": "Living Heritage",
        "ru": "Живое Наследие",
        "zh": "活态遗产"
      },
      {
        "vi": "Tinh hoa Việt Nam",
        "en": "Essence of Vietnam",
        "ru": "Квинтэссенция Вьетнама",
        "zh": "越南精华"
      },
      {
        "vi": "Lễ hội Katê",
        "en": "Kate Festival",
        "ru": "Фестиваль Кате",
        "zh": "卡特节"
      },
      {
        "vi": "Sắc màu Chăm",
        "en": "Colors of Cham",
        "ru": "Краски Тямской Культуры",
        "zh": "占族色彩"
      }
    ]
  }$j$::jsonb);

  RAISE NOTICE 'Đã seed thành công 16 blocks cho trang chủ.';
END $$;
