import { BibleBook, Hymn } from '../types';

export const INITIAL_HYMNS: Hymn[] = [
  {
    id: 'nr-1',
    book: 'NR',
    number: 1,
    title: 'Haleluya! Pujilah',
    tempoOrTone: 'Do = C · 4/4 · Khidmat & Agungkanlah',
    verses: [
      {
        number: 1,
        lines: [
          'Haleluya! Pujilah Allah yang agung, Mahaesa!',
          'Dalam Kristus kita kenal Allah yang hidup, Bapa kekal!',
          'Langit, buana, semesta, patut memuji kuasa-Nya,',
          'karna berkat-Nya tak henti, limpah kasih-Nya tak terperi.',
        ],
      },
      {
        number: 2,
        lines: [
          'Wahai dunia, soraklah! Angkat suaramu, nyanyilah!',
          'Tabuhlah tifa dan gendang, iringi puji dalam tembang!',
          'Masyhurkanlah keagungan-Nya, kasih setia-Nya selamanya!',
          'Haleluya! Pujilah Allah yang agung, Mahaesa!',
        ],
      },
      {
        number: 3,
        lines: [
          'Bumi dan laut bersoraklah, gunung dan lembah bernyanyilah!',
          'Segala bangsa sujud sembah di hadirat Tuhan yang mulia.',
          'Damai sejahtera turunlah atas seluruh umat-Nya.',
          'Haleluya! Pujilah Allah yang agung, Mahaesa!',
        ],
      },
    ],
  },
  {
    id: 'nr-3',
    book: 'NR',
    number: 3,
    title: 'Hormat Bagi Allah Bapa',
    tempoOrTone: 'Do = G · 3/4 · Agung',
    verses: [
      {
        number: 1,
        lines: [
          'Hormat bagi Allah Bapa, hormat bagi Anak-Nya,',
          'hormat bagi Roh Penghibur, ketiganya yang Esa!',
          'Haleluya, haleluya, ketiganya yang Esa!',
        ],
      },
      {
        number: 2,
        lines: [
          'Hormat bagi Raja Sorga, Tuhan kaum manusia,',
          'hormat bagi Raja G’reja di seluruh dunia!',
          'Haleluya, haleluya, di seluruh dunia!',
        ],
      },
    ],
  },
  {
    id: 'nr-137',
    book: 'NR',
    number: 137,
    title: 'Sudah Kudapat Sayang Tuhan',
    tempoOrTone: 'Do = Bes · 4/4 · Tenang',
    verses: [
      {
        number: 1,
        lines: [
          'Sudah kudapat sayang Tuhan, meskipun aku bercela.',
          'Di atas kayu salib Kristus menanggung dosa dunia.',
          'Kar’na kasih-Nya yang kudus, jiwaku t’lah ditebus.',
        ],
      },
      {
        number: 2,
        lines: [
          'Kuasa dosa t’lah patah, hati yang gundah pun tenang.',
          'Firman-Nya bagai pelita yang menuntunku ke terang.',
          'Syukur kupanjatkan terus pada Penebus yang kudus.',
        ],
      },
    ],
  },
  {
    id: 'kj-1',
    book: 'KJ',
    number: 1,
    title: 'Haleluya! Pujilah',
    tempoOrTone: 'Do = F · 4/4 · Bersemangat',
    refrain: [
      'Haleluya! Pujilah Allah Yang Agung, Mahaesa!',
      'Dalam Kristus kita kenal Allah Yang Hidup, Bapa kekal!',
    ],
    verses: [
      {
        number: 1,
        lines: [
          'Langit, buana, semesta patut memuji kuasa-Nya,',
          'kar’na berkat-Nya tak henti, limpah kasih-Nya tak terperi.',
        ],
      },
      {
        number: 2,
        lines: [
          'Wahai dunia, soraklah! Angkat suaramu, nyanyilah!',
          'Tabuhlah tifa dan gendang, iringi puji dalam tembang!',
        ],
      },
    ],
  },
  {
    id: 'kj-242',
    book: 'KJ',
    number: 242,
    title: 'Muliakan Allah Bapa',
    tempoOrTone: 'Do = G · 4/4 · Gagah',
    verses: [
      {
        number: 1,
        lines: [
          'Muliakan Allah Bapa, muliakan Putra-Nya,',
          'muliakan Roh Penghibur, Ketiganya Yang Esa!',
          'Haleluya, puji Dia kini dan selamanya!',
        ],
      },
      {
        number: 2,
        lines: [
          'Muliakan Raja Kasih yang menjadi Penebus,',
          'yang membuat kita waris Kerajaan-Nya terus.',
          'Haleluya, puji Dia, Anak Domba yang kudus!',
        ],
      },
    ],
  },
  {
    id: 'kj-392',
    book: 'KJ',
    number: 392,
    title: 'Kuberbahagia',
    tempoOrTone: 'Do = D · 9/8 · Syahdu',
    refrain: [
      'Aku bernyanyi bahagia memuji Yesus selamanya.',
      'Aku bernyanyi bahagia memuji Yesus selamanya.',
    ],
    verses: [
      {
        number: 1,
        lines: [
          'Kuberbahagia, yakin teguh: Yesus abadi kepunyaanku!',
          'Aku waris-Nya, kuditebus, ciptaan baru Rohulkudus.',
        ],
      },
      {
        number: 2,
        lines: [
          'Pasrah sempurna, nikmat penuh; suka sorgawi melimpahiku.',
          'Lagu malaikat amat merdu; kasih dan rahmat besertaku.',
        ],
      },
    ],
  },
  {
    id: 'pkj-14',
    book: 'PKJ',
    number: 14,
    title: 'Kunyanyikan Kasih Setia Tuhan',
    tempoOrTone: 'Do = C · 4/4 · Riang',
    verses: [
      {
        number: 1,
        lines: [
          'Kunyanyikan kasih setia Tuhan selamanya, selamanya.',
          'Kunyanyikan kasih setia Tuhan selamanya, kunyanyikan s’lamanya.',
          'Kututurkan tak jemu kasih setia-Mu, Tuhan;',
          'kututurkan tak jemu kasih setia-Mu turun-temurun.',
        ],
      },
    ],
  },
  {
    id: 'pkj-219',
    book: 'PKJ',
    number: 219,
    title: 'Di Saat Ini Kuangkat Tembang',
    tempoOrTone: 'Do = F · 3/4 · Khidmat',
    verses: [
      {
        number: 1,
        lines: [
          'Di saat ini kuangkat tembang, kuangkat tembang bagi Yesus.',
          'Di saat ini kuucap syukur, kuucap syukur pada-Nya.',
          'Kukasihi Engkau, kukasihi Engkau,',
          'kukasihi Engkau, Yesus, Tuhanku.',
        ],
      },
      {
        number: 2,
        lines: [
          'Di saat ini kudatang sembah, kudatang sembah pada Yesus.',
          'Di saat ini kuberserah penuh, kuberserah pada-Nya.',
          'Kukasihi Engkau, kukasihi Engkau,',
          'kukasihi Engkau, Yesus, Tuhanku.',
        ],
      },
    ],
  },
  {
    id: 'nkb-17',
    book: 'NKB',
    number: 17,
    title: 'Agunglah Kasih Allahku',
    tempoOrTone: 'Do = Es · 3/4 · Mendalam',
    refrain: [
      'Oh, kasih Allah agunglah! Tiada bandingnya!',
      'Kekal teguh dan mulia! Dijunjung umat-Nya.',
    ],
    verses: [
      {
        number: 1,
        lines: [
          'Agunglah kasih Allahku, tiada yang setaranya;',
          'Neraka dapat direngkuh, kartika pun tergapailah.',
          'Kar’na kasih-Nya agunglah, Sang Putra menjelma,',
          'Dia mencari yang sesat dan diampuni-Nya.',
        ],
      },
      {
        number: 2,
        lines: [
          'Pabila zaman berhenti dan tahta dunia pun lebur,',
          'meskipun orang yang keji telah menjauh dan tekebur,',
          'namun kasih-Nya tetaplah, teguh dan mulia.',
          'Anug’rah bagi manusia dijunjung umat-Nya.',
        ],
      },
    ],
  },
  {
    id: 'dsl-173',
    book: 'DSL',
    number: 173,
    title: 'Jangan Takut, Aku Besertamu',
    tempoOrTone: 'Do = G · 4/4 · Penghiburan',
    refrain: [
      'Jangan takut, jangan bimbang, Tuhan Yesus beserta;',
      'siang malam Ia jaga umat yang percaya-Nya.',
    ],
    verses: [
      {
        number: 1,
        lines: [
          'Dalam susah maupun duka, bila badai menempuh,',
          'ingat janji Jurus’lamat: “Aku tetap sertamu!”',
        ],
      },
      {
        number: 2,
        lines: [
          'Langkah kaki di lembah g’lap dituntun oleh terang,',
          'hingga tiba di rumah Bapa, hati pun jadi senang.',
        ],
      },
    ],
  },
];

export const INITIAL_BIBLE_BOOKS: BibleBook[] = [
  {
    id: 'kejadian',
    name: 'Kejadian',
    testament: 'PL',
    chapters: [
      {
        chapter: 1,
        verses: [
          { verse: 1, text: 'Pada mulanya Allah menciptakan langit dan bumi.' },
          {
            verse: 2,
            text: 'Bumi belum berbentuk dan kosong; gelap gulita menutupi samudera raya, dan Roh Allah melayang-layang di atas permukaan air.',
          },
          { verse: 3, text: 'Berfirmanlah Allah: "Jadilah terang." Lalu terang itu jadi.' },
          {
            verse: 4,
            text: 'Allah melihat bahwa terang itu baik, lalu dipisahkan-Nyalah terang itu dari gelap.',
          },
          {
            verse: 5,
            text: 'Dan Allah menamai terang itu siang, dan gelap itu malam. Jadilah petang dan jadilah pagi, itulah hari pertama.',
          },
        ],
      },
    ],
  },
  {
    id: 'mazmur',
    name: 'Mazmur',
    testament: 'PL',
    chapters: [
      {
        chapter: 23,
        verses: [
          { verse: 1, text: 'Mazmur Daud. TUHAN adalah gembalaku, takkan kekurangan aku.' },
          {
            verse: 2,
            text: 'Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang;',
          },
          {
            verse: 3,
            text: 'Ia menyegarkan jiwaku. Ia menuntun aku di jalan yang benar oleh karena nama-Nya.',
          },
          {
            verse: 4,
            text: 'Sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku; gada-Mu dan tongkat-Mu, itulah yang menghibur aku.',
          },
          {
            verse: 5,
            text: 'Engkau menyediakan hidangan bagiku, di hadapan lawanku; Engkau mengurapi kepalaku dengan minyak; pialaku penuh melimpah.',
          },
          {
            verse: 6,
            text: 'Kebajikan dan kemurahan belaka akan mengikuti aku, seumur hidupku; dan aku akan diam dalam rumah TUHAN sepanjang masa.',
          },
        ],
      },
      {
        chapter: 121,
        verses: [
          {
            verse: 1,
            text: 'Nyanyian ziarah. Aku melayangkan mataku ke gunung-gunung; dari manakah akan datang pertolonganku?',
          },
          {
            verse: 2,
            text: 'Pertolonganku ialah dari TUHAN, yang menjadikan langit dan bumi.',
          },
          {
            verse: 3,
            text: 'Ia takkan membiarkan kakimu goyah, Penjagamu tidak akan terlelap.',
          },
          {
            verse: 4,
            text: 'Sesungguhnya tidak terlelap dan tidak tertidur Penjaga Israel.',
          },
          {
            verse: 5,
            text: 'TUHANlah Penjagamu, TUHANlah naunganmu di sebelah tangan kananmu.',
          },
          {
            verse: 6,
            text: 'Matahari tidak menyakiti engkau pada waktu siang, atau bulan pada waktu malam.',
          },
          {
            verse: 7,
            text: 'TUHAN akan menjaga engkau terhadap segala kecelakaan; Ia akan menjaga nyawamu.',
          },
          {
            verse: 8,
            text: 'TUHAN akan menjaga keluar masukmu, dari sekarang sampai selama-lamanya.',
          },
        ],
      },
    ],
  },
  {
    id: 'yesaya',
    name: 'Yesaya',
    testament: 'PL',
    chapters: [
      {
        chapter: 40,
        verses: [
          {
            verse: 28,
            text: 'Tidakkah kautahu, dan tidakkah kaudengar? TUHAN ialah Allah kekal yang menciptakan bumi dari ujung ke ujung; Ia tidak menjadi lelah dan tidak menjadi lesu, tidak terduga pengertian-Nya.',
          },
          {
            verse: 29,
            text: 'Dia memberi kekuatan kepada yang lelah dan menambah semangat kepada yang tiada berdaya.',
          },
          {
            verse: 30,
            text: 'Orang-orang muda menjadi lelah dan lesu dan teruna-teruna jatuh tersandung,',
          },
          {
            verse: 31,
            text: 'tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.',
          },
        ],
      },
    ],
  },
  {
    id: 'yohanes',
    name: 'Yohanes',
    testament: 'PB',
    chapters: [
      {
        chapter: 3,
        verses: [
          {
            verse: 16,
            text: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.',
          },
          {
            verse: 17,
            text: 'Sebab Allah mengutus Anak-Nya ke dalam dunia bukan untuk menghakimi dunia, melainkan untuk menyelamatkannya oleh Dia.',
          },
        ],
      },
      {
        chapter: 15,
        verses: [
          {
            verse: 5,
            text: 'Akulah pokok anggur dan kamulah ranting-rantingnya. Barangsiapa tinggal di dalam Aku dan Aku di dalam dia, ia berbuah banyak, sebab di luar Aku kamu tidak dapat berbuat apa-apa.',
          },
          {
            verse: 12,
            text: 'Inilah perintah-Ku, yaitu supaya kamu saling mengasihi, seperti Aku telah mengasihi kamu.',
          },
        ],
      },
    ],
  },
  {
    id: 'roma',
    name: 'Roma',
    testament: 'PB',
    chapters: [
      {
        chapter: 8,
        verses: [
          {
            verse: 28,
            text: 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.',
          },
          {
            verse: 38,
            text: 'Sebab aku yakin, bahwa baik maut, maupun hidup, baik malaikat-malaikat, maupun pemerintah-pemerintah, baik yang ada sekarang, maupun yang akan datang,',
          },
          {
            verse: 39,
            text: 'atau kuasa-kuasa, baik yang di atas, maupun yang di bawah, ataupun sesuatu makhluk lain, tidak akan dapat memisahkan kita dari kasih Allah, yang ada dalam Kristus Yesus, Tuhan kita.',
          },
        ],
      },
    ],
  },
  {
    id: '1-korintus',
    name: '1 Korintus',
    testament: 'PB',
    chapters: [
      {
        chapter: 13,
        verses: [
          {
            verse: 4,
            text: 'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.',
          },
          {
            verse: 5,
            text: 'Ia tidak melakukan yang tidak sopan dan tidak mencari keuntungan diri sendiri. Ia tidak pemarah dan tidak menyimpan kesalahan orang lain.',
          },
          {
            verse: 6,
            text: 'Ia tidak bersukacita karena ketidakadilan, tetapi karena kebenaran.',
          },
          {
            verse: 7,
            text: 'Ia menutupi segala sesuatu, percaya segala sesuatu, mengharapkan segala sesuatu, sabar menanggung segala sesuatu.',
          },
          {
            verse: 13,
            text: 'Demikianlah tinggal ketiga hal ini, yaitu iman, pengharapan dan kasih, dan yang paling besar di antaranya ialah kasih.',
          },
        ],
      },
    ],
  },
  {
    id: 'filipi',
    name: 'Filipi',
    testament: 'PB',
    chapters: [
      {
        chapter: 4,
        verses: [
          {
            verse: 4,
            text: 'Bersukacitalah senantiasa dalam Tuhan! Sekali lagi kukatakan: Bersukacitalah!',
          },
          {
            verse: 6,
            text: 'Janganlah hendaknya kamu kuatir tentang apapun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.',
          },
          {
            verse: 7,
            text: 'Damai sejahtera Allah, yang melampaui segala akal, akan memelihara hati dan pikiranmu dalam Kristus Yesus.',
          },
          {
            verse: 13,
            text: 'Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.',
          },
        ],
      },
    ],
  },
];
