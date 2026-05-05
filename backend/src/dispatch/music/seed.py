"""Seed script: populates the music database with sample data.

Run with:  python -m src.dispatch.music.seed
"""

from datetime import date

from sqlmodel import Session, select

from src.dispatch.database import engine
from src.dispatch.music.models import Album, Artist, MusicEvent, Track

ARTISTS: list[dict] = [
    # ── Русский рок ─────────────────────────────────────────────────────────
    {
        "name": "Кино",
        "genre": "rock",
        "country": "СССР / Россия",
        "bio": "Советская рок-группа, основана Виктором Цоем в 1982 году. Один из ключевых коллективов русского рока.",
        "albums": [
            {"title": "45", "year": 1982, "tracks": ["Я объявляю свой дом", "Бездельник", "Когда-то ты был битником", "Весна"]},
            {"title": "Группа крови", "year": 1988, "tracks": ["Группа крови", "Закрой за мной дверь", "Война", "Фильмы"]},
            {"title": "Звезда по имени Солнце", "year": 1989, "tracks": ["Звезда по имени Солнце", "Муравейник", "Пачка сигарет", "Апрель"]},
        ],
    },
    {
        "name": "Земфира",
        "genre": "rock",
        "country": "Россия",
        "bio": "Российская певица и автор песен, одна из самых известных рок-исполнительниц постсоветского пространства.",
        "albums": [
            {"title": "Земфира", "year": 1999, "tracks": ["Ариведерчи", "Почему", "Хочешь?", "Ненавижу"]},
            {"title": "Прости меня моя любовь", "year": 2000, "tracks": ["Прости меня моя любовь", "Небо Лондона", "Rendez-Vous", "Не пара"]},
            {"title": "14 недель тишины", "year": 2002, "tracks": ["Вендетта", "Спид", "Ракеты", "Трафик"]},
        ],
    },
    {
        "name": "ДДТ",
        "genre": "rock",
        "country": "Россия",
        "bio": "Советская и российская рок-группа под руководством Юрия Шевчука, основана в 1980 году в Уфе.",
        "albums": [
            {"title": "Я получил эту роль", "year": 1989, "tracks": ["Я получил эту роль", "Дождь", "Периферия"]},
            {"title": "Это всё", "year": 1991, "tracks": ["Это всё", "Последняя осень", "Родина"]},
            {"title": "Актриса Весна", "year": 1992, "tracks": ["Актриса Весна", "Осень", "В последнюю осень"]},
        ],
    },
    {
        "name": "Наутилус Помпилиус",
        "genre": "rock",
        "country": "СССР / Россия",
        "bio": "Советская рок-группа из Свердловска, основана в 1982 году. Лидер — Вячеслав Бутусов.",
        "albums": [
            {"title": "Разлука", "year": 1986, "tracks": ["Скованные одной цепью", "Шар цвета хаки", "Я хочу быть с тобой"]},
            {"title": "Крылья", "year": 1995, "tracks": ["Крылья", "Люди на холме", "Последний человек на земле"]},
        ],
    },
    {
        "name": "Ария",
        "genre": "metal",
        "country": "Россия",
        "bio": "Российская хэви-метал группа, основана в 1985 году. Считается «русским Iron Maiden».",
        "albums": [
            {"title": "Мегаполис", "year": 1987, "tracks": ["Воля и разум", "Игра с огнём", "Паранойя", "Мёртвая зона"]},
            {"title": "Герой асфальта", "year": 1987, "tracks": ["Герой асфальта", "Улица роз", "Бесился", "Тореро"]},
            {"title": "Кровь за кровь", "year": 1991, "tracks": ["Кровь за кровь", "Раскачаем этот мир", "Антихрист"]},
        ],
    },
    {
        "name": "Би-2",
        "genre": "indie",
        "country": "Беларусь / Австралия",
        "bio": "Российско-белорусская рок-группа, основана в Минске в 1988 году. Расцвет — конец 1990-х.",
        "albums": [
            {"title": "Би-2", "year": 1999, "tracks": ["Полночь", "Варвара", "Компромисс", "Молоко"]},
            {"title": "Мяу-мяу", "year": 2002, "tracks": ["Мяу-мяу", "Серебро", "Лётчик", "Нежность"]},
            {"title": "Горгорот", "year": 2009, "tracks": ["Маяк", "Реки", "Пора"]},
        ],
    },
    # ── Мировой рок ──────────────────────────────────────────────────────────
    {
        "name": "The Beatles",
        "genre": "rock",
        "country": "Великобритания",
        "bio": "Британская рок-группа из Ливерпуля. Самая влиятельная группа в истории популярной музыки.",
        "albums": [
            {"title": "Abbey Road", "year": 1969, "tracks": ["Come Together", "Something", "Here Comes the Sun", "Oh! Darling", "Golden Slumbers"]},
            {"title": "Sgt. Pepper's Lonely Hearts Club Band", "year": 1967, "tracks": ["Lucy in the Sky with Diamonds", "With a Little Help from My Friends", "A Day in the Life", "When I'm Sixty-Four"]},
            {"title": "Revolver", "year": 1966, "tracks": ["Eleanor Rigby", "Yellow Submarine", "Here, There and Everywhere", "Got to Get You into My Life"]},
        ],
    },
    {
        "name": "Led Zeppelin",
        "genre": "rock",
        "country": "Великобритания",
        "bio": "Британская хард-рок группа, один из основоположников тяжёлого рока и хэви-метала.",
        "albums": [
            {"title": "Led Zeppelin IV", "year": 1971, "tracks": ["Stairway to Heaven", "Rock and Roll", "Black Dog", "When the Levee Breaks", "Going to California"]},
            {"title": "Physical Graffiti", "year": 1975, "tracks": ["Kashmir", "Trampled Under Foot", "Ten Years Gone", "Houses of the Holy"]},
        ],
    },
    {
        "name": "Pink Floyd",
        "genre": "rock",
        "country": "Великобритания",
        "bio": "Британская рок-группа, пионеры психоделического и прогрессивного рока. Продали более 250 миллионов копий.",
        "albums": [
            {"title": "The Dark Side of the Moon", "year": 1973, "tracks": ["Money", "Time", "Breathe", "The Great Gig in the Sky", "Brain Damage"]},
            {"title": "The Wall", "year": 1979, "tracks": ["Another Brick in the Wall", "Comfortably Numb", "Hey You", "Run Like Hell"]},
            {"title": "Wish You Were Here", "year": 1975, "tracks": ["Shine On You Crazy Diamond", "Welcome to the Machine", "Have a Cigar", "Wish You Were Here"]},
        ],
    },
    {
        "name": "Nirvana",
        "genre": "rock",
        "country": "США",
        "bio": "Американская гранж-группа из Сиэтла. Лидер Курт Кобейн. Символ поколения 1990-х.",
        "albums": [
            {"title": "Nevermind", "year": 1991, "tracks": ["Smells Like Teen Spirit", "Come as You Are", "Lithium", "In Bloom", "Polly"]},
            {"title": "In Utero", "year": 1993, "tracks": ["Heart-Shaped Box", "All Apologies", "Rape Me", "Frances Farmer Will Have Her Revenge"]},
        ],
    },
    {
        "name": "Radiohead",
        "genre": "indie",
        "country": "Великобритания",
        "bio": "Британская рок-группа, известна экспериментальным подходом к музыке.",
        "albums": [
            {"title": "OK Computer", "year": 1997, "tracks": ["Paranoid Android", "Karma Police", "No Surprises", "Exit Music (For a Film)", "Electioneering"]},
            {"title": "Kid A", "year": 2000, "tracks": ["Everything in Its Right Place", "How to Disappear Completely", "Idioteque", "Motion Picture Soundtrack"]},
            {"title": "In Rainbows", "year": 2007, "tracks": ["Weird Fishes/Arpeggi", "All I Need", "Reckoner", "House of Cards"]},
        ],
    },
    # ── Джаз ────────────────────────────────────────────────────────────────
    {
        "name": "Miles Davis",
        "genre": "jazz",
        "country": "США",
        "bio": "Американский джазовый трубач. Один из самых влиятельных музыкантов XX века, пионер кул-джаза и джаз-фьюжн.",
        "albums": [
            {"title": "Kind of Blue", "year": 1959, "tracks": ["So What", "Freddie Freeloader", "Blue in Green", "All Blues", "Flamenco Sketches"]},
            {"title": "Bitches Brew", "year": 1970, "tracks": ["Pharaoh's Dance", "Bitches Brew", "Spanish Key", "Miles Runs the Voodoo Down"]},
            {"title": "Round About Midnight", "year": 1957, "tracks": ["Round Midnight", "Ah-Leu-Cha", "All of You", "Bye Bye Blackbird"]},
        ],
    },
    {
        "name": "Нора Джонс",
        "genre": "jazz",
        "country": "США",
        "bio": "Американская джазовая певица и пианистка. Обладательница Grammy за альбом «Come Away with Me».",
        "albums": [
            {"title": "Come Away with Me", "year": 2002, "tracks": ["Don't Know Why", "Come Away with Me", "Feelin' the Same Way", "The Nearness of You", "Shoot the Moon"]},
            {"title": "Feels Like Home", "year": 2004, "tracks": ["Sunrise", "Those Sweet Words", "Be Here to Love Me", "The Long Way Home"]},
        ],
    },
    {
        "name": "John Coltrane",
        "genre": "jazz",
        "country": "США",
        "bio": "Американский джазовый саксофонист и композитор. Один из величайших музыкантов в истории джаза.",
        "albums": [
            {"title": "A Love Supreme", "year": 1965, "tracks": ["Acknowledgement", "Resolution", "Pursuance", "Psalm"]},
            {"title": "My Favorite Things", "year": 1961, "tracks": ["My Favorite Things", "Everytime We Say Goodbye", "Summertime", "But Not for Me"]},
        ],
    },
    # ── Классика ─────────────────────────────────────────────────────────────
    {
        "name": "Моцарт",
        "genre": "classical",
        "country": "Австрия",
        "bio": "Вольфганг Амадей Моцарт (1756–1791) — австрийский композитор эпохи классицизма. Автор более 600 произведений.",
        "albums": [
            {"title": "Симфонии №40 и №41", "year": 1788, "tracks": ["Симфония №40 соль минор — I. Molto allegro", "Симфония №40 — II. Andante", "Симфония №41 до мажор — IV. Molto allegro"]},
            {"title": "Реквием ре минор", "year": 1791, "tracks": ["Introitus", "Kyrie", "Dies irae", "Lacrimosa", "Agnus Dei"]},
            {"title": "Фортепианные сонаты", "year": 1784, "tracks": ["Соната №11 ля мажор (Турецкий марш)", "Соната №14 до минор", "Соната №16 до мажор"]},
        ],
    },
    {
        "name": "Чайковский",
        "genre": "classical",
        "country": "Россия",
        "bio": "Пётр Ильич Чайковский (1840–1893) — российский композитор эпохи романтизма. Автор балетов и симфоний.",
        "albums": [
            {"title": "Лебединое озеро", "year": 1876, "tracks": ["Вальс", "Адажио", "Па-де-де", "Сцена"]},
            {"title": "Симфония №6 «Патетическая»", "year": 1893, "tracks": ["I. Adagio – Allegro non troppo", "II. Allegro con grazia", "III. Allegro molto vivace", "IV. Finale: Adagio lamentoso"]},
            {"title": "Щелкунчик", "year": 1892, "tracks": ["Марш", "Танец феи Драже", "Вальс цветов", "Русский танец"]},
        ],
    },
    {
        "name": "Бах",
        "genre": "classical",
        "country": "Германия",
        "bio": "Иоганн Себастьян Бах (1685–1750) — немецкий композитор эпохи барокко. Автор более 1000 произведений.",
        "albums": [
            {"title": "Хорошо темперированный клавир I", "year": 1722, "tracks": ["Прелюдия и фуга до мажор", "Прелюдия и фуга до минор", "Прелюдия и фуга ре мажор"]},
            {"title": "Бранденбургские концерты", "year": 1721, "tracks": ["Концерт №1 фа мажор", "Концерт №3 соль мажор", "Концерт №5 ре мажор"]},
        ],
    },
    # ── Хип-хоп ──────────────────────────────────────────────────────────────
    {
        "name": "Eminem",
        "genre": "hip_hop",
        "country": "США",
        "bio": "Американский рэпер, один из самых продаваемых музыкантов в истории. Известен своей скоростью и провокационными текстами.",
        "albums": [
            {"title": "The Slim Shady LP", "year": 1999, "tracks": ["My Name Is", "Role Model", "Guilty Conscience", "Rock Bottom"]},
            {"title": "The Marshall Mathers LP", "year": 2000, "tracks": ["Stan", "The Way I Am", "Kim", "The Real Slim Shady", "Bitch Please II"]},
            {"title": "The Eminem Show", "year": 2002, "tracks": ["Without Me", "Cleanin' Out My Closet", "When the Music Stops", "Sing for the Moment"]},
        ],
    },
    {
        "name": "Kendrick Lamar",
        "genre": "hip_hop",
        "country": "США",
        "bio": "Американский рэпер из Комптона, Калифорния. Лауреат Пулитцеровской премии 2018 года за альбом DAMN.",
        "albums": [
            {"title": "good kid, m.A.A.d city", "year": 2012, "tracks": ["Backseat Freestyle", "Swimming Pools (Drank)", "Poetic Justice", "Money Trees", "m.A.A.d city"]},
            {"title": "To Pimp a Butterfly", "year": 2015, "tracks": ["King Kunta", "Alright", "These Walls", "How Much a Dollar Cost", "The Blacker the Berry"]},
            {"title": "DAMN.", "year": 2017, "tracks": ["HUMBLE.", "DNA.", "LOYALTY.", "LOVE.", "GOD."]},
        ],
    },
    {
        "name": "Oxxxymiron",
        "genre": "hip_hop",
        "country": "Россия",
        "bio": "Российский рэпер и лирик. Наиболее известен баттл-рэпом и альбомом «Горгород».",
        "albums": [
            {"title": "Вечный жид", "year": 2011, "tracks": ["Многоножка", "Нет связи", "Девочка пиздец"]},
            {"title": "Горгород", "year": 2015, "tracks": ["Признание нерелевантного лирика", "Где нас нет", "Город под подошвой", "Ultima Thule", "Полигон"]},
        ],
    },
    # ── Электронная ──────────────────────────────────────────────────────────
    {
        "name": "Daft Punk",
        "genre": "electronic",
        "country": "Франция",
        "bio": "Французский электронный дуэт, основан в 1993 году. Один из символов электронной музыки.",
        "albums": [
            {"title": "Discovery", "year": 2001, "tracks": ["One More Time", "Digital Love", "Harder, Better, Faster, Stronger", "Instant Crush", "Face to Face"]},
            {"title": "Random Access Memories", "year": 2013, "tracks": ["Get Lucky", "Lose Yourself to Dance", "Instant Crush", "Within", "Beyond"]},
            {"title": "Homework", "year": 1997, "tracks": ["Around the World", "Da Funk", "Revolution 909", "Rollin' & Scratchin'"]},
        ],
    },
    {
        "name": "The Chemical Brothers",
        "genre": "electronic",
        "country": "Великобритания",
        "bio": "Британский дуэт электронной музыки. Пионеры big beat и брейкбит-электроники.",
        "albums": [
            {"title": "Exit Planet Dust", "year": 1995, "tracks": ["Leave Home", "In Dust We Trust", "Song to the Siren", "Three Little Birdies Down Beats"]},
            {"title": "Dig Your Own Hole", "year": 1997, "tracks": ["Block Rockin' Beats", "Elektrobank", "The Private Psychedelic Reel", "Setting Sun"]},
        ],
    },
    {
        "name": "Aphex Twin",
        "genre": "electronic",
        "country": "Великобритания",
        "bio": "Британский музыкант Ричард Джеймс. Один из самых влиятельных исполнителей электронной музыки.",
        "albums": [
            {"title": "Selected Ambient Works 85–92", "year": 1992, "tracks": ["Xtal", "Tha", "Pulsewidth", "Actium", "Ptolemy"]},
            {"title": "Richard D. James Album", "year": 1996, "tracks": ["4", "Cornish Spreadeagle", "Milk Man", "Goon Gumpas"]},
        ],
    },
    # ── Поп ──────────────────────────────────────────────────────────────────
    {
        "name": "Michael Jackson",
        "genre": "pop",
        "country": "США",
        "bio": "«Король поп-музыки». Один из самых продаваемых музыкантов в мире.",
        "albums": [
            {"title": "Thriller", "year": 1982, "tracks": ["Thriller", "Billie Jean", "Beat It", "Wanna Be Startin' Somethin'", "Human Nature"]},
            {"title": "Bad", "year": 1987, "tracks": ["Bad", "The Way You Make Me Feel", "Man in the Mirror", "Smooth Criminal", "Dirty Diana"]},
            {"title": "Off the Wall", "year": 1979, "tracks": ["Don't Stop 'Til You Get Enough", "Rock with You", "Off the Wall", "She's Out of My Life"]},
        ],
    },
    {
        "name": "Мадонна",
        "genre": "pop",
        "country": "США",
        "bio": "«Королева поп-музыки». Одна из самых продаваемых музыкальных исполнительниц в мире.",
        "albums": [
            {"title": "Like a Virgin", "year": 1984, "tracks": ["Material Girl", "Like a Virgin", "Angel", "Dress You Up"]},
            {"title": "Ray of Light", "year": 1998, "tracks": ["Frozen", "Ray of Light", "The Power of Good-Bye", "Nothing Really Matters"]},
        ],
    },
    # ── Фолк ──────────────────────────────────────────────────────────────────
    {
        "name": "Bob Dylan",
        "genre": "folk",
        "country": "США",
        "bio": "Американский певец-автор песен, лауреат Нобелевской премии по литературе 2016 года.",
        "albums": [
            {"title": "The Freewheelin' Bob Dylan", "year": 1963, "tracks": ["Blowin' in the Wind", "Girl from the North Country", "Masters of War", "A Hard Rain's a-Gonna Fall"]},
            {"title": "Highway 61 Revisited", "year": 1965, "tracks": ["Like a Rolling Stone", "Highway 61 Revisited", "Ballad of a Thin Man", "Desolation Row"]},
        ],
    },
    {
        "name": "Nick Drake",
        "genre": "folk",
        "country": "Великобритания",
        "bio": "Британский певец-автор песен. Недооценённый при жизни, он стал культовой фигурой посмертно.",
        "albums": [
            {"title": "Pink Moon", "year": 1972, "tracks": ["Pink Moon", "Place to Be", "Things Behind the Sun", "From the Morning"]},
            {"title": "Bryter Layter", "year": 1970, "tracks": ["Hazey Jane II", "At the Chime of a City Clock", "One of These Things First", "Fly"]},
        ],
    },
    # ── R&B ───────────────────────────────────────────────────────────────────
    {
        "name": "Марвин Гэй",
        "genre": "rnb",
        "country": "США",
        "bio": "Американский певец и автор песен. Один из самых влиятельных исполнителей соула и R&B.",
        "albums": [
            {"title": "What's Going On", "year": 1971, "tracks": ["What's Going On", "What's Happening Brother", "Mercy Mercy Me", "Inner City Blues"]},
            {"title": "Let's Get It On", "year": 1973, "tracks": ["Let's Get It On", "Please Stay (Once You Go Away)", "Come Get to This", "Distant Lover"]},
        ],
    },
    {
        "name": "Beyoncé",
        "genre": "rnb",
        "country": "США",
        "bio": "Американская певица, танцовщица и актриса. Одна из самых влиятельных звёзд современной музыки.",
        "albums": [
            {"title": "Lemonade", "year": 2016, "tracks": ["Hold Up", "Formation", "Sorry", "Don't Hurt Yourself", "Freedom"]},
            {"title": "Dangerously in Love", "year": 2003, "tracks": ["Crazy in Love", "Baby Boy", "Me, Myself and I", "Naughty Girl"]},
        ],
    },
    # ── Метал ─────────────────────────────────────────────────────────────────
    {
        "name": "Metallica",
        "genre": "metal",
        "country": "США",
        "bio": "Американская хэви-метал группа, одна из «большой четвёрки» трэш-метала.",
        "albums": [
            {"title": "Master of Puppets", "year": 1986, "tracks": ["Battery", "Master of Puppets", "The Thing That Should Not Be", "Orion", "Damage, Inc."]},
            {"title": "Metallica (Black Album)", "year": 1991, "tracks": ["Enter Sandman", "The Unforgiven", "Nothing Else Matters", "Wherever I May Roam", "Sad but True"]},
            {"title": "...And Justice for All", "year": 1988, "tracks": ["Blackened", "...And Justice for All", "One", "To Live Is to Die"]},
        ],
    },
    {
        "name": "Iron Maiden",
        "genre": "metal",
        "country": "Великобритания",
        "bio": "Британская хэви-метал группа, основана в 1975 году. Один из ключевых представителей «британского нашествия» метала.",
        "albums": [
            {"title": "The Number of the Beast", "year": 1982, "tracks": ["The Number of the Beast", "Run to the Hills", "Children of the Damned", "Hallowed Be Thy Name"]},
            {"title": "Powerslave", "year": 1984, "tracks": ["Aces High", "2 Minutes to Midnight", "Rime of the Ancient Mariner", "Powerslave"]},
        ],
    },
    # ── Инди ──────────────────────────────────────────────────────────────────
    {
        "name": "Arctic Monkeys",
        "genre": "indie",
        "country": "Великобритания",
        "bio": "Британская инди-рок группа из Шеффилда. Один из самых успешных британских артистов 2000-х.",
        "albums": [
            {"title": "Whatever People Say I Am, That's What I'm Not", "year": 2006, "tracks": ["I Bet You Look Good on the Dancefloor", "R U Mine?", "Fluorescent Adolescent", "505"]},
            {"title": "AM", "year": 2013, "tracks": ["Do I Wanna Know?", "R U Mine?", "Why'd You Only Call Me When You're High?", "Arabella"]},
            {"title": "Tranquility Base Hotel & Casino", "year": 2018, "tracks": ["Star Treatment", "One Point Perspective", "Four Out of Five", "The Ultracheese"]},
        ],
    },
]

EVENTS: list[dict] = [
    # Беларусь
    {"title": "Рок-фестиваль «Живые» 2025", "city": "Минск", "date": date(2025, 7, 12), "genre": "rock", "venue": "Стадион «Динамо»"},
    {"title": "Jazz в Парке", "city": "Минск", "date": date(2025, 8, 3), "genre": "jazz", "venue": "Центральный ботанический сад"},
    {"title": "Metal Battle 2025", "city": "Минск", "date": date(2025, 11, 15), "genre": "metal", "venue": "Клуб «Rockstar»"},
    {"title": "R&B Night Minsk", "city": "Минск", "date": date(2025, 10, 25), "genre": "rnb", "venue": "Клуб «Re:public»"},
    {"title": "Indie Fest Minsk", "city": "Минск", "date": date(2026, 3, 14), "genre": "indie", "venue": "Арт-площадка «ОК16»"},
    # Россия — Москва
    {"title": "Фестиваль электронной музыки VOLT", "city": "Москва", "date": date(2025, 6, 21), "genre": "electronic", "venue": "Парк «Горького»"},
    {"title": "Hip-Hop Nation 2025", "city": "Москва", "date": date(2025, 10, 4), "genre": "hip_hop", "venue": "Олимпийский стадион"},
    {"title": "Pop Stars Live", "city": "Москва", "date": date(2025, 12, 20), "genre": "pop", "venue": "Лужники"},
    {"title": "Moscow Jazz Festival", "city": "Москва", "date": date(2025, 9, 20), "genre": "jazz", "venue": "Клуб «Мастерская»"},
    {"title": "Rock the Capital", "city": "Москва", "date": date(2026, 2, 7), "genre": "rock", "venue": "VTB Arena"},
    # Россия — Санкт-Петербург
    {"title": "Классика под открытым небом", "city": "Санкт-Петербург", "date": date(2025, 7, 18), "genre": "classical", "venue": "Дворцовая площадь"},
    {"title": "Фестиваль авторской песни", "city": "Санкт-Петербург", "date": date(2025, 9, 13), "genre": "folk", "venue": "Парк «Елагин остров»"},
    {"title": "Electronic Nights SPb", "city": "Санкт-Петербург", "date": date(2025, 11, 22), "genre": "electronic", "venue": "Клуб «Зал ожидания»"},
    {"title": "Metal Fest Petersburg", "city": "Санкт-Петербург", "date": date(2026, 4, 18), "genre": "metal", "venue": "СКК Петербургский"},
    # Другие города
    {"title": "Indie Weekend Vilnius", "city": "Вильнюс", "date": date(2025, 9, 5), "genre": "indie", "venue": "Культурный центр «Лофт»"},
    {"title": "Folk Gathering Kyiv", "city": "Киев", "date": date(2025, 8, 24), "genre": "folk", "venue": "Площадь Независимости"},
    {"title": "Electronic Beats Riga", "city": "Рига", "date": date(2025, 7, 30), "genre": "electronic", "venue": "Arena Riga"},
    {"title": "Jazz на Волге", "city": "Нижний Новгород", "date": date(2025, 8, 16), "genre": "jazz", "venue": "Нижегородская ярмарка"},
    {"title": "Ural Music Night", "city": "Екатеринбург", "date": date(2025, 6, 28), "genre": "rock", "venue": "Площадь 1905 года"},
    {"title": "Classical Gala Warsaw", "city": "Варшава", "date": date(2025, 12, 5), "genre": "classical", "venue": "Варшавская филармония"},
    {"title": "Hip-Hop Summit Almaty", "city": "Алматы", "date": date(2026, 1, 18), "genre": "hip_hop", "venue": "Sport Palace"},
    {"title": "Pop Explosion Tbilisi", "city": "Тбилиси", "date": date(2026, 5, 9), "genre": "pop", "venue": "Концертный зал «Арена»"},
]


def seed():
    with Session(engine) as db:
        existing = db.exec(select(Artist)).first()
        if existing:
            print("Database already seeded, skipping.")
            return

        print("Seeding music database...")

        for a_data in ARTISTS:
            artist = Artist(
                name=a_data["name"],
                genre=a_data["genre"],
                country=a_data["country"],
                bio=a_data.get("bio"),
            )
            db.add(artist)
            db.flush()

            for alb_data in a_data.get("albums", []):
                album = Album(
                    artist_id=artist.id,
                    title=alb_data["title"],
                    year=alb_data["year"],
                    genre=a_data["genre"],
                )
                db.add(album)
                db.flush()

                for idx, track_title in enumerate(alb_data.get("tracks", []), start=1):
                    track = Track(
                        album_id=album.id,
                        title=track_title,
                        track_number=idx,
                    )
                    db.add(track)

        for ev in EVENTS:
            db.add(MusicEvent(**ev))

        db.commit()
        total_albums = sum(len(a["albums"]) for a in ARTISTS)
        total_tracks = sum(len(alb["tracks"]) for a in ARTISTS for alb in a["albums"])
        print(f"✓ Seeded {len(ARTISTS)} artists, {total_albums} albums, {total_tracks} tracks, {len(EVENTS)} events.")


if __name__ == "__main__":
    seed()
