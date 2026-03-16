import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
          {/* Book Cover */}
          <div className="flex-shrink-0 w-72 md:w-96 drop-shadow-2xl">
            <Image
              src="/images/book-cover.png"
              alt="The Modern Brokerage book cover"
              width={600}
              height={800}
              className="rounded-sm shadow-2xl"
              priority
            />
          </div>

          {/* Hero Text */}
          <div className="text-center md:text-left flex-1">
            <p className="text-gold font-semibold tracking-widest uppercase text-sm mb-4">
              Now Available &mdash; First Edition
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              The Modern{" "}
              <span className="text-gold">Brokerage</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              A Strategic Guide to Real Estate Firm Management
            </p>
            <p className="text-lg text-gray-400 mb-8">
              by <span className="text-white font-medium">Dr. Philip Seagraves, PhD</span>
            </p>
            <p className="text-gray-300 text-sm mb-2">
              Former President, American Real Estate Society
            </p>
            <p className="text-gray-300 text-sm mb-8">
              Counselor of Real Estate (CRE)
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/purchase"
                className="inline-block bg-gold hover:bg-gold-light text-navy font-bold py-4 px-8 rounded transition-colors text-lg text-center"
              >
                Get Your Copy &mdash; $55.00
              </Link>
              <Link
                href="/purchase?code=true"
                className="inline-block border-2 border-gold text-gold hover:bg-gold hover:text-navy font-bold py-4 px-8 rounded transition-colors text-lg text-center"
              >
                I Have an Offer Code
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

      {/* About the Book */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-navy mb-8 text-center">
          About the Book
        </h2>
        <div className="grid md:grid-cols-2 gap-8 text-gray-700 leading-relaxed">
          <div>
            <p className="mb-4">
              The real estate brokerage industry is undergoing a transformation.
              From shifting commission structures and evolving regulatory
              landscapes to the integration of artificial intelligence and
              PropTech, today&apos;s brokerage leaders face unprecedented challenges
              and opportunities.
            </p>
            <p>
              <strong className="text-navy">The Modern Brokerage</strong> provides a
              comprehensive, evidence-based framework for managing and growing a
              real estate firm in this new era. Drawing on decades of academic
              research and industry experience, Dr. Seagraves delivers actionable
              strategies for firm leaders at every stage.
            </p>
          </div>
          <div>
            <p className="mb-4">
              Whether you are launching a new brokerage, scaling an existing
              operation, or navigating a market downturn, this book equips you
              with the tools and insights to lead with confidence.
            </p>
            <p>
              This first edition covers strategic planning, talent acquisition and
              retention, technology adoption, financial management, risk
              mitigation, and the future of the brokerage model.
            </p>
          </div>
        </div>
      </section>

      {/* Key Topics */}
      <section className="bg-navy-dark text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Key Topics Covered
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Strategic Planning",
                desc: "Build a resilient business plan that adapts to market cycles",
              },
              {
                title: "Agent Recruitment & Retention",
                desc: "Attract and keep top talent in a competitive landscape",
              },
              {
                title: "Technology & PropTech",
                desc: "Leverage AI, CRM, and emerging tech for competitive advantage",
              },
              {
                title: "Financial Management",
                desc: "Commission models, profitability analysis, and cash flow planning",
              },
              {
                title: "Regulatory Compliance",
                desc: "Navigate evolving legal and regulatory requirements",
              },
              {
                title: "Growth & Scaling",
                desc: "Expand your firm through M&A, franchising, or organic growth",
              },
            ].map((topic) => (
              <div
                key={topic.title}
                className="bg-navy-light border border-gold/20 rounded-lg p-6 hover:border-gold/50 transition-colors"
              >
                <h3 className="text-gold font-semibold text-lg mb-2">
                  {topic.title}
                </h3>
                <p className="text-gray-300 text-sm">{topic.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Author */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-navy mb-8 text-center">
          About the Author
        </h2>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 max-w-3xl mx-auto">
          <div className="flex-shrink-0">
            <Image
              src="/images/author-headshot.png"
              alt="Dr. Philip Seagraves, PhD"
              width={220}
              height={220}
              className="rounded-full shadow-lg border-4 border-gold/30"
            />
          </div>
          <div className="text-gray-700 leading-relaxed text-center md:text-left">
            <p className="mb-4">
              <strong className="text-navy">Dr. Philip Seagraves, PhD</strong> is a
              nationally recognized scholar and practitioner in real estate. He
              has served as President of the American Real Estate Society and
              holds the Counselor of Real Estate (CRE) designation.
            </p>
            <p className="mb-4">
              A real estate broker, investor, developer, adviser, and consultant,
              Dr. Seagraves brings a unique perspective that bridges academic
              research and hands-on industry experience in brokerage management.
            </p>
            <p className="text-sm text-gray-500">
              Former President, American Real Estate Society &bull; Counselor of Real Estate (CRE)
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gold py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Ready to Transform Your Brokerage?
          </h2>
          <p className="text-navy/80 mb-8 text-lg">
            Get instant access to the digital edition and start building a
            stronger firm today.
          </p>
          <Link
            href="/purchase"
            className="inline-block bg-navy hover:bg-navy-light text-white font-bold py-4 px-10 rounded transition-colors text-lg"
          >
            Get Your Copy &mdash; $55.00
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Dr. Philip Seagraves, PhD. All rights reserved.</p>
          <p className="mt-2">
            The Modern Brokerage: A Strategic Guide to Real Estate Firm Management
          </p>
        </div>
      </footer>
    </main>
  );
}
