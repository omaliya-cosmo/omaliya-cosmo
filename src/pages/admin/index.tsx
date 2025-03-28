import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  if (!session) return <div>Please login</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        {orders.map((order: any) => (
          <div key={order._id}>
            <p>Order #{order.order_id}</p>
            <p>Status: {order.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}