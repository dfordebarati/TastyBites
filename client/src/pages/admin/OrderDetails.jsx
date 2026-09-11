import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import PageHeader from '../../components/admin/PageHeader';
import StatusSelect from '../../components/admin/StatusSelect';
import AddressBlock from '../../components/orders/AddressBlock';
import OrderItemsList from '../../components/orders/OrderItemsList';
import OrderTotals from '../../components/orders/OrderTotals';
import StatusTracker from '../../components/orders/StatusTracker';
import { formatDateTime } from '../../lib/format';
import { PAYMENT_LABELS } from '../../lib/orders';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    api
      .get(`/orders/${id}`)
      .then(({ data }) => {
        if (!ignore) setOrder(data.order);
      })
      .catch(() => {
        if (!ignore) setError('Order not found.');
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (error) return <p className="py-20 text-center text-ink-soft">{error}</p>;
  if (!order) return <Loader />;

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)}. ${PAYMENT_LABELS[order.paymentMethod]}.`}
        back={{ to: '/admin/orders', label: 'Orders' }}
        action={<StatusSelect order={order} onUpdated={setOrder} />}
      />

      <StatusTracker status={order.status} />

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="font-display text-2xl text-ink">Items</h2>
          <OrderItemsList items={order.items} className="mt-4" />
          <OrderTotals totals={order} className="mt-5" />
        </section>

        <section className="lg:col-span-2">
          <h2 className="font-display text-2xl text-ink">Deliver to</h2>
          <AddressBlock order={order} className="mt-4" />
        </section>
      </div>
    </>
  );
}
