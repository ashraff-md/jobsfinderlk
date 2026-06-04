import { Icon } from "@/components/ui/icon";

const MOCK_REVIEWS = [
  {
    name: "Senior UX Engineer",
    meta: "Current Employee • 2 years at TechNexus",
    quote:
      "Amazing culture and freedom to experiment with new technologies. The design team is highly respected within the organization.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnvQxnpd8rhMq_amkn7OVe4lxd4LBCIIjn9h-8_DVpKUVd5FYABeftshxYdPAiHYzDGa_kxE_dFqehN56PWO3rRf79BAx46fhppJB1jvqoxTa523nVrYEkHsr4mAjRVVPGJ2CcXnOnFq2U3hbBy3U_3XP_vMqp6V0tkIgurlHL1F8hgZqMysGg3t_vUx-L-hg-ItpoxgxyLkia8HMTEmapHnEbSSSzklzl4mtOunWtZUrRP52IJmew2xbZLYzJNRuaouyJA1EbvDOb",
  },
  {
    name: "Product Manager",
    meta: "Former Employee • 4 years at TechNexus",
    quote:
      "Fast-paced environment but very rewarding. Great benefits and strong emphasis on professional development.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClpqDxn4uhulr2S6zobM_ZdBmb2cL0rsbXS9fgOmiAwWl2qB_ASH6rQRF7VUyjDRUgGpBbAC4XiWMJE9FrQ_ZTZsp2dDA66MjikkdJFqFmvMKJvjuz1YtiOxXb3S5oy48aWGWhEyfK82Q_FvtgJIurhjYNhUKIgIcVCAaZCCN3GM0BavFiSMKtDpuFhpMQkiGO0kmMjuf8qbscO7W1HaO9zM_1ledrlaMg_aWLrpb2llGFNi50SIjF0aJfFAdnnZNSkQSZG9G5xGqV",
  },
];

function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`mb-6 border-l-4 border-secondary pl-4 text-2xl font-extrabold tracking-tight text-navy-deep md:text-[32px] ${className ?? ""}`}
    >
      {children}
    </h2>
  );
}

export function JobDetailCompanyReviews() {
  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionHeading className="mb-2">Company Reviews</SectionHeading>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex text-amber-500">
              <Icon name="star" filled />
              <Icon name="star" filled />
              <Icon name="star" filled />
              <Icon name="star" filled />
              <Icon name="star_half" />
            </div>
            <span className="font-label-bold text-on-surface">4.2</span>
            <span className="font-label-sm text-on-surface-variant">(128 reviews)</span>
          </div>
        </div>
        <button type="button" className="font-label-bold font-bold text-navy-deep hover:underline">
          Read All Reviews
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {MOCK_REVIEWS.map((review) => (
          <div
            key={review.name}
            className="rounded-xl border border-outline-variant bg-white p-8 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={review.name}
                className="h-12 w-12 rounded-full border border-outline-variant"
                src={review.avatar}
              />
              <div>
                <h5 className="font-label-bold text-on-surface">{review.name}</h5>
                <p className="font-label-sm text-on-surface-variant">{review.meta}</p>
              </div>
            </div>
            <p className="font-body-md italic text-on-surface-variant">&ldquo;{review.quote}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
