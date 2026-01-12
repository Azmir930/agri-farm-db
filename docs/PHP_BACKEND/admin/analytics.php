<?php
/**
 * Admin Analytics Dashboard
 * Agriculture Product Marketplace
 */

require_once '../config/database.php';
require_once '../config/helpers.php';
require_once '../auth/middleware.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $user = requireApiRole('admin');
    $database = new Database();
    $conn = $database->getConnection();

    $period = sanitize($_GET['period'] ?? '30'); // days

    // Overview stats
    $stmt = $conn->prepare("
        SELECT 
            (SELECT COUNT(*) FROM User) as total_users,
            (SELECT COUNT(*) FROM User WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) as new_users,
            (SELECT COUNT(*) FROM Farmer) as total_farmers,
            (SELECT COUNT(*) FROM Buyer) as total_buyers,
            (SELECT COUNT(*) FROM Product WHERE is_active = TRUE) as active_products,
            (SELECT COUNT(*) FROM Orders) as total_orders,
            (SELECT COUNT(*) FROM Orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) as recent_orders,
            (SELECT COALESCE(SUM(total_amount), 0) FROM Orders WHERE status != 'cancelled') as total_revenue,
            (SELECT COALESCE(SUM(total_amount), 0) FROM Orders WHERE status != 'cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) as recent_revenue
    ");
    $stmt->execute([$period, $period, $period]);
    $overview = $stmt->fetch(PDO::FETCH_ASSOC);

    // Orders by status
    $stmt = $conn->prepare("
        SELECT status, COUNT(*) as count
        FROM Orders
        GROUP BY status
    ");
    $stmt->execute();
    $orders_by_status = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Revenue trend (daily for last N days)
    $stmt = $conn->prepare("
        SELECT DATE(created_at) as date, 
               COUNT(*) as order_count,
               SUM(total_amount) as revenue
        FROM Orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND status != 'cancelled'
        GROUP BY DATE(created_at)
        ORDER BY date
    ");
    $stmt->execute([$period]);
    $revenue_trend = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Top selling products
    $stmt = $conn->prepare("
        SELECT p.id, p.name, f.farm_name,
               SUM(oi.quantity) as total_sold,
               SUM(oi.subtotal) as total_revenue
        FROM Order_Items oi
        JOIN Product p ON oi.product_id = p.id
        JOIN Farmer f ON p.farmer_id = f.id
        JOIN Orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
        GROUP BY p.id, p.name, f.farm_name
        ORDER BY total_sold DESC
        LIMIT 10
    ");
    $stmt->execute();
    $top_products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Top farmers by revenue
    $stmt = $conn->prepare("
        SELECT f.id, f.farm_name, u.first_name, u.last_name,
               COUNT(DISTINCT o.id) as order_count,
               SUM(oi.subtotal) as total_revenue
        FROM Farmer f
        JOIN User u ON f.user_id = u.id
        JOIN Product p ON f.id = p.farmer_id
        JOIN Order_Items oi ON p.id = oi.product_id
        JOIN Orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
        GROUP BY f.id, f.farm_name, u.first_name, u.last_name
        ORDER BY total_revenue DESC
        LIMIT 10
    ");
    $stmt->execute();
    $top_farmers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Category distribution
    $stmt = $conn->prepare("
        SELECT c.name as category,
               COUNT(DISTINCT p.id) as product_count,
               COALESCE(SUM(oi.subtotal), 0) as revenue
        FROM Category c
        LEFT JOIN Product p ON c.id = p.category_id
        LEFT JOIN Order_Items oi ON p.id = oi.product_id
        LEFT JOIN Orders o ON oi.order_id = o.id AND o.status != 'cancelled'
        WHERE c.is_active = TRUE
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
    ");
    $stmt->execute();
    $category_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Recent activity
    $stmt = $conn->prepare("
        SELECT al.*, u.first_name, u.last_name
        FROM User_Activity_Log al
        JOIN User u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 20
    ");
    $stmt->execute();
    $recent_activity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Payment stats
    $stmt = $conn->prepare("
        SELECT payment_method,
               COUNT(*) as count,
               SUM(amount) as total
        FROM Payment
        WHERE status = 'completed'
        GROUP BY payment_method
    ");
    $stmt->execute();
    $payment_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse([
        'success' => true,
        'data' => [
            'overview' => $overview,
            'orders_by_status' => $orders_by_status,
            'revenue_trend' => $revenue_trend,
            'top_products' => $top_products,
            'top_farmers' => $top_farmers,
            'category_stats' => $category_stats,
            'recent_activity' => $recent_activity,
            'payment_stats' => $payment_stats
        ],
        'period_days' => $period
    ]);

} catch (Exception $e) {
    jsonResponse(['error' => 'Operation failed: ' . $e->getMessage()], 500);
}
?>
