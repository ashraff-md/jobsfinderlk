import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { CONTACT_HERO_IMG } from "@/lib/assets";
import { CONTACT_FAQS } from "@/lib/content/contact-faqs";

export function ContactPage() {
  return (
    <PublicPageLayout>
      <main>
        <section className="relative flex h-[400px] items-center overflow-hidden bg-primary">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="JobsFinder.lk support center"
              className="h-full w-full object-cover"
              src={CONTACT_HERO_IMG}
            />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="max-w-2xl">
              <span className="mb-4 inline-block bg-secondary px-3 py-1 font-label-bold text-label-sm tracking-wider text-on-secondary">
                SUPPORT CENTER
              </span>
              <h1 className="mb-4 font-headline-xl text-headline-xl leading-tight text-on-primary">
                Elite Support for Elite Talent.
              </h1>
              <p className="max-w-lg font-body-lg text-body-lg text-on-primary-container">
                Whether you&apos;re an executive seeking your next challenge or an enterprise scaling
                your team, we are here to provide clinical assistance.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-20 mx-auto -mt-24 max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
            <div className="border border-outline-variant bg-surface-container-lowest p-10 shadow-lg lg:col-span-7">
              <h2 className="mb-8 font-headline-md text-headline-md">Send an Official Inquiry</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block font-label-bold text-label-bold">Full Name</label>
                    <input
                      className="w-full border border-outline-variant bg-surface p-4 outline-none transition-all focus:border-primary focus:ring-0"
                      placeholder="Alex Silva"
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-bold text-label-bold">Business Email</label>
                    <input
                      className="w-full border border-outline-variant bg-surface p-4 outline-none transition-all focus:border-primary focus:ring-0"
                      placeholder="alex.silva@corporate.lk"
                      type="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-label-bold text-label-bold">Inquiry Type</label>
                  <select className="w-full appearance-none border border-outline-variant bg-surface p-4 outline-none transition-all focus:border-primary focus:ring-0">
                    <option>Enterprise Recruitment Support</option>
                    <option>Executive Candidate Consultation</option>
                    <option>Billing & Subscription</option>
                    <option>Technical Support</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block font-label-bold text-label-bold">Message</label>
                  <textarea
                    className="w-full resize-none border border-outline-variant bg-surface p-4 outline-none transition-all focus:border-primary focus:ring-0"
                    placeholder="How can our consultants assist you today?"
                    rows={5}
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 bg-primary py-4 font-label-bold text-label-bold text-on-primary transition-all hover:bg-on-surface-variant"
                >
                  Submit Request
                  <Icon name="send" className="text-[18px]" />
                </button>
              </form>
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="border border-outline-variant bg-surface-container-high p-8">
                <h3 className="mb-6 font-label-bold text-label-bold uppercase tracking-widest text-secondary">
                  Direct Channels
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary p-3 text-on-primary">
                      <Icon name="call" />
                    </div>
                    <div>
                      <p className="font-label-bold text-label-bold">Priority Hotline</p>
                      <p className="font-body-md text-body-md">+94 71 798 6810</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Mon-Fri: 9:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary p-3 text-on-primary">
                      <Icon name="mail" />
                    </div>
                    <div>
                      <p className="font-label-bold text-label-bold">Email</p>
                      <a
                        href="mailto:contact@jobsfinder.lk"
                        className="font-body-md text-body-md hover:text-secondary"
                      >
                        contact@jobsfinder.lk
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low px-margin-mobile py-20 md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-headline-lg text-headline-lg">Frequently Asked Questions</h2>
              <p className="mx-auto max-w-xl text-on-surface-variant">
                Quick answers to the most common queries from our professional community.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-2">
              {CONTACT_FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="border-l-4 border-secondary bg-surface-container-lowest p-8 shadow-sm"
                >
                  <h4 className="mb-3 font-label-bold text-label-bold">{faq.q}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicPageLayout>
  );
}
