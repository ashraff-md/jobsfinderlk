export type HomeBannerSlide = {
  href: string;
  imageUrl: string;
  alt: string;
};

export type HomeBannerCard = {
  slides: readonly [HomeBannerSlide, HomeBannerSlide, HomeBannerSlide];
};

/** Shared banner card with 3 auto-rotating slides */
export const HOME_BANNER_AD: HomeBannerCard = {
  slides: [
    {
      href: "/jobs?q=Technology",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCRYq9D7y8isAmQf4a_-bA1wy61pxxx-Qk1C4sUyF0HqT8zB-aIfwEpFJI2Mo53hN2tjYltcqh-LCry9krgWU5DxEXpgMEVQOUNpX3LzpBT-jVSgPRGzqaS5cNnZuzxrGnesQTQ0Y8ldIHOTMZyqbNVpPyUivdV5dLN8ZBQEJhfKKGb1l8oiffgDN_yraSX_TKdhJL8ix4v144m1b5-xEYiajHG4zHMplU_rFkOXJCeFsFl0FkpBLMry-G7nBTsnwm8HPDOx7feH8o1",
      alt: "Technology and engineering careers",
    },
    {
      href: "/jobs?q=Engineering",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDRhfrANQByF1wleEZjIPrfQ1wEVX2l581LSmtAzox6ZH2BI_VflwkPC3c3jOSzNo1XkFRpY993vJgADgKElEswnolNZutu08PczDSQWmH5lnlhAehrbi9Wtj4eOVhdCq13WgdnYNbHDpt4W48XGeEaeMu1CmeGVGHZUY6IwwMG1csVQ08zSg0Uqg2ib5FDxyUtIv1gtV3W9X62qoo-2zAEi5ohcnTND2v4Lenjy728klpSSFTJv1b2zatMKouY48F6En5YNW7TCDOc",
      alt: "Engineering opportunities",
    },
    {
      href: "/jobs?q=Healthcare",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBaui6OWDLzyR9wMBIBJUPcVrfygLZxud54Wb44qPIFKyLSyQIvPYrjfY2ksr8lillY3oVON4LoxLMGWxXAmH7lG3HU1j5ZvC2GrVYjGq_j_NiKNS4CrWOwKEXdzJ-iMDvXdLQK9KmpR3GXO00YMj8tAh2HSPzrgT51eZyY-4-qjzB5tMiDIODB4o_J06FIeQU50zlOIkGXqXnNd3s1J6A9fIh6fTX2lbEAp2qKg7UejY4W0aiM98ztub_YGzt-b5NkxAqnmMIov6JC",
      alt: "Healthcare and life sciences careers",
    },
  ],
};

export const HOME_BANNER_AD_SECOND: HomeBannerCard = {
  slides: [
    {
      href: "/jobs?category=Finance",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBd0O82qlrH0MPPwV_LkMoz6xJmd7vDhRySMAzr7OT9q66LcShR2mQchoZXGK0lyfesDvOCwg8F4Mw4cTeSx5j75rwCHddU7Lnhkie62qoP9LUGeAfZxdWOOUFcfF2HCtd_a7OoLw2TFKSMiDG-7_q3jKXSwzzrpmsP4xQultFaYBGysizJbzlTtlJktK9rA9yZTsndaHoH_62SM3FnLb7jwLvw2EhRpgKw3Y6E3iy6FbGJA2XBiHTkh5FwlWAjA7TOJbEq1am2Qy1d",
      alt: "Banking and finance roles",
    },
    {
      href: "/jobs?q=Marketing",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBfpg4l5fj-ZlE3jJVPiNCJGSyV1SpCbT3t6qUs0vff6E-6YY-uVh8WJBbnjKuA_pw-dwzg8FcswtOGcvjxKmYMSxlAX8ArrKE3FtPaZkASFpkT8MkYWSwhRfzksZoBXwYMP5HUElys9kQYXe65cAILrj1IiKiw6ziFPpPM_43Wu-g-tZ89W_demvqKxNzl5Z6dX6FGoxPI1cF_73XIbTF5tk30tRnYYcO_qozQmNvniMXQtSlxGG956po3t4meps8_89fmbFOMfSYi",
      alt: "Marketing and growth roles",
    },
    {
      href: "/jobs?q=Technology",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCRYq9D7y8isAmQf4a_-bA1wy61pxxx-Qk1C4sUyF0HqT8zB-aIfwEpFJI2Mo53hN2tjYltcqh-LCry9krgWU5DxEXpgMEVQOUNpX3LzpBT-jVSgPRGzqaS5cNnZuzxrGnesQTQ0Y8ldIHOTMZyqbNVpPyUivdV5dLN8ZBQEJhfKKGb1l8oiffgDN_yraSX_TKdhJL8ix4v144m1b5-xEYiajHG4zHMplU_rFkOXJCeFsFl0FkpBLMry-G7nBTsnwm8HPDOx7feH8o1",
      alt: "Innovation and digital roles",
    },
  ],
};

/** Wide banner pair (e.g. job detail after company reviews) */
export const HOME_BANNER_ADS_WIDE = [HOME_BANNER_AD, HOME_BANNER_AD_SECOND] as const;

export const HOME_BANNER_SLIDE_INTERVAL_MS = 3000;
