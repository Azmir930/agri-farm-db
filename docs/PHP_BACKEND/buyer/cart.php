<?php
/**
 * Buyer Shopping Cart
 * Agriculture Product Marketplace
 * Note: Cart is stored in session/localStorage on frontend
 * This endpoint validates cart and calculates totals
 */

require_once '../config/database.php';
require_once '../config/helpers.php';
require_once '../auth/middleware.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $conn = $database->getConnection();

    switch ($method) {
        case 'POST':
            // Validate cart items and get current prices/availability
            $data = json_decode(file_get_contents("php://input"), true);
            $items = $data['items'] ?? [];

            if (empty($items)) {
                jsonResponse(['error' => 'Cart is empty'], 400);
            }

            $validated_items = [];
            $subtotal = 0;
            $errors = [];

            foreach ($items as $item) {
                $product_id = sanitize($item['product_id'] ?? '');
                $quantity = intval($item['quantity'] ?? 0);

                if (empty($product_id) || $quantity <= 0) {
                    continue;
                }

                // Get product details
                $stmt = $conn->prepare("
                    SELECT p.id, p.name, p.price, p.stock_quantity, p.min_order_quantity,
                           p.farmer_id, f.farm_name, u.abbreviation as unit_abbr,
                           (SELECT image_url FROM Product_Image WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
                    FROM Product p
                    JOIN Farmer f ON p.farmer_id = f.id
                    JOIN Unit_Of_Measure u ON p.unit_id = u.id
                    WHERE p.id = ? AND p.is_active = TRUE
                ");
                $stmt->execute([$product_id]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    $errors[] = "Product not found: $product_id";
                    continue;
                }

                if ($product['stock_quantity'] < $quantity) {
                    $errors[] = "Insufficient stock for {$product['name']}. Available: {$product['stock_quantity']}";
                    $quantity = $product['stock_quantity'];
                }

                if ($quantity < $product['min_order_quantity']) {
                    $errors[] = "Minimum order for {$product['name']} is {$product['min_order_quantity']}";
                    $quantity = $product['min_order_quantity'];
                }

                if ($quantity > 0) {
                    $item_subtotal = $product['price'] * $quantity;
                    $validated_items[] = [
                        'product_id' => $product['id'],
                        'name' => $product['name'],
                        'price' => $product['price'],
                        'quantity' => $quantity,
                        'unit' => $product['unit_abbr'],
                        'subtotal' => $item_subtotal,
                        'farmer_id' => $product['farmer_id'],
                        'farm_name' => $product['farm_name'],
                        'image' => $product['image'],
                        'available_stock' => $product['stock_quantity']
                    ];
                    $subtotal += $item_subtotal;
                }
            }

            // Calculate delivery fee (simplified - could be based on location/weight)
            $delivery_fee = $subtotal > 1000 ? 0 : 50; // Free delivery over 1000
            $tax = $subtotal * 0.05; // 5% tax
            $total = $subtotal + $delivery_fee + $tax;

            jsonResponse([
                'success' => true,
                'items' => $validated_items,
                'summary' => [
                    'subtotal' => round($subtotal, 2),
                    'delivery_fee' => round($delivery_fee, 2),
                    'tax' => round($tax, 2),
                    'total' => round($total, 2),
                    'item_count' => count($validated_items)
                ],
                'errors' => $errors
            ]);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }

} catch (Exception $e) {
    jsonResponse(['error' => 'Operation failed: ' . $e->getMessage()], 500);
}
?>
