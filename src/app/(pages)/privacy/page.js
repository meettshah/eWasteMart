export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 md:p-12">
        <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="mt-8 space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">1. Information We Collect</h2>
            <p className="mt-3 leading-relaxed">
              When you use E-WasteMart, we may collect the following types of information:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Account Data:</strong> Name, email address, role, and organization details (if applicable).</li>
              <li><strong>Usage Data:</strong> Listings created, bids placed, and platform interactions.</li>
              <li><strong>Logistics Data:</strong> Location or pickup addresses provided for transactions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">2. How We Use Your Data</h2>
            <p className="mt-3 leading-relaxed">
              Your data is primarily used to facilitate the core functions of the marketplace:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To connect sellers with appropriate recyclers.</li>
              <li>To send critical transactional notifications (e.g., bid approvals, pickup schedules).</li>
              <li>To maintain a safe, trusted bidding environment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-950 dark:text-white">3. Data Sharing</h2>
            <p className="mt-3 leading-relaxed">
              We do not sell your personal information to third parties. Information is only shared between a buyer and a seller once a bid has been explicitly approved, to allow for the coordination of physical logistics.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
