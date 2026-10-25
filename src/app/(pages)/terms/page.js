export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 md:p-12">
        <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="mt-8 space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">1. Introduction</h2>
            <p className="mt-3 leading-relaxed">
              Welcome to E-WasteMart. By accessing and using our platform, you agree to comply with and be bound by the following terms and conditions. If you disagree with any part of these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">2. Platform Roles & Responsibilities</h2>
            <p className="mt-3 leading-relaxed">
              E-WasteMart acts as a marketplace to facilitate the responsible disposal and recycling of electronic waste.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Sellers:</strong> Must accurately describe the condition, quantity, and location of their e-waste. Misrepresentation of lots may result in account suspension.</li>
              <li><strong>Recyclers/Buyers:</strong> Must hold valid certifications required by their local jurisdiction to process e-waste responsibly.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">3. Transactions and Logistics</h2>
            <p className="mt-3 leading-relaxed">
              Bids placed on E-WasteMart represent a binding intent to fulfill the transaction. Once a seller approves a bid, both parties are expected to coordinate the pickup and transfer of goods. E-WasteMart is not liable for disputes arising during the physical handover of goods.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
