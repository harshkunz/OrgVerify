
const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Introduction */}
      <section>
        <h1 className="text-4xl font-bold text-center mb-4">About OrgVerify Platform</h1>
        <p className="text-lg text-gray-700 text-center">
          A comprehensive platform for managing organizations, employees, and verification processes. The system enables companies to register, manage employees, and verify credentials in a secure and efficient manner.
        </p>
      </section>

      {/* Mission */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
        <p className="text-gray-700">
          To provide a secure, efficient, and user-friendly platform for organization verification and employee management, fostering trust and transparency in organizational operations.
        </p>
      </section>

      {/* Vision */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
        <p className="text-gray-700">
          To become the leading platform for organization verification and management, known for reliability, security, and innovation in digital organizational services.
        </p>
      </section>

      {/* Project Overview */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">About This Project</h2>
        <p className="text-gray-700">
          This web application — the <strong>Organization Verification System</strong> — is a comprehensive platform designed for managing organizations, employees, and verification processes. The goal is to digitize and simplify organizational management and credential verification in a secure and efficient manner.
        </p>
        <p className="text-gray-700 mt-2">
          Built using the <strong>MERN stack (MongoDB, Express.js, React, Node.js)</strong>, the platform includes:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
          <li>Company registration and management system</li>
          <li>Employee management with roles and permissions</li>
          <li>Secure verification system using Organization ID</li>
          <li>Real-time notifications and communication features</li>
          <li>Analytics and reporting dashboard</li>
        </ul>
        <p className="text-gray-700 mt-2">
          This system reflects our commitment to embracing digital transformation and improving transparency in organizational operations.
        </p>
      </section>

      {/* Call to Action */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Join Us</h2>
        <p className="text-gray-700">
          Whether you're a company, employee, or administrator, this system empowers you with trustworthy and accessible organizational management tools. Register your company, manage employees, and verify credentials with confidence.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
