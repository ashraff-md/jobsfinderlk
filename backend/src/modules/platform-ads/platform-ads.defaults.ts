import { BannerAspectRatio } from '@prisma/client';

export type DefaultBannerSlide = {
  href: string;
  imageUrl: string;
  alt: string;
};

export type DefaultBannerSlot = {
  key: string;
  label: string;
  aspectRatio: BannerAspectRatio;
  sortOrder: number;
  slides: [DefaultBannerSlide, DefaultBannerSlide, DefaultBannerSlide];
};

/** Placeholder slots — images are uploaded via admin campaigns, not remote URLs. */
export const DEFAULT_BANNER_SLOTS: DefaultBannerSlot[] = [
  {
    key: 'HOME_WIDE_PRIMARY',
    label: 'Home — wide banner A (3:2)',
    aspectRatio: BannerAspectRatio.RATIO_3_2,
    sortOrder: 0,
    slides: [
      {
        href: '/jobs?q=Technology',
        imageUrl: '',
        alt: 'Technology and engineering careers',
      },
      {
        href: '/jobs?q=Engineering',
        imageUrl: '',
        alt: 'Engineering opportunities',
      },
      {
        href: '/jobs?q=Healthcare',
        imageUrl: '',
        alt: 'Healthcare and life sciences careers',
      },
    ],
  },
  {
    key: 'HOME_WIDE_SECONDARY',
    label: 'Home — wide banner B (3:2)',
    aspectRatio: BannerAspectRatio.RATIO_3_2,
    sortOrder: 1,
    slides: [
      {
        href: '/jobs?category=Finance',
        imageUrl: '',
        alt: 'Banking and finance roles',
      },
      {
        href: '/jobs?q=Marketing',
        imageUrl: '',
        alt: 'Marketing and growth roles',
      },
      {
        href: '/jobs?q=Technology',
        imageUrl: '',
        alt: 'Innovation and digital roles',
      },
    ],
  },
  {
    key: 'SHARED_TALL_PRIMARY',
    label: 'Tall sidebar — primary (2:5)',
    aspectRatio: BannerAspectRatio.RATIO_2_5,
    sortOrder: 2,
    slides: [
      {
        href: '/jobs?q=Technology',
        imageUrl: '',
        alt: 'Technology careers',
      },
      {
        href: '/jobs?q=Engineering',
        imageUrl: '',
        alt: 'Engineering roles',
      },
      {
        href: '/jobs?q=Healthcare',
        imageUrl: '',
        alt: 'Healthcare roles',
      },
    ],
  },
  {
    key: 'JOB_DETAIL_TALL_SECONDARY',
    label: 'Job detail — tall sidebar B (2:5)',
    aspectRatio: BannerAspectRatio.RATIO_2_5,
    sortOrder: 3,
    slides: [
      {
        href: '/jobs?category=Finance',
        imageUrl: '',
        alt: 'Finance roles',
      },
      {
        href: '/jobs?q=Marketing',
        imageUrl: '',
        alt: 'Marketing roles',
      },
      {
        href: '/jobs?q=Technology',
        imageUrl: '',
        alt: 'Technology roles',
      },
    ],
  },
];
