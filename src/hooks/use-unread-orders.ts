// src/hooks/use-unread-orders.ts
import { useState, useEffect } from 'react';
import { useVendorStore } from '@/stores';
import { OrderStatus } from '@/types/OrderSchema';
import supabase from '@/lib/supabaseClient';
import { toast } from '@/lib/toast';

export function useUnreadOrders() {
  const { orders, fetchOrders, ordersLoaded, vendor } = useVendorStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread count based on order status
  const calculateUnreadCount = (ordersList: typeof orders) => {
    return ordersList.filter(order => 
      order.status === 'pending'
    ).length;
  };

  // Update unread count when orders change
  useEffect(() => {
    if (ordersLoaded) {
      const count = calculateUnreadCount(orders);
      setUnreadCount(count);
    }
  }, [orders, ordersLoaded]);

  // Fetch orders if not loaded
  useEffect(() => {
    if (!ordersLoaded) {
      fetchOrders(true).catch(error => {
        console.error('Error fetching orders for unread count:', error);
      });
    }
  }, [ordersLoaded, fetchOrders]);

  // Set up real-time subscription for new orders
  useEffect(() => {
    if (!vendor?.user_id) return;

    const channel = supabase
      .channel('vendor_orders_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${vendor.user_id}`,
        },
        (payload) => {
          console.log('New order received via real-time:', payload.new);
          
          // Show toast notification
          toast({
            title: "New Order Received!",
            description: `You have a new order that needs your attention.`,
            variant: "default",
          });
          
          // Refresh orders to update unread count
          fetchOrders(false).catch(error => {
            console.error('Error refreshing orders after real-time update:', error);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendor?.user_id, fetchOrders]);

  return {
    unreadCount,
    hasUnreadOrders: unreadCount > 0,
    refreshUnreadCount: () => {
      fetchOrders(false).catch(error => {
        console.error('Error refreshing orders for unread count:', error);
      });
    }
  };
}
