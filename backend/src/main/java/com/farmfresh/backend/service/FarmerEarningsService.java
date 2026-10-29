
package com.farmfresh.backend.service;

import com.farmfresh.backend.entity.Farmer;
import com.farmfresh.backend.model.Order;
import com.farmfresh.backend.model.OrderItem;
import com.farmfresh.backend.repository.FarmerRepository;
import com.farmfresh.backend.repository.OrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FarmerEarningsService {

    private final OrderRepository orderRepository;
    private final FarmerRepository farmerRepository;

    public FarmerEarningsService(
            OrderRepository orderRepository,
            FarmerRepository farmerRepository) {
        this.orderRepository = orderRepository;
        this.farmerRepository = farmerRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEarnings(String email) {

        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Farmer account not found"));

        Long farmerId = farmer.getId();

        List<Order> deliveredOrders =
                orderRepository.findByStatusIgnoreCase("Delivered");

        double totalEarnings = 0;
        int productsSold = 0;
        int completedSales = 0;

        YearMonth currentMonth = YearMonth.now();
        Map<YearMonth, Double> monthlyTotals = new LinkedHashMap<>();

        for (int i = 5; i >= 0; i--) {
            monthlyTotals.put(currentMonth.minusMonths(i), 0.0);
        }

        List<Map<String, Object>> salesHistory = new ArrayList<>();

        for (Order order : deliveredOrders) {
            double farmerOrderEarnings = 0;
            int farmerOrderQuantity = 0;

            if (order.getItems() == null) {
                continue;
            }

            for (OrderItem item : order.getItems()) {

                // Use the farmer recorded on this order item at checkout.
                if (item.getFarmerId() == null
                        || !farmerId.equals(item.getFarmerId())) {
                    continue;
                }

                farmerOrderEarnings += item.getSubtotal();
                farmerOrderQuantity += item.getQuantity();
            }

            if (farmerOrderEarnings <= 0) {
                continue;
            }

            totalEarnings += farmerOrderEarnings;
            productsSold += farmerOrderQuantity;
            completedSales++;

            if (order.getOrderDate() != null) {
                YearMonth orderMonth =
                        YearMonth.from(order.getOrderDate());

                if (monthlyTotals.containsKey(orderMonth)) {
                    monthlyTotals.merge(
                            orderMonth,
                            farmerOrderEarnings,
                            Double::sum);
                }
            }

            Map<String, Object> sale = new LinkedHashMap<>();
            sale.put("orderId", order.getId());
            sale.put("orderDate", order.getOrderDate());
            sale.put("earnings", farmerOrderEarnings);
            sale.put("productsSold", farmerOrderQuantity);
            salesHistory.add(sale);
        }

        List<Map<String, Object>> monthlyEarnings = new ArrayList<>();

        monthlyTotals.forEach((month, amount) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", month.toString());
            entry.put("earnings", amount);
            monthlyEarnings.add(entry);
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalEarnings", totalEarnings);
        result.put("completedSales", completedSales);
        result.put("productsSold", productsSold);
        result.put("thisMonthEarnings",
                monthlyTotals.getOrDefault(currentMonth, 0.0));
        result.put("monthlyEarnings", monthlyEarnings);
        result.put("salesHistory", salesHistory);

        return result;
    }
}
