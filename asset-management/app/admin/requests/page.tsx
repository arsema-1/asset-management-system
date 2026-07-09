const requests = [
  ['REQ-301', 'Laptop replacement', 'Hana Bekele', 'Pending'],
  ['REQ-302', 'New headset', 'Noah Tesfaye', 'Approved'],
  ['REQ-303', 'Printer repair', 'Sara Alemu', 'Review'],
];

export default function RequestsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Requests</h1>
          <p>Approve, reject, and follow up on employee asset requests.</p>
        </div>
      </header>

      <section className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Request</th>
              <th>Details</th>
              <th>Employee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(([id, detail, employee, status]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{detail}</td>
                <td>{employee}</td>
                <td>
                  <span className={status === 'Approved' ? 'status green' : 'status'}>
                    {status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
