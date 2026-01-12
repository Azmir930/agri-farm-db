<?php
/**
 * Buyer Order History
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
    $user = requireApiRole('buyer');
    $database = new Database();
    $conn = $database->getConnection();

    // Get buyer ID
    $stmt = $conn->prepare("SELECT id FROM Buyer WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);
    $buyer = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$buyer) {
        jsonResponse(['error' => 'Buyer profile not found'], 404);
    }

    $buyer_id = $buyer['id'];

    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 10);
    $status = sanitize($_GET['status'] ?? '');
    $order_id = sanitize($_GET['id'] ?? '');

    // Single order view
    if ($order_id) {
        $stmt = $conn->prepare("
            SELECT o.*, 
                   a.street, a.city, a.state, a.postal_code, a.country,
                   p.status as payment_status, p.payment_method, p.paid_at,
                   d.status as delivery_status, d.tracking_number, d.estimated_delivery, d.delivered_at
            FROM Orders o
            LEFT JOIN Address a ON o.shipping_address_id = a.id
            LEFT JOIN Payment p ON o.id = p.order_id
            LEFT JOIN Delivery d ON o.id = d.order_id
            WHERE o.id = ? AND o.buyer_id = ?
        ");
        $stmt->execute([$order_id, $buyer_id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            jsonResponse(['error' => 'Order not found'], 404);
        }

        // Get order items
        $stmt = $conn->prepare("
            SELECT oi.*, pr.name as product_name, u.abbreviation as unit_abbr,
                   f.farm_name,
                   (SELECT image_url FROM Product_Image WHERE product_id = pr.id AND is_primary = TRUE LIMIT 1) as product_image
            FROM Order_Items oi
            JOIN Product pr ON oi.product_id = pr.id
            JOIN Unit_Of_Measure u ON pr.unit_id = u.id
            JOIN Farmer f ON pr.farmer_id = f.id
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$order_id]);
        $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        jsonResponse(['success' => true, 'data' => $order]);
    }

    // Order listing
    $where = "WHERE o.buyer_id = ?";
    $params = [$buyer_id];

    if ($status) {
        $where .= " AND o.status = ?";
        $params[] = $status;
    }

    // Get total count
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM Orders o $where");
    $stmt->execute($params);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    $pagination = getPagination($page, $limit, $total);

    // Get orders
    $params[] = $limit;
    $params[] = $pagination['offset'];

    $stmt = $conn->prepare("
        SELECT o.id, o.total_amount, o.status, o.created_at,
               d.status as delivery_status,
               (SELECT COUNT(*) FROM Order_Items WHERE order_id = o.id) as item_count
        FROM Orders o
        LEFT JOIN Delivery d ON o.id = d.order_id
        $where
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute($params);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse([
        'success' => true,
        'data' => $orders,
        'pagination' => $pagination
    ]);

} catch (Exception $e) {
    jsonResponse(['error' => 'Operation failed: ' . $e->getMessage()], 500);
}
?>
