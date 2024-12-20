import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { Footer } from "@/components/shared/Footer";
import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="">
      <div className="wrapper2">
        <BreadcrumbsDefault />
        <div className="max-w-3xl mx-auto px-5 md:px-10 mt-5 md:mt-10 w-full text-white">
          <h2 className="font-black text-3xl text-white mb-5">
            Privacy Policy
          </h2>
          <p className="mb-5">
            Welcome to MorningsideAI. Your privacy is paramount to us, and we
            are committed to protecting your personal data. This privacy policy
            explains how we handle your personal information in accordance with
            IND law when you visit our website and informs you of your privacy
            rights.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            Important Information and Who We Are
          </h2>
          <p className="mb-5">
            MorningsideAI operates in accordance with the INDs data protection
            regulations. We are the controller and are responsible for your
            personal data.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            The Data We Collect About You
          </h2>
          <p className="mb-5">
            The categories of personal data that we collect may include, but are
            not limited to, Identity Data, Contact Data, Financial Data,
            Transaction Data, and Technical Data.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            How Is Your Personal Data Collected?
          </h2>
          <p className="mb-5">
            Data is collected through direct interactions with our website and
            services, as well as through automated technologies that record your
            interactions with our website.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            How We Use Your Personal Data
          </h2>
          <p className="mb-5">
            We comply with IND data protection laws and use your personal data
            only where it is lawful to do so. This may include fulfilling
            contracts, pursuing legitimate interests, or complying with legal
            obligations.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">Data Security</h2>
          <p className="mb-5">
            In compliance with IND law, we have implemented strong security
            measures to protect your data from unauthorized access, alteration,
            or disclosure.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            Data Retention
          </h2>
          <p className="mb-5">
            We retain personal data for as long as necessary to fulfill the
            purposes outlined in this policy, in line with the legal
            requirements and regulations of the IND.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            Your Legal Rights
          </h2>
          <p className="mb-5">
            You have specific rights regarding your personal data under IND law,
            including the right to access, correct, or request the deletion of
            your personal data.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            International Transfers
          </h2>
          <p className="mb-5">
            We comply with IND regulations regarding the international transfer
            of personal data, ensuring that your data is protected in accordance
            with IND law when transferred across borders.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            Third-Party Links
          </h2>
          <p className="mb-5">
            Our website may link to external sites that are not operated by us.
            We have no control over and assume no responsibility for the content
            or privacy practices of any third-party sites.
          </p>

          <h2 className="font-black text-3xl text-white mb-5">
            Contact Details
          </h2>
          <p className="mb-5">
            If you have any questions about this privacy policy or our privacy
            practices, please contact us in the following ways:
          </p>
          <ul className="list-disc list-inside mb-5">
            <li>
              Email:{" "}
              <a href="mailto:info@mywebsite.com" className="text-blue-500">
                info@mywebsite.com
              </a>
            </li>
            <li>Address:Nashik,Maharastra 423101,india</li>
          </ul>

          <h2 className="font-black text-3xl text-white mb-5">
            Changes to the Privacy Policy
          </h2>
          <p className="mb-5">
            We reserve the right to update this policy at any time. Changes will
            be posted on this page with an updated revision date.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
