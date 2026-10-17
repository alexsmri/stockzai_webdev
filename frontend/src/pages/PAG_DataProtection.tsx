import COM_LandDocLayout from '../components/landing/COM_LandDocLayout';

// External link that displays its own URL, as the legal text does.
function Ext({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {href}
    </a>
  );
}

function PAG_DataProtection() {
  return (
    <COM_LandDocLayout prTitle="Data Protection">
      <h2>Data protection declaration</h2>
      <p>
        Unless stated otherwise below, the provision of your personal data is neither legally nor contractually
        obligatory, nor required for conclusion of a contract. You are not obliged to provide your data. Not providing
        it will have no consequences. This only applies as long as the processing procedures below do not state
        otherwise. “Personal data” is any information relating to an identified or identifiable natural person.
      </p>

      <h3>Server log files</h3>
      <p>
        You can use our websites without submitting personal data. Every time our website is accessed, user data is
        transferred to us or our web hosts/IT service providers by your internet browser and stored in server log files.
        This stored data includes for example the name of the site called up, date and time of the request, the IP
        address, amount of data transferred and the provider making the request. The processing is carried out on the
        basis of Article 6(1) f) GDPR due to our legitimate interests in ensuring the smooth operation of our website as
        well as improving our services.
      </p>

      <h3>Contact</h3>
      <h4>Responsible person</h4>
      <p>
        Contact us at any time. The person responsible for data processing is: Alexander Simon Jorias, Stuckertstraße 17,
        64673 Zwingenberg Deutschland, +4915906380308, alex@stockz.ai
      </p>
      <h4>Proactive contact of the customer by e-mail</h4>
      <p>
        If you make contact with us proactively via email, we shall collect your personal data (name, email address,
        message text) only to the extent provided by you. The purpose of the data processing is to handle and respond to
        your contact request. If the initial contact serves to implement pre-contractual measures (e.g. consultation in
        the case of purchase interest, order creation) or concerns an agreement already concluded between you and us,
        this data processing takes place on the basis of Article 6(1)(b) GDPR. If the initial contact occurs for other
        reasons, this data processing takes place on the basis of Article 6(1)(f) GDPR for the purposes of our
        overriding, legitimate interest in handling and responding to your request. In this case, on grounds relating to
        your particular situation, you have the right to object at any time to this processing of personal data
        concerning you and carried out on the basis of Article 6(1)(f) GDPR. We will only use your email address to
        process your request. Your data will subsequently be deleted in compliance with statutory retention periods,
        unless you have agreed to further processing and use.
      </p>
      <h4>Collection and processing when using the contact form</h4>
      <p>
        When you use the contact form we will only collect your personal data (name, email address, message text) in the
        scope provided by you. The data processing is for the purpose of making contact. If the initial contact serves to
        implement pre-contractual measures (e.g. consultation in the case of purchase interest, order creation) or
        concerns an agreement already concluded between you and us, this data processing takes place on the basis of
        Article 6(1)(b) GDPR. If the initial contact occurs for other reasons, this data processing takes place on the
        basis of Article 6(1)(f) GDPR for the purposes of our overriding, legitimate interest in handling and responding
        to your request. In this case, on grounds relating to your particular situation, you have the right to object at
        any time to this processing of personal data concerning you and carried out on the basis of Article 6(1)(f) GDPR.
        We will only use your email address to process your request. Finally your data will be deleted, unless you have
        agreed to further processing and use.
      </p>

      <h3>Customer account, Orders</h3>
      <h4>Customer account</h4>
      <p>
        When you open a customer account, we will collect your personal data in the scope given there. The data
        processing is for the purpose of improving your shopping experience and simplifying order processing. The
        processing will be carried out on the basis of art. 6 (1) lit. a GDPR with your consent. You can withdraw your
        consent at any time by contacting us without affecting the legality of the processing carried out with your
        consent up to the withdrawal. Your customer account will then be deleted.account
      </p>
      <h4>Collection, processing, and transfer of personal data in orders</h4>
      <p>
        When you submit an order we only collect and use your personal data insofar as this is necessary for the
        fulfilment and handling of your order as well as processing of your queries. The provision of data is necessary
        for conclusion of a contract. Failure to provide it will prevent the conclusion of any contract. The processing
        will occur on the basis of Article 6(1) b) GDPR and is required for the fulfilment of a contract with you. Your
        data will be shared, for example, with shipping companies, dropshipping or fulfillment providers, payment
        service providers, service providers for order processing, and IT service providers. We will comply strictly with
        legal requirements in every case. The scope of data transmission is restricted to a minimum.
      </p>

      <h3>Advertising</h3>
      <h4>Use of the e-mail address for sending newsletters</h4>
      <p>
        We use your e-mail address to send you information and offers by newsletter, provided you have expressly
        consented to this. The data processing serves the sole purpose of advertising. For this purpose, we process your
        e-mail address and any other data that you have voluntarily provided when registering for our newsletter. The
        processing is carried out on the basis of Art. 6 para. 1 lit. a GDPR with your consent. You can withdraw your
        consent at any time without affecting the lawfulness of processing based on consent before its withdrawal. You
        can unsubscribe from the newsletter at any time by using the corresponding link in the newsletter or by sending
        us a message. Your e-mail address will then be removed from the mailing list. Despite removal from the mailing
        list, we may continue to store your email address in a blacklist to prevent you from receiving future newsletter
        emails from us. This storage takes place on the basis of Art. 6 para. 1 lit. f GDPR out of our and your
        legitimate interest in preventing the reuse of your e-mail address for sending our newsletter. You have the right
        to object to this processing of your personal data at any time on grounds relating to your particular situation.
      </p>

      <h3>Payment service providers</h3>
      <h4>Use of PayPal</h4>
      <p>
        On our website we use the PayPal payment service of PayPal (Europe) S.à.r.l. et Cie, S.C.A. (22-24 Boulevard
        Royal L-2449, Luxembourg; "PayPal"). The data processing serves the purpose of offering you payment via the
        payment service. By selecting and using payment via PayPal, the data required for processing the payment will be
        transmitted to PayPal in order to enable us to fulfil the contract with you with the selected payment method.
        This processing is carried out on the basis of Art. 6 para. 1 lit. b GDPR. All PayPal transactions are subject
        to PayPal Privacy Policy. You can find these at <Ext href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" />
      </p>
      <h4>Use of PayPal Express</h4>
      <p>
        Our website uses the payment service PayPal Express from PayPal (Europe) S.à.r.l. et Cie, S.C.A. (22-24
        Boulevard Royal, L-2449 Luxembourg; "PayPal"). The processing of data enables us to offer you the option of
        paying via the PayPal Express payment service. To integrate this payment service it is essential that PayPal
        collects, stores, and analyses data when you access the website (e.g. IP address, device type, operating system,
        browser type, device location). Cookies may be used for this purpose. Cookies allow your internet browser to be
        recognised. The processing of your personal data is based on Art. 6 para. 1 lit. f GDPR out of our overriding
        legitimate interest in a customer-oriented offer of different payment methods. On grounds relating to your
        particular situation, you have the right to object at any time to this processing of personal data concerning
        you. By selecting and using "PayPal Express", the data required for payment processing will be submitted to
        PayPal to execute the agreement with you using the selected payment method. The data is processed on the basis of
        Article 6(1)(b) GDPR. Further information on data processing when using the Paypal Express payment service can
        be found{' '}
        <a
          href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full?locale.x=de_DE#Updated_PS"
          target="_blank"
          rel="noopener noreferrer"
        >
          here in the associated data privacy policy
        </a>
        .
      </p>

      <h3>Cookies</h3>
      <p>
        Our website uses cookies. Cookies are small text files which are saved in a user’s internet browser or by the
        user’s internet browser on their computer system. When a user calls up a website, a cookie may be saved on the
        user’s operating system. This cookie contains a characteristic character string which allows the browser to be
        clearly identified when the website is called up again.
      </p>
      <p>
        Cookies will be stored on your computer. You therefore have full control over the use of cookies. By choosing
        corresponding technical settings in your internet browser, you can be notified before the setting of cookies and
        you can decide whether to accept this setting in each individual case as well as prevent the storage of cookies
        and transmission of the data they contain. Cookies which have already been saved may be deleted at any time. We
        would, however, like to point out that this may prevent you from making full use of all the functions of this
        website. Using the links below, you can find out how to manage cookies (or deactivate them, among other things)
        in major browsers:
      </p>
      <p>
        Chrome Browser: <Ext href="https://support.google.com/accounts/answer/61416?hl=en" />
      </p>
      <p>
        Microsoft Edge:{' '}
        <Ext href="https://support.microsoft.com/de-de/microsoft-edge/cookies-in-microsoft-edge-l%C3%B6schen-63947406-40ac-c3b8-57b9-2a946a29ae09" />
      </p>
      <p>
        Mozilla Firefox:{' '}
        <Ext href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" />
      </p>
      <p>
        Safari:{' '}
        <Ext href="https://support.apple.com/de-de/guide/safari/manage-cookies-and-website-data-sfri11471/mac" />
      </p>

      <h4>Technically necessary cookies</h4>
      <p>
        Insofar as no other information is given in the data protection declaration below we use only these technically
        necessary cookies cookies to make our offering more user-friendly, effective and secure. Cookies also allow our
        systems to recognise your browser after a page change and to offer you services. Some functions of our website
        cannot be offered without the use of cookies. These services require the browser to be recognised again after a
        page change.
      </p>
      <p>
        The use of cookies or comparable technologies is carried out on the basis of Art. 25 para. 2 TDDDG. Processing is
        carried out on the basis of art. 6 (1) lit. f GDPR due to our largely justified interest in ensuring the optimal
        functionality of the website as well as a user-friendly and effective design of our range of services. You have
        the right to veto this processing of your personal data according to art. 6 (1) lit. f GDPR, for reasons
        relating to your personal situation.
      </p>

      <h4>Use of the cookie banner from Framer</h4>
      <p>
        We use the cookie banner of Framer B.V. (Rozengracht 207B, 1016 LZ, Amsterdam). These functions enable you to
        give your consent to data processing via the website, in particular to set cookies, as well as to make use of
        your right of revocation for consents already given. The data processing serves the purpose of obtaining and
        documenting necessary consents to data processing and thus to comply with legal obligations. Cookies are used for
        this purpose, with which among other things your consent status is stored. The data processing is carried out on
        the basis of Article 6 para. 1 lit. c GDPR to comply with a legal obligation. For more information about Framer's
        privacy policy and cookies, please visit{' '}
        <Ext href="https://www.framer.com/legal/data-processing-addendum/" />,{' '}
        <Ext href="https://www.framer.com/legal/privacy-statement/" /> and{' '}
        <Ext href="https://www.framer.com/legal/cookie-policy/" />
      </p>

      <h3>Analysis</h3>
      <h4>Use of Google Analytics 4</h4>
      <p>
        We use the Google Analytics web analytics service provided by Google Ireland Limited (Gordon House, Barrow
        Street, Dublin 4, Ireland; "Google") on our website.
      </p>
      <p>
        The data processing serves the purpose of analyzing this website and its visitors as well as for marketing and
        advertising purposes. To this end, Google will use the information obtained on behalf of the operator of this
        website for the purpose of evaluating your use of the website, compiling reports on website activity and
        providing other services relating to website activity and internet usage to the website operator. In this
        context, the following information may be collected, among others: IP address, date and time of page view, click
        path, information about the browser you are using and the device you are using (device), pages visited, referrer
        URL (website from which you accessed our website), location data, purchase activity. Your data may be linked by
        Google to other data, such as your search history, your personal accounts, your usage data from other devices,
        and any other data Google may have about you.
      </p>
      <p>
        Your IP address will first be truncated by us on our own servers. Google thus only receives pseudonymised data.
      </p>
      <p>
        Google uses technologies such as cookies, web storage in the browser and tracking pixels that enable an analysis
        of your use of the website. The use of cookies or similar technologies takes place with your consent on the basis
        of § 25 para. 1 p. 1 TDDDG in conjunction with. Art. 6 para. 1 lit. a DSGVO.
      </p>
      <p>
        The processing of your personal data is carried out with your consent on the basis of Art. 6 para. 1 lit. a
        DSGVO. You may revoke your consent at any time without affecting the lawfulness of the processing carried out on
        the basis of the consent until revocation.
      </p>
      <p>
        We also use the Google Signals service in this context. Google Signals enables cross-device tracking. Hence, your
        data can be analysed across devices if you have enabeled "personalised advertising" in your account settings and
        your end devices are linked to your Google account. This makes it possible to identify which device is searching
        for products and then return to complete purchases on another device, such as a tablet.The cross-device reports
        created in this context contain only aggregated data. We therefore only receive statistics generated on the basis
        of Google Signals. To prevent Google Signals from collecting and storing data across devices, you can deactivate
        the "personalised advertising" function in your Google Account settings. For more information, please visit{' '}
        <Ext href="https://support.google.com/ads/answer/2662922?hl=de" />. For more information on data processing and
        data protection for Google Signals, please visit{' '}
        <Ext href="https://support.google.com/analytics/answer/7532985?hl=en" />.
      </p>
      <p>
        We use the extended implementation of the consent mode (Advanced Consent Mode). In this case, user data is
        transmitted to Google in the form of "pings" even if consent has not been granted. These pings may contain the
        following information, among others: IP address to derive the IP country (the IP address is not logged), date and
        time of the page view, URL of the pages visited, user agent, referrer URL (website from which you accessed our
        website) or information about the triggering of website events such as a conversion. On the basis of this
        information, Google models user data in order to be able to carry out a comprehensive usage analysis despite the
        refusal of consent.
      </p>
      <p>
        The information generated by this about your use of this website is usually transferred to a Google server in the
        USA and stored there. For the USA, there is an adequacy decision of the EU Commission, the Trans-Atlantic Data
        Privacy Framework (TADPF). Google has certified itself in accordance with the TADPF and has thus undertaken to
        comply with European data protection principles. Both Google and US government agencies have access to your data.
      </p>
      <p>
        For more information on terms of use and data protection, please visit{' '}
        <Ext href="https://policies.google.com/technologies/partnersites" /> and{' '}
        <Ext href="https://policies.google.com/privacy?hl=de&gl=de" />.
      </p>

      <h4>Use of Hotjar</h4>
      <p>
        On our website we use the analysis tool provided by Hotjar Ldt. (Level 2, St Julian's Business Centre, 3, Elia
        Zammit Street, St Julians STJ1000, Malta; "Hotjar").
      </p>
      <p>
        The data processing serves the purpose of designing, optimising and analysing our website according to your
        needs. The tool is used to randomly record the movements of visitors to the website. This creates a protocol of
        mouse movements, scrolling behaviour, dwell time and clicks on the website (what is known as the heat map).
      </p>
      <p>
        For this purpose Hotjar uses, among other things, cookies. These can involve the collection of, among other
        things, the following information: IP address (in anonymous form), information about the device you are using
        (screen size, devices, unique device identifier), information about the browser you are using, location data
        (country only), preferred language for displaying the website, operating system used. Detailed information on the
        cookies used and the function and the storage period of these can be found here:{' '}
        <Ext href="https://help.hotjar.com/hc/en-us/articles/115011789248-Hotjar-Cookies" />
      </p>
      <p>
        This data is used to create user profiles under a pseudonym. The data is not used to personally identify the
        visitor of the website and is not merged with personal data of the bearer of the pseudonym. Hotjar is
        contractually prohibited from selling the collected data to other third parties.
      </p>
      <p>
        Your data may be transferred to the USA. For the USA, there is an adequacy decision of the EU Commission, the
        Trans-Atlantic Data Privacy Framework (TADPF). Hotjar is not certified under the TAPF. The data transfer takes
        place on the basis of appropriate protective measures, among other things. Hotjar will provide you with further
        information on the measures taken upon request. The use of cookies or comparable technologies is carried out with
        your consent on the basis of Art. 25 para. 1 p. 1 TDDDG in conjunction with Art. 6 para. 1 lit. a GDPR. The
        processing of your personal data is carried out with your consent on the basis of Art. 6 para. 1 lit. a GDPR. You
        can withdraw your consent at any time without affecting the legality of the processing carried out with your
        consent up to the withdrawal. For more information about data protection when using Hotjar, please visit:{' '}
        <Ext href="https://www.hotjar.com/legal/policies/privacy/#enduserenglish" />
      </p>

      <h4>Use of Meta Pixel</h4>
      <p>
        We use Meta Pixel from Meta Platforms Ireland Limited (4 Grand Canal Square, Grand Canal Harbour, Dublin 2,
        Ireland; "Meta") on our website.
      </p>
      <p>
        Meta and we are jointly responsible for the collection of your data and the transfer of this data to Meta when
        the service is integrated. The basis for this is an agreement between us and Meta on the joint processing of
        personal data, in which the respective responsibilities are defined. The agreement is available at{' '}
        <Ext href="https://de-de.facebook.com/legal/terms/businesstools" />. According to this agreement, we are
        responsible in particular for the fulfilment of the information obligations in accordance with Arts 13 and 14
        GDPR, for compliance with the security requirements of Art. 32 GDPR with regard to the correct technical
        implementation and configuration of the service, and for compliance with the obligations in accordance with Arts
        33 and 34 GDPR, insofar as a violation of the protection of personal data affects our obligations under the
        agreement on joint processing. Meta is responsible for enabling the rights of the data subject in accordance with
        Arts 15-20 GDPR, for complying with the security requirements of Art. 32 GDPR with regard to the security of the
        service, and for complying with the obligations of Arts 33 and 34 GDPR, insofar as a breach of personal data
        protection concerns Meta's obligations under the joint processing agreement. The application serves to address
        the visitor to the website with interest-related advertising on the social networks Facebook and Instagram. We
        have implemented Meta’s remarketing tag on our website for this purpose. This tag sets up a direct connection to
        Meta’s servers when you visit our website. This informs the Meta server which of our web pages you have visited.
        Meta assigns this information to your personal Facebook and/or Instagram user account. When you visit the social
        networks Facebook or Instagram, you will then be shown personalised, interest-related ads.
      </p>
      <p>
        The application also serves the purpose of creating conversion statistics. This allows us to find out the total
        number of users who have clicked our adverts and were forwarded to a page equipped with a conversion tracking tag
        as well as what actions are taken after being redirected to this website. However, they do not receive any
        information which could be used to personally identify users. Your data may be transmitted to the USA. For the
        USA, there is an adequacy decision of the EU Commission, the Trans-Atlantic Data Privacy Framework (TADPF). Meta
        has certified itself in accordance with the TADPF and has thus undertaken to comply with European data protection
        principles.
      </p>
      <p>
        The processing of your personal data is carried out with your consent on the basis of Art. 6 para. 1 lit. a GDPR.
        You can withdraw your consent at any time without affecting the legality of the processing carried out with your
        consent up to the withdrawal. For this purpose, you can deactivate the remarketing function “Custom Audiences”.
        You can find more detailed information on Meta’s collection and use of data and your associated rights and
        options for protecting your privacy in Meta’s privacy policy: <Ext href="https://www.facebook.com/about/privacy/" />.
      </p>

      <h3>Plug-ins</h3>
      <h4>Use of the Google Tag Manager</h4>
      <p>
        Our website uses the Google Tag Manager from Google Ireland Limited (Gordon House, Barrow Street, Dublin 4,
        Ireland; "Google"). This application manages JavaScript tags and HTML tags which are used in particular to
        implement tracking and analysis tools. The data processing serves to facilitate the needs-based design and
        optimisation of our website. The Google Tag Manager itself neither stores cookies nor processes personal data. It
        does, however, enable the triggering of further tags which may collect and process personal data. You can find
        more detailed information on the terms and conditions of use and data protection at{' '}
        <Ext href="https://www.google.com/intl/de/tagmanager/usepolicy.html" />
      </p>

      <h4>Use of Cloudflare</h4>
      <p>
        On our website, we use the Content Delivery Network, Cloudflare CDN of Cloudflare Inc. (101 Townsend St, San
        Francisco, CA 94107, USA; “Cloudflare”). This is a supraregional network of servers in different data centres
        with which our web server connects and via which certain contents of our website are delivered.
      </p>
      <p>
        The purpose of the data processing is to optimise the loading times of our website in order to make our offer
        more user-friendly. This can involve the collection of, among other things, the following information: IP
        address, system configuration information, information about the traffic from and to customer websites (server
        log files).
      </p>
      <p>
        Your data may be transferred to the USA. For the USA, there is an adequacy decision of the EU Commission, the
        Trans-Atlantic Data Privacy Framework (TADPF). Cloudflare has certified itself in accordance with the TADPF and
        has thus undertaken to comply with European data protection principles.
      </p>
      <p>
        Processing is carried out on the basis of Article 6(1)(f) GDPR for the purposes of our legitimate interest in
        needs-based and targeted design of the website. On grounds relating to your particular situation, you have the
        right to object at any time to this processing of your personal data and carried out on the basis of Article
        6(1)(f) GDPR.
      </p>
      <p>
        For more information about privacy when using Cloudflare, please visit{' '}
        <Ext href="https://www.cloudflare.com/de-de/privacypolicy/" />.
      </p>

      <h4>Use of Google Fonts</h4>
      <p>
        We use Google Fonts from Google Ireland Limited (Gordon House, Barrow Street, Dublin 4, Ireland; "Google") on our
        website. The data processing serves to facilitate the consistent display of fonts on our website. In order to
        load the fonts, a connection to Google servers is established when the page is accessed. Among other things, your
        IP address and information about the browser you are using will be processed and transmitted to Google. This data
        is not linked to your Google account. Your data may be transmitted to the USA. For the USA, there is an adequacy
        decision of the EU Commission, the Trans-Atlantic Data Privacy Framework (TADPF). Google has certified itself in
        accordance with the TADPF and has thus undertaken to comply with European data protection principles.
      </p>
      <p>
        The use of cookies or comparable technologies is carried out with your consent on the basis of Art. 25 para. 1 p.
        1 TDDDG in conjunction with Art. 6 para. 1 lit. a GDPR. The processing of your personal data is carried out with
        your consent on the basis of Art. 6 para. 1 lit. a GDPR. You can withdraw your consent at any time without
        affecting the legality of the processing carried out with your consent up to the withdrawal. You can find more
        detailed information on the data processing and data protection at{' '}
        <Ext href="https://www.google.de/intl/de/policies/" /> and at{' '}
        <Ext href="https://developers.google.com/fonts/faq" />.
      </p>

      <h3>Rights of persons affected and storage duration</h3>
      <h4>Duration of storage</h4>
      <p>
        After contractual processing has been completed, the data is initially stored for the duration of the warranty
        period, then in accordance with the retention periods prescribed by law, especially tax and commercial law, and
        then deleted after the period has elapsed, unless you have agreed to further processing and use.
      </p>
      <h4>Rights of the affected person</h4>
      <p>
        If the legal requirements are fulfilled, you have the following rights according to art. 15 to 20 GDPR: Right to
        information, correction, deletion, restriction of processing, data portability. You also have a right of
        objection against processing based on art. 6 (1) GDPR, and to processing for the purposes of direct marketing,
        according to art. 21 (1) GDPR.
      </p>
      <h4>Right to complain to the regulatory authority</h4>
      <p>
        You have the right to complain to the regulatory authority according to art. 77 GDPR if you believe that your
        data is not being processed legally.
      </p>
      <p>
        You can lodge a complaint with, among others, the supervisory authority responsible for us, which you may reach
        at the following contact details:
      </p>
      <p>
        Hessischer Beauftragter für Datenschutz und Informationsfreiheit
        <br />
        Postfach 3163
        <br />
        65021 Wiesbaden
        <br />
        Tel.: +49 611 14080
        <br />
        Fax: +49 611 1408900 oder +49 611 1408901
        <br />
        E-Mail: poststelle@datenschutz.hessen.de
      </p>
      <h4>Right to object</h4>
      <p>
        If the data processing outlined here is based on our legitimate interests in accordance with Article 6(1)f) GDPR,
        you have the right for reasons arising from your particular situation to object at any time to the processing of
        your data with future effect. If the objection is successful, we will no longer process the personal data, unless
        we can demonstrate compelling legitimate grounds for the processing that outweigh your interests or rights and
        freedoms, or the processing is intended for the assertion, exercise or defence of legal claims.
      </p>
      <p>last update: 22.10.2024</p>
    </COM_LandDocLayout>
  );
}

export default PAG_DataProtection;
