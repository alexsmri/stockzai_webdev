import COM_LandDocLayout from '../components/landing/COM_LandDocLayout';

// "Criteria for expiry" appears twice in the supplied text; both copies are kept as provided.
function CriteriaForExpiry() {
  return (
    <>
      <p>
        The right of withdrawal shall expire in the case of a contract for the supply of digital content, not on a
        tangible medium that obliges the consumer to pay a price if the consumer:
      </p>
      <ol>
        <li>
          has expressly consented to the entrepreneur commencing performance of the contract before the end of the
          withdrawal period; and
        </li>
        <li>
          has confirmed that he is aware that his right of withdrawal expires upon the commencement of the performance
          of the contract, and
        </li>
        <li>
          the entrepreneur has provided the consumer with a confirmation of the contract on a durable medium within a
          reasonable period of time after the conclusion of the contract, but no later than when the digital content not
          on a tangible medium is made available:
          <ol>
            <li>which reproduces the content of the contract; and</li>
            <li>
              stating that the consumer, prior to the performance of the contract, has expressly consented to the
              entrepreneur commencing performance of the contract before the expiry of the withdrawal period and has
              confirmed his knowledge that, by consenting, he loses his right of withdrawal upon commencement of
              performance of the contract.
            </li>
          </ol>
        </li>
      </ol>
    </>
  );
}

function PAG_RefundPolicy() {
  return (
    <COM_LandDocLayout prTitle="Refund Policy">
      <h2>Revocation right for consumers</h2>
      <p>
        (A ‘consumer’ is any natural person who concludes a legal transaction which, to an overwhelming extent, cannot
        be attributed to either his commercial or independent professional activities.)
      </p>

      <h3>Instructions for revocation</h3>
      <h4>Revocation right</h4>
      <p>
        You have the right to revoke this contract within fourteen days without specifying any reasons. The revocation
        period is fourteen days with effect from the day of the conclusion of the contract.
      </p>
      <p>
        To exercise your right of withdrawal, you must inform us (Alexander Simon Jorias, Stuckertstraße 17, 64673
        Zwingenberg, telephone number: +4915906380308, e-mail address: <a href="mailto:alex@stockz.ai">alex@stockz.ai</a>
        ) by means of a clear declaration (e.g. a letter sent by post, or an e-mail) of your decision to withdraw from
        this contract. You can use the attached model withdrawal form for this purpose, which is, however, not
        mandatory.
      </p>
      <p>
        In order to safeguard the revocation period, it is sufficient that you send the notification about the exercise
        of the revocation right before the expiry of the revocation period.
      </p>

      <h4>Consequences of the revocation</h4>
      <p>
        If you revoke this contract, we shall repay all the payments, which we received from you, including the delivery
        costs (with the exception of additional costs, which arise from that fact that you selected a form of delivery
        other than the most reasonable standard delivery offered by us), immediately and at the latest within fourteen
        days from the day on which we received the notification about the revocation of this contract from you. We use
        the same means of payment, which you had originally used during the original transaction, for this repayment
        unless expressly agreed otherwise with you; you will not be charged any fees owing to this repayment.
      </p>

      <h4>Criteria for expiry</h4>
      <CriteriaForExpiry />
      <CriteriaForExpiry />

      <h3>Specimen - revocation form</h3>
      <p>(If you wish to revoke the contract, please fill up this form and send it back to us.)</p>
      <p>
        To Alexander Simon Jorias, Stuckertstraße 17, 64673 Zwingenberg, e-mail address:{' '}
        <a href="mailto:alex@stockz.ai">alex@stockz.ai</a>
      </p>
      <p>
        I/we () herewith revoke the contract concluded by me/ us () regarding the purchase of the following products ()/
        <br />
        the provision of the following service ()
      </p>
      <p>Ordered on ()/ received on ()</p>
      <p>Name of the consumer(s)</p>
      <p>Address of the consumer(s)</p>
      <p>Signature of the consumer(s) (only in case of a notification on paper)</p>
      <p>
        Date
        <br />
        (*) Cross out the incorrect option.
      </p>
    </COM_LandDocLayout>
  );
}

export default PAG_RefundPolicy;
