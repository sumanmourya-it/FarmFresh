
package com.farmfresh.backend.controller;

import com.farmfresh.backend.entity.Farmer;
import com.farmfresh.backend.model.Order;
import com.farmfresh.backend.model.OrderItem;
import com.farmfresh.backend.model.Product;
import com.farmfresh.backend.repository.OrderRepository;
import com.farmfresh.backend.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://remarkable-illumination-production-cbcf.up.railway.app"
})
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    public OrderController(
            OrderRepository orderRepository,
            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    // Create an order using trusted database product details
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody Order order,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Please log in before ordering");
        }

        order.setEmail(authentication.getName());

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "An order must contain items");
        }

        double total = 0;

        for (OrderItem item : order.getItems()) {
            if (item.getProductId() == null
                    || item.getQuantity() <= 0) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid order item");
            }

            Product product = productRepository
                .findById(item.getProductId().intValue())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Product not found: " + item.getProductId()));

            Farmer farmer = product.getFarmer();

            if (farmer == null) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The product '" + product.getName()
                    + "' has no assigned farmer. Please contact the administrator.");
            }

            if (product.getQuantity() < item.getQuantity()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock for " + product.getName());
            }

            // Never trust price, name, subtotal or farmer ID from the browser
            item.setName(product.getName());
            item.setPrice(product.getPrice().doubleValue());
            item.setSubtotal(
                product.getPrice().doubleValue() * item.getQuantity());
            item.setFarmerId(farmer.getId());
            item.setOrder(order);

            total += item.getSubtotal();

            // Reserve stock for this order
            product.setQuantity(
                product.getQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        order.setTotal(total);
        order.setStatus("Pending");
        order.setOrderDate(LocalDateTime.now());
        order.setProcessingDate(null);
        order.setShippedDate(null);
        order.setDeliveredDate(null);

        Order savedOrder = orderRepository.save(order);

        return ResponseEntity.ok(savedOrder);
    }

    // Get all orders for the existing portal
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    // Customer order history
    @GetMapping("/customer")
    public ResponseEntity<List<Order>> getCustomerOrders(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Please log in");
        }

        List<Order> customerOrders =
            orderRepository.findByEmailIgnoreCaseOrderByOrderDateDesc(
                authentication.getName());

        return ResponseEntity.ok(customerOrders);
    }

    // Update order status and record tracking timestamps
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        return orderRepository.findById(id)
            .map(order -> {
                String currentStatus = order.getStatus();
                String newStatus = request.get("status");

                if (currentStatus == null || currentStatus.isBlank()) {
                    currentStatus = "Pending";
                }

                boolean validTransition =
                    ("Pending".equals(currentStatus)
                        && "Processing".equals(newStatus))
                    || ("Processing".equals(currentStatus)
                        && "Shipped".equals(newStatus))
                    || ("Shipped".equals(currentStatus)
                        && "Delivered".equals(newStatus))
                    || ("Pending".equals(currentStatus)
                        && "Cancelled".equals(newStatus))
                    || ("Processing".equals(currentStatus)
                        && "Cancelled".equals(newStatus));

                if (!validTransition) {
                    return ResponseEntity.badRequest()
                        .body("Invalid status transition: "
                            + currentStatus + " to " + newStatus);
                }

                LocalDateTime now = LocalDateTime.now();

                switch (newStatus) {
                    case "Processing":
                        order.setProcessingDate(now);
                        break;
                    case "Shipped":
                        order.setShippedDate(now);
                        break;
                    case "Delivered":
                        order.setDeliveredDate(now);
                        break;
                    default:
                        break;
                }

                order.setStatus(newStatus);
                Order updatedOrder = orderRepository.save(order);

                return ResponseEntity.ok(updatedOrder);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
